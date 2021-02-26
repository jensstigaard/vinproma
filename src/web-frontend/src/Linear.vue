<template lang="pug">
.linear-progress-bars
  transition(name='fade')
    .preview(v-if='preview')
      .position-bar(:style='positionStyle(preview)')
      .text-overlays
        div
          span {{ preview.title }}
          span(style='display: inline-block; padding: 0 10px') &mdash;
          span 
            | {{ positionText(preview) }}
            | / {{ durationText(preview) }}
            | /
            span(:style='remainingWarning(preview) ? "font-weight:bold" : ""')
              | {{ remainingText(preview) }}
  .program
    .position-bar(:style='positionStyle(program)')
    .text-overlays
      .duration
        | {{ positionText(program) }}
        | / {{ durationText(program) }}
        | /
        span(:style='remainingWarning(program) ? "font-weight:bold" : ""') {{ remainingText(program) }}
      .title {{ program.title }}
</template>

<script>
import baseMixin from './mixin'

export default {
  mixins: [baseMixin],

  props: {
    program: Object,
    preview: Object,
  },
}
</script>
