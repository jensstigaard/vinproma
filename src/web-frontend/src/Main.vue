<template lang="pug">
div#app
	div(v-if="!program") No data from vMix instance yet...
	div(v-else).progress-bars
		transition(name="fade")
			div.preview(v-if="preview")
				div.position-bar(:style="positionStyle(preview)")
				div.text-overlays
					div
						span {{ preview.title }}
						span &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
						span {{ positionText(preview) }} / {{ durationText(preview) }}
		div.program
			div.position-bar(:style="positionStyle(program)")
			div.text-overlays
				div.duration {{ positionText(program) }} / {{ durationText(program) }}
				div.title {{ program.title }}
</template>

<script>
function durationNice(duration) {
  const minutes = Math.floor(duration / 60)

  const sec = duration % 60
  const seconds = `${sec < 10 ? '0' : ''}${sec}`

  return `${minutes}:${seconds}`
}

export default {
  data() {
    return {
      program: null,
      preview: null
    }
  },

  created() {
    this.$options.sockets.onmessage = message => {
      if (typeof message !== 'object' || !message.data) {
        console.error('Message did not have data attribute...', typeof message)
        console.error(message)
        return
      }

      try {
        const content = JSON.parse(message.data)
        // console.log('message from socket')
        // console.log(content)

        switch (content.type) {
          case 'input':
            const data = JSON.parse(content.data)

            if (data.program) {
              this.$set(this, 'program', data.program)
            }
            // if (data.preview) {
            this.$set(this, 'preview', data.preview || null)
            // }
            break
          default:
            console.error('Unknown DATA', content)
            break
        }
      } catch (e) {
        console.error('Failed to parse data to JSON')
        console.error('Data', message.data)
      }
    }
  },

  methods: {
    positionText(input) {
      return durationNice(Math.floor(input.position / 1000))
    },

    durationText(input) {
      return durationNice(Math.floor(input.duration / 1000))
    },

    positionPercentage(input) {
      return (input.position / input.duration) * 100
    },

    positionStyle(input) {
      const p = this.positionPercentage(input)
      const percentage = p < 2 ? 0 : p

      const leftOfInput = input.duration - input.position
      const threshold = input.duration > 120 * 1000 ? 10000 : 5000

      const background =
        input.state !== 'Running' // Paused?
          ? 'rgba(100, 150, 255, 0.8)' // Show blue-ish color
          : leftOfInput < threshold // Below threshold?
          ? 'rgba(255, 100, 100, 0.8)' // Show red
          : 'rgba(100, 200, 100, 0.8)' // Otherwise green

      return {
        width: `${percentage}%`,
        background
      }
    }
  }
}
</script>
