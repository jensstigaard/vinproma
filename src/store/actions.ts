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

  changeMode({ commit }: { commit: Function }) {
    commit('changeMode')
  }
}
