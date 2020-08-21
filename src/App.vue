<template lang="pug">
  v-app
    app-bar

    v-main
      v-container(v-if="!$vMixConnection.connected")
        div.text-center
          v-icon(color="orange") fa-exclamation-circle
          div: b Not yet connected to vMix instance... {{ $vMixConnection.connected }}
          div Please check whether the entered IP address ({{ $store.state.vMixConnection.host }}) is correct...
      v-container(fluid v-else)
        div(v-if="!tallyInfo") No inputs found somehow...
        div(v-else)
          v-row
            v-col: delay-compensation-slider
            
            v-divider(vertical)

            v-col: html-views

          v-divider.my-4
          
          vmix-title-mode-settings(:titles="titles")

</template>

<script lang="ts">
// Core
import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'

// Modules util
import { XmlInputMapper, XmlApiDataParser } from 'vmix-js-utils'
import { TallySummary } from 'vmix-js-utils/dist/types/tcp'

// Utility
import { durationNice } from './utility/time'

// Views
import AppBar from './views/Layout/AppBar.vue'
import HtmlViews from './views/HtmlViews.vue'
import DelayCompensationSlider from './views/DelayCompensationSlider.vue'
import VmixTitleModeSettings from './views/TitleModeSettings/Index.vue'

// Types
import {
  TitleModeCurrentPositionField,
  TitleModeWidthField,
  TitleModeRemainingField
} from './types/title-mode'

// Interval for fetching XML data
const FETCH_XML_DATA_INTERVAL: number = 200 // ms

// Helper
const sleep = (m: number) => new Promise(r => setTimeout(r, m))

@Component({
  components: {
    AppBar,
    DelayCompensationSlider,
    HtmlViews,
    VmixTitleModeSettings
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
    // Set connection upon creation
    // @ts-ignore
    this.setVmixConnection(this.$store.state.vMixConnection.host, { debug: false })
  }

  @Watch('$vMixConnection.connected')
  onConnectedChanged(val: boolean, oldval: boolean) {
    const isConnected = val

    console.log('Connected changed', isConnected)

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

      // console.log('Total inputs', inputs.length)

      this.titles = inputs
        .map((input: { [key: string]: any }, index: number) => {
          input.number = index + 1
          input.nice = `${input.number} - ${input.title}`
          return input
        })
        .filter((input: { [key: string]: any }) => ['GT', 'Xaml'].includes(input.type))

      if (!this.tallyInfo) {
        return
      }

      const tallyInfo = this.tallyInfo

      const programInput = inputs[tallyInfo.program[0] - 1]
      // Parse preview input if not the same as in program,
      // and the input has duration attribute
      // Otherwise just set to null
      const previewInput =
        tallyInfo.preview.length &&
        inputs[tallyInfo.preview[0] - 1].duration &&
        Number(inputs[tallyInfo.preview[0] - 1].duration)
          ? inputs[tallyInfo.preview[0] - 1]
          : null

      // Apply delay compensation
      const delayCompensation = this.$store.state.delayCompensation // ms

      const programNewPosition = Number(programInput.position) + delayCompensation
      // console.log('Compensated delay for program', programInput.position, programNewPosition)
      programInput.position = programNewPosition < 0 ? 0 : programNewPosition

      if (previewInput) {
        const previewNewPosition = Number(previewInput.position) + delayCompensation
        previewInput.position = previewNewPosition < 0 ? 0 : previewNewPosition
      }

      // Update program and preview input
      this.programInput = programInput
      this.previewInput = previewInput

      this.sendUpdatedData()
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
    this.setVmixConnection(newHost, { debug: false })
  }

  async sendUpdatedData() {
    this.sendUpdatedDataToFrontend()

    // Is title mode enabled then send info back to vMix
    if (this.$store.state.titleMode.enabled) {
      this.sendUpdatedDataTitleMode()
    }
  }

  async sendUpdatedDataTitleMode() {
    const titleMode = this.$store.state.titleMode

    // Prepare values for sending to vMix
    const pos = durationNice(Math.floor(this.programInput.position / 1000))
    const duration = durationNice(Math.floor(this.programInput.duration / 1000))

    const remaining = durationNice(
      Math.ceil((this.programInput.duration - this.programInput.position) / 1000)
    )

    // Current position fields
    titleMode.fields.currentPosition.forEach(
      (currentPositionField: TitleModeCurrentPositionField) => {
        const output = [`${pos} / ${duration}`]

        // Include remaining text?
        if (currentPositionField.includeRemaining) {
          output.push(` / ${remaining}`)
        }

        // console.log('Sending current position to vMix title field', currentPositionField, output)

        // @ts-ignore
        this.$vMixConnection!.send({
          Function: 'SetText',
          Input: currentPositionField.inputKey,
          SelectedName: currentPositionField.selectedName,
          Value: output.join('')
        })
      }
    )

    // Remaining fields
    titleMode.fields.remaining.forEach((remainingField: TitleModeRemainingField) => {
      // @ts-ignore
      this.$vMixConnection!.send({
        Function: 'SetText',
        Input: remainingField.inputKey,
        SelectedName: remainingField.selectedName,
        Value: remaining
      })
    })

    // Width fields stating program progress
    titleMode.fields.width.forEach((widthField: TitleModeWidthField) => {
      // Calculate current width
      const progressPercentage = this.programInput.position / this.programInput.duration

      const calculatedCurrentWidth: number =
        (widthField.totalWidth * Math.round(progressPercentage * 100)) / 100

      // console.log('Calculated current width', calculatedCurrentWidth)

      // @ts-ignore
      this.$vMixConnection!.send({
        Function: 'SetText',
        Input: widthField.inputKey,
        SelectedName: widthField.selectedName,
        Value: calculatedCurrentWidth
      })
    })
  }

  async sendUpdatedDataToFrontend() {
    const data = {
      program: this.programInput,
      preview: this.previewInput
    }

    const message = JSON.stringify(data)

    // Guard if last sent data is equal to this message
    if (this.lastSentData === message) {
      return
    }

    // Send vMix info data to main (background) thread
    ipcRenderer.send('vMixInfo', message)

    this.lastSentData = message
  }
}
</script>

<style lang="sass">
hr
  border-top: 1px solid #E9E9E9

#connection-status
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.5)
</style>
