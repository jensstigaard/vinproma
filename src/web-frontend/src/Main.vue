<template lang="pug">
div#app
  div(v-if="connectionLost" style="padding: 10px; text-align: center") Connection lost... Try to refresh...
  div(v-else-if="!program") No data from vMix instance yet...
  div(v-else).progress-bars
    transition(name="fade")
      div.preview(v-if="preview")
        div.position-bar(:style="positionStyle(preview)")
        div.text-overlays
          div
            span {{ preview.title }}
            span &nbsp;&nbsp;&mdash;&nbsp;&nbsp;
            span {{ positionText(preview) }} / {{ durationText(preview) }} / {{ remainingText(preview) }}
    div.program
      div.position-bar(:style="positionStyle(program)")
      div.text-overlays
        div.duration {{ positionText(program) }} / {{ durationText(program) }} / {{ remainingText(program) }}
        div.title {{ program.title }}
</template>

<script>
// Helper to nicely present durations as readable text
function durationNice(duration) {
  const minutes = Math.floor(duration / 60)

  const sec = duration % 60
  const seconds = `${sec < 10 ? '0' : ''}${sec}`

  return `${minutes}:${seconds}`
}

const PING_FREQUENCY = 10000 // Ping each 10th second
const PING_ANSWER_THRESHOLD = 25000 // Pong threshold 25 sec - otherwise interpreted as lost connection

export default {
  data() {
    return {
      program: null,
      preview: null,

      socketPingInterval: null,
      latestPing: new Date(),
      latestPong: new Date()
    }
  },

  created() {
    this.$options.sockets.onmessage = message => {
      // Guard message...
      if (typeof message !== 'object' || !message.data) {
        console.error('Message did not have data attribute...', typeof message)
        console.error(message)
        return
      }

      if (message.data === 'pong') {
        this.latestPong = new Date()
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

    this.$options.sockets.onerror = message => {
      console.error('Error for socket', message)
    }

    this.socketPingInterval = setInterval(() => {
      this.$socket.send('ping')
      this.latestPing = new Date()
    }, PING_FREQUENCY)

    // On socket closing clear interval
    this.$socket.onclose = function clear() {
      clearInterval(this.socketPingInterval)
    }
  },

  computed: {
    connectionLost() {
      const diff = this.latestPing - this.latestPong
      // console.log(diff)
      return diff > PING_ANSWER_THRESHOLD
    }
  },

  methods: {
    positionText(input) {
      return durationNice(Math.floor(input.position / 1000))
    },

    durationText(input) {
      return durationNice(Math.floor(input.duration / 1000))
    },

    remainingText(input) {
      const diffMs = input.position - input.duration
      return durationNice(Math.floor(diffMs / 1000))
    },

    positionPercentage(input) {
      return (input.position / input.duration) * 100
    },

    positionStyle(input) {
      const p = this.positionPercentage(input)
      const percentage = p < 2 ? 0 : p

      const remainingTime = (input.duration - input.position) / 1000 // In seconds (with fractions)
      const warningThreshold = input.duration > 120 ? 10 : 5 // If longer than 120 seconds then threshold is 10 sec

      const background =
        input.state !== 'Running' // Paused?
          ? 'rgba(100, 150, 255, 0.8)' // Show blue-ish color
          : remainingTime < warningThreshold // Below "warning" threshold?
          ? 'rgba(255, 100, 100, 0.8)' // Show red (warning color)
          : 'rgba(100, 200, 100, 0.8)' // Otherwise green

      return {
        width: `${percentage}%`,
        background
      }
    }
  }
}
</script>
