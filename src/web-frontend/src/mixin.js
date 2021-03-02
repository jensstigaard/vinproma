import Vue from 'vue'

// Helper to nicely present durations as readable text
function durationNice(duration) {
  const minutes = Math.floor(duration / 60)

  const sec = duration % 60
  const seconds = `${sec < 10 ? '0' : ''}${sec}`

  return `${minutes}:${seconds}`
}

// Base Mixin
export default Vue.extend({
  // Helpers
  methods: {
    roundedSeconds(ms) {
      return Math.floor(ms / 1000)
    },

    positionSeconds(input) {
      return this.roundedSeconds(input.position)
    },

    durationSeconds(input) {
      return this.roundedSeconds(input.duration)
    },

    hasDuration(input) {
      return input.hasOwnProperty('duration') && this.durationSeconds(input) > 0
    },

    positionText(input) {
      return durationNice(this.positionSeconds(input))
    },

    durationText(input) {
      return durationNice(this.durationSeconds(input))
    },

    remainingText(input) {
      const diffMs = input.duration - input.position
      return durationNice(Math.ceil(diffMs / 1000))
    },

    positionPercentage(input) {
      return Math.round((input.position / input.duration) * 100)
    },

    counterText(input) {
      if (!this.hasDuration(input)) {
        return `${input.type || '-'}`
      }
      // console.log(input)

      const pos = this.positionText(input)
      const dur = this.durationText(input)
      const remaining = this.remainingText(input)

      return `${pos} / ${dur} / ${remaining}`
    },

    remainingWarning(input) {
      if (input.loop === 'True') {
        return false
      }

      // Remaining time in milliseconds
      const remainingTime = input.duration - input.position

      // If longer than 120 seconds then threshold is 10 sec - otherwise 5 seconds
      const warningThreshold = this.durationSeconds(input) > 120 ? 10000 : 5000

      return remainingTime <= warningThreshold
    },

    isRunning(input) {
      return input.state === 'Running'
    },

    backgroundColor(input, isProgram = true) {
      // Is paused?
      if (!this.isRunning(input)) {
        // Show blue-ish color when paused
        return 'rgba(100, 150, 255, 0.6)'
      }

      return this.remainingWarning(input) // Below "warning" threshold?
        ? 'rgba(255, 100, 100, 0.8)' // Show red (warning color)
        : 'rgba(100, 200, 100, 0.8)' // Otherwise green
    },

    positionStyle(input) {
      const p = this.positionPercentage(input)
      const percentage = p < 2 ? 0 : p

      const background = this.backgroundColor(input)

      return {
        width: `${percentage}%`,
        background,
      }
    },
  },
})
