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
   * Toggle title mode on/off
   * @param state
   */
  toggleTitleMode(state: any) {
    state.titleMode.enabled = !state.titleMode.enabled
  },

  /**
   * Save title mode settings
   * @param state
   */
  saveTitleModeSettings(state: any, data: { input: string, widthField: string, textField: string }) {
    state.titleMode.input = data.input
    state.titleMode.widthField = data.widthField
    state.titleMode.textField = data.textField
  }
}
