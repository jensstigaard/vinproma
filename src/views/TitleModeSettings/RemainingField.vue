<template lang="pug">
v-row
  // Remove icon
  v-btn(icon small @click="$emit('remove')").mt-3
    v-icon(small) fa-times

  // Select title for field
  v-col(v-show="!sameInputForAllFields"): v-select(
    v-model="configuredField.inputKey"
    label="Title"
    dense
    :items="titles"
    item-text="nice"
    item-value="key"
  )

  // Select text field in title
  v-col: v-select(
    v-model="configuredField.selectedName"
    label="Text field"
    dense
    :items="fieldsAvailable()"
    item-text="nice"
    item-value="name"
  )

</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { TitleModeRemainingField } from '@/types/title-mode'

@Component({})
export default class RemainingField extends Vue {
  @Prop(Boolean) readonly sameInputForAllFields!: boolean

  @Prop(Array) readonly titles!: any[]

  @Prop(Object) readonly configuredField!: TitleModeRemainingField

  get fieldsInSelectedTitle() {
    const title = this.titles.find(title => title.key === this.configuredField.inputKey)

    if (!title) {
      return []
    }

    return (
      title.fields
        // Filter only text fields
        .filter((f: any) => f.type === 'text')
        // Map with nice formatted text
        .map((f: any, index: number) => ({
          nice: `${index} - ${f.name}`,
          ...f
        }))
    )
  }

  // To present in select dropdown
  fieldsAvailable() {
    return [
      // Null entry
      { name: null, nice: '----------' },
      // Retrieved fields in title
      ...this.fieldsInSelectedTitle
    ]
  }
}
</script>
