import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'

// Import App view
import Main from './Main.vue'

const host = location.host.split(':')[0]
// Vue use native web socket client
// To communicate with backend which fetches data from vMix instance
Vue.use(VueNativeSock, `ws://${host}:8096/`, {
  reconnection: true, // (Boolean) whether to reconnect automatically (false)
  reconnectionAttempts: 5, // (Number) number of reconnection attempts before giving up (Infinity),
  reconnectionDelay: 3000, // (Number) how long to initially wait before attempting a new (1000)
  format: 'json',
})

const app = new Vue({
  render: (h) => h(Main),
}).$mount('#app')
