<template lang="pug">
  v-app
    app-bar

    v-content
      v-container(v-if="!$vMixConnection.connected")
        div.text-center
          v-icon(color="orange") fa-exclamation-circle
          div: b Not yet connected to vMix instance...
          div Please check whether the entered IP address ({{ $store.state.vMixConnection.host }}) is correct...
      v-container(fluid v-else)
        div(v-if="!tallyInfo") No inputs found somehow...
        div(v-else)
          div: v-row
            v-col: html-views
            v-divider(vertical)
            v-col: vmix-title-mode-settings(:titles="titles")
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'

import { XmlInputMapper, XmlApiDataParser } from 'vmix-js-utils'
import { TallySummary } from 'vmix-js-utils/dist/types/tcp'

import AppBar from './AppBar.vue'
import HtmlViews from './HtmlViews.vue'
import VmixTitleModeSettings from './TitleModeSettings.vue'
import { durationNice } from './utility/time'
// import PreviewRow from './PreviewRow.vue'

const FETCH_XML_DATA_INTERVAL: number = 1000 // ms

const sleep = (m: number) => new Promise(r => setTimeout(r, m))

// import webio from './webserver'

@Component({
  components: {
    AppBar,
    VmixTitleModeSettings,
    HtmlViews
    // PreviewRow
  }
})
export default class App extends Vue {
  programInput: any | null = null
  previewInput: any | null = null

  tallyInfo: TallySummary | null = null
  titles: { [key: string]: any }[] = []

  xmlDataInterval: any | null = null

  lastSentData: string = ''

  created() {
    // @ts-ignore
    this.setVmixConnection(this.$store.state.vMixConnection.host, { debug: true })
  }

  @Watch('programInput')
  onProgramInputChanged(val: any, oldval: any) {
    this.sendUpdatedData()
  }
  @Watch('previewInput')
  onPreviewInputChanged(val: any, oldval: any) {
    this.sendUpdatedData()
  }

  @Watch('$vMixConnection.connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    // console.log('Connected changed', isConnected)

    // If not connected anymore - do not attempt to send requests for XML data
    if (!isConnected) {
      clearInterval(this.xmlDataInterval)
      this.xmlDataInterval = null
      return
    }

    // Connected
    // Add address to previous known addresses
    this.$store.dispatch('addHostToPreviousConnectedVmixHosts')

    // @ts-ignore
    this.$vMixConnection!.send('SUBSCRIBE TALLY')

    // @ts-ignore
    this.$vMixConnection!.on('tally', (tallySummary: TallySummary) => {
      // console.log('Tally summary:', tallySummary)

      this.tallyInfo = tallySummary
    })

    // Request XML data each Xth second to update input titles
    // @ts-ignore
    this.$vMixConnection!.on('xml', (xmlRawData: string) => {
      const xmlContent = XmlApiDataParser.parse(xmlRawData)

      const inputs = Object.values(
        XmlInputMapper.mapInputs(XmlInputMapper.extractInputsFromXML(xmlContent), [
          'type',
          'fields',
          'title',
          'state',
          'duration',
          'position'
        ])
      ) as any[]

      this.titles = inputs.filter((input: { type: string }) => ['GT', 'Xaml'].includes(input.type))

      if (!this.tallyInfo) {
        return
      }

      const tallyInfo = this.tallyInfo

      this.programInput = inputs[tallyInfo.program[0] - 1]

      // Parse preview input if not the same as in program,
      // and the input has duration attribute
      // Otherwise just set to null
      this.previewInput =
        tallyInfo.preview.length &&
        inputs[tallyInfo.preview[0] - 1].duration &&
        Number(inputs[tallyInfo.preview[0] - 1].duration)
          ? inputs[tallyInfo.preview[0] - 1]
          : null

      const titleMode = this.$store.state.titleMode
      if (titleMode.enabled) {
        const inputKey = titleMode.input

        // Text field
        if (titleMode.textField) {
          const pos = durationNice(Math.floor(this.programInput.position / 1000))
          const dur = durationNice(Math.floor(this.programInput.duration / 1000))

          // @ts-ignore
          this.$vMixConnection!.send({
            Function: 'SetText',
            Input: inputKey,
            SelectedName: titleMode.textField,
            Value: `${pos} / ${dur}`
          })
        }

        // Width field
        if (titleMode.widthField) {
          // @ts-ignore
          this.$vMixConnection!.send({
            Function: 'SetText',
            Input: inputKey,
            SelectedName: titleMode.widthField,
            Value:
              (titleMode.totalWidthForWidthField *
                Math.round((this.programInput.position / this.programInput.duration) * 100)) /
              100
          })
        }
      }
    })

    this.xmlDataInterval = setInterval(() => {
      if (this.tallyInfo) {
        // @ts-ignore
        this.$vMixConnection!.send(`XML`)
      }
    }, FETCH_XML_DATA_INTERVAL)
  }

  @Watch('$store.state.vMixConnection.host')
  onHostChanged(val: string, oldval: string) {
    const newHost = val
    // @ts-ignore
    this.setVmixConnection(newHost, { debug: true })
  }

  async sendUpdatedData() {
    const data = {
      program: this.programInput,
      preview: this.previewInput
    }

    const message = JSON.stringify(data)

    // Guard if last sent data is equal to this message
    if (this.lastSentData === message) {
      return
    }

    this.lastSentData = message

    ipcRenderer.send('vMixInfo', message)
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

#connection-status
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5)
</style>
