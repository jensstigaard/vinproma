<template lang="pug">
v-row
  // Remove icon
  v-btn(icon small @click="$emit('remove')").mt-3
    v-icon(small) fa-times

  // Select title for field
  v-col(v-show="!sameInputForAllFields").pt-0: v-select(
    dense
    v-model="configuredField.inputKey"
    label="Title"
    :items="titles"
    item-text="nice"
    item-value="key"
  )

  // Select text field in title
  v-col.pt-0: v-select(
    v-model="configuredField.selectedName"
    label="Text field"
    :items="fieldsAvailable()"
    item-text="nice"
    item-value="name"
  )

  v-checkbox(
    v-model="configuredField.includeRemaining"
    label="Include remaining"
  )
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

import { TitleModeCurrentPositionField } from '@/types/title-mode'

@Component({})
export default class CurrentPositionField extends Vue {
  @Prop(Boolean) readonly sameInputForAllFields!: boolean

  @Prop(Array) readonly titles!: any[]

  @Prop(Object) readonly configuredField!: TitleModeCurrentPositionField

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
