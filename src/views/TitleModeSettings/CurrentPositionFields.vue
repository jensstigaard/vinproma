<template lang="pug">
div
  h4
    span Current Position ({{ configuredFields.length }})
    v-btn(
      v-show="!configuredFields.length || isDataValidToPersist"
      icon small
      @click="addField"
    )
      v-icon(small color="green") fa-plus

  div(v-show="!configuredFields.length"): small Click + above to add

  current-position-field(
    v-for="(configuredField, index) in configuredFields"
    :key="index"
    :titles="titles"
    :same-input-for-all-fields="sameInputForAllFields"
    :configured-field="configuredField"
    @remove="configuredFields.splice(index, 1)"
  )
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { TitleModeCurrentPositionField } from '@/types/title-mode'

import CurrentPositionField from './CurrentPositionField.vue'

@Component({
  components: {
    CurrentPositionField
  }
})
export default class CurrentPositionFields extends Vue {
  @Prop(Boolean) readonly sameInputForAllFields!: boolean

  @Prop(Array) readonly titles!: any[]

  @Prop(Array) readonly configuredFields!: TitleModeCurrentPositionField[]
  @Prop(Boolean) readonly isDataValidToPersist!: boolean

  async addField() {
    // @ts-ignore
    this.configuredFields.push({ inputKey: null, selectedName: null, includeRemaining: false })
  }
}
</script>
