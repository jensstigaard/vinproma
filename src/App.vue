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
          div
            h4 HTML view
            v-btn(block @click="htmlLightMode")
              span Light mode: 
              small {{ htmlLightModeAddress }}
            v-btn(block @click="htmlDarkMode")
              span Dark mode: 
              small {{ htmlDarkModeAddress }}
          hr.my-2
          div 
            h4 XAML mode
            div Upcoming...
</template>

<script lang="ts">
import { ipcRenderer, shell } from 'electron'
import ip from 'ip'
import Vue from 'vue'
import Component from 'vue-class-component'
import { Watch } from 'vue-property-decorator'

import { XmlInputMapper, XmlApiDataParser, XmlOverlayChannels, XmlTransitions } from 'vmix-js-utils'

import AppBar from './AppBar.vue'
import { TallySummary } from 'vmix-js-utils/dist/types/tcp'
// import PreviewRow from './PreviewRow.vue'

const FETCH_XML_DATA_INTERVAL: number = 1000 // ms

const sleep = (m: number) => new Promise(r => setTimeout(r, m))

// import webio from './webserver'

@Component({
  components: {
    AppBar
    // PreviewRow
  }
})
export default class App extends Vue {
  programInput: any | null = null
  previewInput: any | null = null

  tallyInfo: TallySummary | null = null

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
          'title',
          'state',
          'duration',
          'position'
        ])
      )

      if (!this.tallyInfo) {
        return
      }

      const tallyInfo = this.tallyInfo

      this.programInput = inputs[tallyInfo.program[0] - 1]

      this.previewInput = tallyInfo.preview.length ? inputs[tallyInfo.preview[0] - 1] : null
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

  get htmlLightModeAddress() {
    return `http://${ip.address()}:8095`
  }

  get htmlDarkModeAddress() {
    return `http://${ip.address()}:8095/dark`
  }

  htmlLightMode() {
    // Open url
    shell.openExternal(this.htmlLightModeAddress)
  }

  htmlDarkMode() {
    // Open url
    shell.openExternal(this.htmlDarkModeAddress)
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

#connection-status
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5)
</style>
