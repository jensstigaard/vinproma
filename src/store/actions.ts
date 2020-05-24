//
export default {
  setHost({ commit }: { commit: Function }, newHost: string) {
    commit('setHost', newHost)
  },

  addHostToPreviousConnectedVmixHosts({ state, commit }: { commit: Function; state: any }) {
    const host: string = state.vMixConnection.host

    if (state.previousVmixConnectionHosts.includes(host)) {
      return
    }

    commit('addHostToPreviousConnectedVmixHosts', state.vMixConnection.host)
  },

  toggleTitleMode({ commit }: { commit: Function }) {
    commit('toggleTitleMode')
  },

  saveTitleModeSettings({ commit }: { commit: Function }, data: { [key: string]: any }) {
    commit('saveTitleModeSettings', data)
  }
}
