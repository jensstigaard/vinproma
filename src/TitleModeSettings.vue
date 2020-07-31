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
					small Feed progress back to a title input in vMix. 
					| A XAML title is recommended, since it can show progress as a progress bar.
		
		v-col: v-checkbox(
			v-model="settings.enabled"
			label="Enabled"
			:disabled="!settings.enabled && validFormData"
		)

	div
		div(v-if="!titles.length")
			v-alert(v-show="settings.enabled" type="warning" outlined) No title inputs (GT or Xaml) found in vMix instance...
		div(v-else)
			// Select title
			v-select(
				dense
				v-model="settings.input"
				label="Title"
				:items="titles"
				item-text="nice"
				item-value="key"
			)
			div(v-show="settings.input")
				// Select text field
				v-select(
					v-model="settings.textField"
					label="Text field"
					:items="fieldsAvailable('textField')"
					item-text="nice"
					item-value="name"
				)
				// Select text field
				v-select(
					v-model="settings.textField"
					label="Text field"
					:items="fieldsAvailable('textField')"
					item-text="nice"
					item-value="name"
				)
				// Select width field
				v-select(
					dense
					v-model="settings.widthField"
					label="Width field"
					:items="fieldsAvailable('widthField')"
					item-text="nice"
					item-value="name"
				)
				// Total width for Width field
				v-text-field(
					v-if="settings.widthField"
					dense
					v-model="settings.totalWidthForWidthField"
					label="Total width for Width field"
				)
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({})
export default class titleModeSettings extends Vue {
  @Prop(Array) readonly titles!: any[]

  settings: {
    enabled: boolean
    input: string | null
    textField: string | null
    widthField: string | null
    totalWidthForWidthField: number
  } = JSON.parse(JSON.stringify(this.$store.state.titleMode))

  @Watch('settings', { deep: true })
  onSettingsChanged(val: any, oldval: any) {
    console.log('Title mode Settings changed', val)

    if (!this.validFormData) {
      return
    }

    // Save to store
    this.$store.dispatch('saveTitleModeSettings', val)
  }

  get validFormData() {
    // Check for valid form data

    // input must be selected
    if (!this.settings.input) {
      return false
    }

    return (
      // No fields selected at all
      !(this.settings.textField && this.settings.widthField) &&
      // WidthField cannot be same field as TextField
      this.settings.widthField !== this.settings.textField &&
      // When hvaing width field selected total width should also be defined
      (!this.settings.widthField || this.settings.totalWidthForWidthField)
    )
  }

  get fieldsInSelectedTitle() {
    const title = this.titles.find(title => title.key)

    if (!title) {
      return []
    }

    return title.fields.map((f: any, index: number) => ({
      nice: `${index} - ${f.name}`,
      ...f
    }))
  }

  fieldsAvailable(type: string) {
    const oppositeType = type === 'widthField' ? 'textField' : 'widthField'

    const fields = this.fieldsInSelectedTitle.filter((field: any) => {
      if (this.settings[oppositeType]) {
        return field.name !== this.settings[oppositeType]
      }
      return true
    })
    return [{ name: null, nice: '----------' }, ...fields]
  }
}
</script>
