import Vue from 'vue'
import Vuetify from 'vuetify'

import 'vuetify/dist/vuetify.min.css'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.use(Vuetify)

export default new Vuetify({
  // Use Font Awesome icons
  icons: {
    iconfont: 'fa'
  },

  // Defaults to light theme
  theme: {
    dark: false
  }
})
