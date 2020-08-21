<template lang="pug">
div(style="margin-top: -30px")
  v-row
    v-col
      h3.pt-5
        span vMix Title mode
        v-tooltip(bottom)
          template(v-slot:activator="{ on }")
            v-btn(icon v-on="on" color="grey" style="cursor:help")
              v-icon(small) fa-question-circle
          span Feed progress back to a title input in vMix. 
            | You can feed back to vMix as many fields you desired, both current position, remaining and with fields. 
            | A XAML title is recommended, since it can present as a progress bar. 
    
    v-col: v-checkbox(
      v-model="settings.enabled"
      label="Enabled"
      :disabled="!settings.enabled && !validFormData"
    )

  div
    div(v-if="!titles.length")
      // Show alert when there is no titles and the title mode is enabled
      v-alert(v-show="settings.enabled" type="warning" outlined)
        | No title inputs (GT or Xaml) found in vMix instance...
    div(v-else)
      v-row(style="margin-top:-20px")
        // Use same input for all fields
        v-col: v-checkbox(
            v-model="settings.sameInputForAllFields"
            label="Same input for all fields"
          )

        // If checked that same input should be used for all fields
        // Then show select
        v-col(v-show="settings.sameInputForAllFields")
          // Select title for all fields
          v-select(
            v-model="inputForAllFields"
            label="Title"
            :items="titles"
            item-text="nice"
            item-value="key"
          )

      v-divider

      v-alert(v-if="settings.sameInputForAllFields && !checkedInputForAllFields" type="warning")
        v-row
          div Select a title for all fields in the select dropdown right above
          v-spacer
          v-icon(small).mr-2 fa-arrow-up

      div.pt-3
        // Current position fields
        current-position-fields(
          :titles="titles"
          :same-input-for-all-fields="settings.sameInputForAllFields"
          :configured-fields="settings.fields.currentPosition"
          :is-data-valid-to-persist="validateCurrentPositionFields"
        )

        //- v-divider(vertical)

        // Remaining fields
        remaining-fields(
          :titles="titles"
          :same-input-for-all-fields="settings.sameInputForAllFields"
          :configured-fields="settings.fields.remaining"
          :is-data-valid-to-persist="validateRemainingFields"
        )

        //- v-divider(vertical)

        // Width fields
        width-fields(
          :titles="titles"
          :same-input-for-all-fields="settings.sameInputForAllFields"
          :configured-fields="settings.fields.width"
          :is-data-valid-to-persist="validateWidthFields"
        )
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import CurrentPositionFields from './CurrentPositionFields.vue'
import RemainingFields from './RemainingFields.vue'
import WidthFields from './WidthFields.vue'

import {
  TitleModeSettings,
  TitleModeCurrentPositionField,
  TitleModeRemainingField,
  TitleModeWidthField
} from '@/types/title-mode'

@Component({
  components: {
    CurrentPositionFields,
    RemainingFields,
    WidthFields
  }
})
export default class TitleModeSettingsIndex extends Vue {
  @Prop(Array) readonly titles!: any[]

  settings: TitleModeSettings = JSON.parse(JSON.stringify(this.$store.state.titleMode))

  inputForAllFields: null | string = null

  created() {
    const titleModeSettings = this.$store.state.titleMode

    if (titleModeSettings.sameInputForAllFields) {
      const inputKey = titleModeSettings.fields.currentPosition.length
        ? titleModeSettings.fields.currentPosition[0].inputKey
        : titleModeSettings.fields.remaining.length
        ? titleModeSettings.fields.remaining[0].inputKey
        : titleModeSettings.fields.width.length
        ? titleModeSettings.fields.width[0].inputKey
        : null

      this.inputForAllFields = inputKey
    }
  }

  @Watch('settings', { deep: true })
  onSettingsChanged(val: any, oldval: any) {
    if (!this.validFormData) {
      return
    }

    console.log('Title mode Settings changed', val)

    // Save to store
    this.$store.dispatch('saveTitleModeSettings', val)
  }

  get validateCurrentPositionFields(): boolean {
    // Assuming all is good unless some validation error is found during iteration
    let returnValue: boolean = true

    // Iterate over all fields for current position and check it has input and selected name
    this.settings.fields.currentPosition.forEach((field: TitleModeCurrentPositionField) => {
      // Overwrite input key if checked same input for all fields
      if (this.settings.sameInputForAllFields && this.checkedInputForAllFields) {
        field.inputKey = this.checkedInputForAllFields
      }

      // Check input key and field selected (selectedName)
      if (!field.inputKey || !field.selectedName) {
        returnValue = false
        return
      }

      const title = this.titles.find(t => t.key === field.inputKey)

      if (!title) {
        returnValue = false
        return
      }

      const titleField = title.fields.find((f: any) => f.name === field.selectedName)

      if (titleField === null) {
        returnValue = false
        return
      }
    })

    return returnValue
  }

  get validateRemainingFields(): boolean {
    // Assuming all is good unless some validation error is found during iteration
    let returnValue: boolean = true

    // Iterate over all fields for remaining and check it has input and selected name
    this.settings.fields.remaining.forEach((field: TitleModeRemainingField) => {
      // Overwrite input key if checked same input for all fields
      if (this.settings.sameInputForAllFields && this.checkedInputForAllFields) {
        field.inputKey = this.checkedInputForAllFields
      }

      // Check input key and field selected (selectedName)
      if (!field.inputKey || !field.selectedName) {
        returnValue = false
        return
      }

      const title = this.titles.find(t => t.key === field.inputKey)

      if (!title) {
        returnValue = false
        return
      }

      const titleField = title.fields.find((f: any) => f.name === field.selectedName)

      if (titleField === null) {
        returnValue = false
        return
      }
    })

    return returnValue
  }

  get validateWidthFields(): boolean {
    // Assuming all is good unless some validation error is found during iteration
    let returnValue: boolean = true

    // Iterate over all fields for width and check it has input and selected name
    this.settings.fields.width.forEach((field: TitleModeWidthField) => {
      // Overwrite input key if checked same input for all fields
      if (this.settings.sameInputForAllFields && this.checkedInputForAllFields) {
        field.inputKey = this.checkedInputForAllFields
      }

      // Check input key and field selected (selectedName)
      if (!field.inputKey || !field.selectedName || !field.totalWidth) {
        returnValue = false
        return
      }

      // Check total width inputted - mu
      if (!field.totalWidth || field.totalWidth <= 0 || field.totalWidth > 9999) {
        returnValue = false
        return
      }

      const title = this.titles.find(t => t.key === field.inputKey)

      if (!title) {
        returnValue = false
        return
      }

      const titleField = title.fields.find((f: any) => f.name === field.selectedName)

      if (titleField === null) {
        returnValue = false
        return
      }
    })

    return returnValue
  }

  get validFormData(): boolean {
    // Check for valid form data
    const settings = this.settings
    const fields = settings.fields

    // Not valid if no fields added at all
    if (!fields.currentPosition.length && !fields.remaining.length && !fields.width.length) {
      return false
    }

    if (!this.validateCurrentPositionFields) {
      return false
    }
    if (!this.validateRemainingFields) {
      return false
    }
    if (!this.validateWidthFields) {
      return false
    }

    return true
  }

  get checkedInputForAllFields(): string | null {
    if (!this.settings.sameInputForAllFields) {
      return null
    }

    const title = this.titles.find(t => t.key === this.inputForAllFields)

    if (!title) {
      return null
    }

    return title.key
  }
}
</script>
