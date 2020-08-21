import { TitleModeSettings } from '@/types/title-mode'

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
   * Set delay compensation
   *
   * @param state
   * @param newValue
   */
  setDelayCompensation(state: any, newValue: number) {
    state.delayCompensation = newValue
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
  saveTitleModeSettings(state: any, data: TitleModeSettings) {
    state.titleMode.enabled = data.enabled
    state.titleMode.sameInputForAllFields = data.sameInputForAllFields

    state.titleMode.fields.currentPosition = data.fields.currentPosition
    state.titleMode.fields.remaining = data.fields.remaining
    state.titleMode.fields.width = data.fields.width
  }
}
