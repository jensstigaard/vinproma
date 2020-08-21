<template lang="pug">
div.linear-progress-bars
	transition(name="fade")
		div.preview(v-if="preview")
			div.position-bar(:style="positionStyle(preview)")
			div.text-overlays
				div
					span {{ preview.title }}
					span(style="display: inline-block; padding: 0 10px") &mdash;
					span 
						| {{ positionText(preview) }}
						| / {{ durationText(preview) }}
						| / 
						span(:style="remainingWarning(preview)?'font-weight:bold':''")
							| {{ remainingText(preview) }}
	div.program
		div.position-bar(:style="positionStyle(program)")
		div.text-overlays
			div.duration
				| {{ positionText(program) }}
				| / {{ durationText(program) }}
				| / 
				span(:style="remainingWarning(program)?'font-weight:bold':''") {{ remainingText(program) }}
			div.title {{ program.title }}
</template>

<script>
import baseMixin from './mixin'

export default {
  mixins: [baseMixin],

  props: {
    program: Object,
    preview: Object
  }
}
</script>
