export default {
  /**
   * Set vMix connection host
   * @param state
   * @param newHost
   */
  setHost(state: any, newHost: string) {
    state.vMixConnection.host = newHost
  },

  /**
   * Add host to previous vMix connection hosts
   * @param state
   * @param host
   */
  addHostToPreviousConnectedVmixHosts(state: any, host: string) {
    state.previousVmixConnectionHosts.push(host)
  },

  /**
   * Change mode
   * @param state
   */
  changeMode(state: any) {
    state.mode = state.mode === 'HTML' ? 'vMixTitle' : 'HTMl'
  }
}
