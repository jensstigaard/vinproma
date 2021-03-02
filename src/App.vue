<template lang="pug">
v-app
  app-bar

  v-main
    v-container(v-if='!$vMixConnection.connected')
      .text-center
        v-icon(color='orange') fa-exclamation-circle
        div: b Not yet connected to vMix instance...
        div Please check whether the entered IP address ({{ $store.state.vMixConnection.host }}) is correct...
    v-container(fluid, v-else)
      div(v-if='!tallyInfo') No inputs found somehow...
      div(v-else)
        v-row
          v-col: delay-compensation-slider

          v-divider(vertical)

          v-col: html-views

        v-divider.my-4

        vmix-title-mode-settings(:titles='titles')
</template>

<script lang="ts">
// Core
import { ipcRenderer } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'

// Modules util
import { XmlInputMapper, XmlApiDataParser, XmlOverlayChannels } from 'vmix-js-utils'
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
  TitleModeRemainingField,
} from './types/title-mode'

// Interval for fetching XML data
const FETCH_XML_DATA_INTERVAL: number = 200 // ms

// Helper
const sleep = (m: number) => new Promise((r) => setTimeout(r, m))

@Component({
  components: {
    AppBar,
    DelayCompensationSlider,
    HtmlViews,
    VmixTitleModeSettings,
  },
})
export default class App extends Vue {
  programInputs: { [key: string]: any }[] = []
  previewInputs: { [key: string]: any }[] = []
  overlayChannels: {
    1: { [key: string]: any } | null
    2: { [key: string]: any } | null
    3: { [key: string]: any } | null
    4: { [key: string]: any } | null
  } = {
    1: null,
    2: null,
    3: null,
    4: null,
  }

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

      // Send XML request on tally info received
      // @ts-ignore
      this.$vMixConnection!.send(`XML`)
    })

    // Request XML data each Xth second to update input titles
    // @ts-ignore
    this.$vMixConnection!.on('xml', (xmlRawData: string) => {
      const xmlContent = XmlApiDataParser.parse(xmlRawData)
      const overlayChannels = Object.entries(XmlOverlayChannels.extract(xmlContent))
      const inputNumbersInOverlay = overlayChannels
        .map(([_number, overlayChannel]) => overlayChannel.inputNumber)
        .filter((inputNumber) => inputNumber !== null) as number[]

      const inputs = Object.values(
        XmlInputMapper.mapInputs(XmlInputMapper.extractInputsFromXML(xmlContent), [
          'number',
          'type',
          'fields', // for titles
          'title',
          'state', // Running, Paused
          'duration',
          'position',
          'loop',
        ]) as { [key: string]: any }
      ).map((input: { [key: string]: any }) => {
        input.number = Number(input.number)
        input.duration = Number(input.duration)
        input.position = Number(input.position)
        return input
      })

      this.titles = inputs
        .map((input: { [key: string]: any }) => {
          input.nice = `${input.number} - ${input.title}`
          return input
        })
        .filter((input: { [key: string]: any }) => ['GT', 'Xaml'].includes(input.type))

      // console.log('Total inputs', inputs.length, 'titles', this.titles.length)

      const tallyInfo = this.tallyInfo // Can be null

      const hasFreeProgramInputsLeft =
        !tallyInfo ||
        inputNumbersInOverlay.filter((inputNumber) => tallyInfo.program.includes(inputNumber))
          .length < tallyInfo.program.length

      const hasFreePreviewInputsLeft =
        !tallyInfo ||
        inputNumbersInOverlay.filter((inputNumber) => tallyInfo.preview.includes(inputNumber))
          .length < tallyInfo.preview.length

      const programInputNumbers =
        tallyInfo !== null && hasFreeProgramInputsLeft
          ? tallyInfo.program.filter((i) => inputs.length > i)
          : [XmlInputMapper.extractProgramFromXML(xmlContent)]

      // Parse preview inputs if not the same as in program,
      const previewInputNumbers =
        tallyInfo !== null && hasFreePreviewInputsLeft
          ? tallyInfo.preview.filter((i) => !programInputNumbers.includes(i) && inputs.length > i)
          : [XmlInputMapper.extractPreviewFromXML(xmlContent)]

      const programInputs = inputs.filter((input) => programInputNumbers.includes(input.number))
      const previewInputs = inputs.filter((input) => previewInputNumbers.includes(input.number))

      // console.log(programInputs.length, previewInputs.length)

      // Apply delay compensation
      const delayCompensation = this.$store.state.delayCompensation // ms

      const programInputsAppliedDelayCompensation = programInputs.map((input) => {
        const newPosition = Number(input.position) + delayCompensation
        input.position = newPosition < 0 ? 0 : newPosition
        // console.log('Compensated delay for program', input.position, newPosition)
        return input
      })
      const previewInputsAppliedDelayCompensation = previewInputs.map((input) => {
        const newPosition = Number(input.position) + delayCompensation
        input.position = newPosition < 0 ? 0 : newPosition
        // console.log('Compensated delay for preview', input.position, newPosition)
        return input
      })

      // Update program and preview input
      this.programInputs = programInputsAppliedDelayCompensation
      this.previewInputs = previewInputsAppliedDelayCompensation

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
  onHostChanged(newVal: string, _oldval: string) {
    const newHost = newVal
    // @ts-ignore
    this.$vMixConnection.setConnection(newHost, { debug: false })
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

    if (this.programInputs.length === 0) {
      return
    }

    // Use first input in program inputs list blindly
    const programInput = this.programInputs[0]

    // Prepare values for sending to vMix
    const pos = durationNice(Math.floor(programInput.position / 1000))
    const duration = durationNice(Math.floor(programInput.duration / 1000))

    const remaining = durationNice(
      Math.ceil((programInput.duration - programInput.position) / 1000)
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
          Value: output.join(''),
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
        Value: remaining,
      })
    })

    // Width fields stating program progress
    titleMode.fields.width.forEach((widthField: TitleModeWidthField) => {
      // Calculate current width
      const progressPercentage = programInput.position / programInput.duration

      const calculatedCurrentWidth: number =
        (widthField.totalWidth * Math.round(progressPercentage * 100)) / 100

      // console.log('Calculated current width', calculatedCurrentWidth)

      // @ts-ignore
      this.$vMixConnection!.send({
        Function: 'SetText',
        Input: widthField.inputKey,
        SelectedName: widthField.selectedName,
        Value: calculatedCurrentWidth,
      })
    })
  }

  async sendUpdatedDataToFrontend() {
    const data = {
      inProgram: this.programInputs,
      inPreview: this.previewInputs,
      overlayChannels: this.overlayChannels,
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
