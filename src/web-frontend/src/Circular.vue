<template lang="pug">
.flex.flex-row.circular-progress-bars
  // Preview column
  div(class='w-1/2')
    .preview-inputs.text-center
      big Preview
      // Save as program statement
      div(v-if='!data.inPreview.length', key='preview-same-as-program', style='opacity: 0.5') Same as program

      transition-group.flex.flex-wrap.justify-items-center(name='fade', tag='div')
        .item.flex-grow(v-for='(preview, i) in data.inPreview', :key='`preview-${i}`')
          // Circular progress
          circle-counter(
            ref='circularPreview',
            size='280',
            :dash-count='durationSeconds(preview)',
            :active-count='positionSeconds(preview)',
            :text='counterText(preview)'
          )
          // Title
          .title {{ preview.title }}
          div(v-if='preview.state === "Paused"') Paused
          div(v-if='preview.loop === "True"') Looping

  // Program column
  div(class='w-1/2')
    .program-inputs.text-center
      big Program
      transition-group.flex.flex-wrap.justify-items-center(name='fade', tag='div')
        .item.flex-grow(v-for='(program, i) in data.inProgram', :key='`program-${i}`')
          // Circular progress
          circle-counter(
            v-if='hasDuration(program)',
            size='350',
            :dash-count='durationSeconds(program)',
            :active-count='positionSeconds(program)',
            :active-stroke='backgroundColor(program)',
            :text='counterText(program)'
          )
          // Title
          .title {{ program.title }}
          div(v-if='program.state === "Paused"') Paused
          div(v-if='program.loop === "True"') Looping
</template>

<script>
import baseMixin from './mixin'

// Using Vue Circle counter
// https://github.com/snirp/vue-circle-counter
import CircleCounter from 'vue-circle-counter'

export default {
  mixins: [baseMixin],

  components: {
    CircleCounter,
  },

  props: {
    data: Object,
  },
}
</script>
