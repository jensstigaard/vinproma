<template lang="pug">
div#app
  div(v-if="connectionLost" style="padding: 10px; text-align: center") 
    | Connection lost... Try to refresh...
  div(v-else-if="!program").text-center.px-4.py-3 
    | Connected to vMix instance - but no data received yet... Waiting in patience!
  div(v-else)
    component(
      v-bind:is="presentationType"
      :program="program"
      :preview="preview"
    )
</template>

<script>
import baseMixin from './mixin'

import Circular from './Circular'
import Linear from './Linear'

const PING_FREQUENCY = 10000 // Ping each 10th second
const PING_ANSWER_THRESHOLD = 25000 // Pong threshold 25 sec - otherwise interpreted as lost connection

export default {
  mixins: [baseMixin],
  components: {
    Linear,
    Circular
  },

  data() {
    return {
      // Read what presenation type it should be based of location pathname
      presentationType: location.pathname === '/circular' ? 'circular' : 'linear',

      // Program and preview data from vMix
      program: null,
      preview: null,

      // Socket details
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

        if (content.type === 'input') {
          const data = JSON.parse(content.data)

          if (data.program) {
            this.$set(this, 'program', data.program)
          }
          // if (data.preview) {
          this.$set(this, 'preview', data.preview || null)
          // }
        } else {
          console.error('Unknown DATA', content)
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
  }
}
</script>
