<template lang="pug">
div
  h4
    span Remaining
    // Add button
    v-btn(
      v-show="!configuredFields.length || isDataValidToPersist"
      icon small
      @click="addField"
    )
      v-icon(small color="green") fa-plus

  div(v-show="!configuredFields.length"): small Click + above to add
  
  remaining-field(
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

import { TitleModeRemainingField } from '@/types/title-mode'

import RemainingField from './RemainingField.vue'

@Component({
  components: {
    RemainingField
  }
})
export default class RemainingFields extends Vue {
  @Prop(Boolean) readonly sameInputForAllFields!: boolean

  @Prop(Array) readonly titles!: any[]

  @Prop(Array) readonly configuredFields!: TitleModeRemainingField[]
  @Prop(Boolean) readonly isDataValidToPersist!: boolean

  async addField() {
    // @ts-ignore
    this.configuredFields.push({ inputKey: null, selectedName: null })
  }
}
</script>
