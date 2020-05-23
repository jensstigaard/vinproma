import Vue from 'vue'
import Vuex from 'vuex'

// @ts-ignore - this is necessary since VS Code cannot find declarations of the types of vuex-electron
import { createPersistedState, createSharedMutations } from 'vuex-electron'

Vue.use(Vuex)

import state from './state'
import actions from './actions'
import mutations from './mutations'

export default new Vuex.Store({
  state,

  actions,

  mutations,

  modules: {},

  plugins: [createPersistedState(), createSharedMutations()],
  strict: process.env.NODE_ENV !== 'production'
})
