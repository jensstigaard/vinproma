<template lang="pug">
div.pt-7.pr-2
  v-slider(
    v-model="delayCompensation"
    :min="range[0]"
    :max="range[1]"
    :step="step"
    :thumb-size="40"
    thumb-label="always"
    hide-details
  )
    template(v-slot:thumb-label="{ value }") {{ value }}ms
    template(v-slot:prepend)
      v-text-field(
        v-model="delayCompensation"
        hide-details
        single-line
        dense
        type="number"
        :step="step"
        :min="range[0]"
        :max="range[1]"
        style="width: 55px"
      ).mt-0.pt-0
  v-subheader: b Delay compensation
    v-tooltip(bottom)
      template(v-slot:activator="{ on }")
        v-btn(icon v-on="on" color="grey" style="cursor:help")
          v-icon(small) fa-question-circle
      span Do you experience the progress feeded back to be delayed? Use this setting to compensate for the delay in the communication.

</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Debounce } from 'vue-debounce-decorator'

@Component({})
export default class DelayCompensationSlider extends Vue {
  delayCompensation: number = this.$store.state.delayCompensation

  range: [number, number] = [-500, 0]
  step: number = 5 // ms

  @Watch('delayCompensation')
  @Debounce(300)
  onDelayCompensationChanged(val: any, oldval: any) {
    this.$store.dispatch('setDelayCompensation', val)
  }
}
</script>
