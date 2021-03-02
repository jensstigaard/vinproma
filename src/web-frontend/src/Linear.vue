<template lang="pug">
.linear-progress-bars
  .preview-inputs
    transition-group(name='fade', tag='div')
      .item(v-for='(preview, i) in data.inPreview' :key="`preview-${i}`")
        .position-bar(:style='positionStyle(preview)')
        .text-overlays
          div
            span {{ preview.title }}
            span(style='display: inline-block; padding: 0 10px') &mdash;
            span 
              | {{ positionText(preview) }}
              | / {{ durationText(preview) }}
              | /&nbsp;
              span(:style='remainingWarning(preview) ? "font-weight:bold" : ""')
                | {{ remainingText(preview) }}
  .program-inputs
    transition-group(name='fade', tag='div')
      .item(v-for='(program, i) in data.inProgram' :key="`program-${i}`")
      .position-bar(:style='positionStyle(program)')
      .text-overlays
        .duration
          | {{ positionText(program) }}
          | / {{ durationText(program) }}
          | /&nbsp;
          span(:style='remainingWarning(program) ? "font-weight:bold" : ""') {{ remainingText(program) }}
        .title {{ program.title }}
</template>

<script>
import baseMixin from './mixin'

export default {
  mixins: [baseMixin],

  props: {
    data: Object,
  },
}
</script>
