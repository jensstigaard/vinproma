import Vue from 'vue'
import App from './App.vue'
import store from './store'
import vuetify from './plugins/vuetify'

import { vMixConnectionPluginStore } from './plugins/vmix-connection'
import vMixConnectionPlugin from './plugins/vmix-connection'

Vue.config.productionTip = false

Vue.use(vMixConnectionPlugin, new vMixConnectionPluginStore())

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
