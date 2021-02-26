<template lang="pug">
div.flex.circular-progress-bars
	div(class="w-1/2")
		div(v-if="preview").preview.text-center
			transition(name="fade")
				div
					div Preview
					// Circular progress
					circle-counter(
						ref="circularPreview"
						size="280"
						:dash-count="durationSeconds(preview)"
						:active-count="positionSeconds(preview)"
						:text="`${positionText(preview)} / ${durationText(preview)} / ${remainingText(preview)}`"
					)
					// Title
					div.title {{ preview.title }}
	div(class="w-1/2")
		div(v-if="program").program.text-center
			div Program
			// Circular progress
			circle-counter(
				size="400"
				:dash-count="durationSeconds(program)"
				:active-count="positionSeconds(program)"
				:active-stroke="backgroundColor(program)"
				:text="`${positionText(program)} / ${durationText(program)} / ${remainingText(program)}`"
			)
			// Title
			div.title {{ program.title }}
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
    program: Object,
    preview: Object,
  },
}
</script>
