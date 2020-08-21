export default {
  vMixConnection: {
    host: '127.0.0.1',
    debug: false
  },

  previousVmixConnectionHosts: [],

  // Delay compensation
  // How many milliseconds shall the presentation act as it is before in time
  delayCompensation: 0,

  titleMode: {
    enabled: false,
    sameInputForAllFields: true,
    fields: {
      currentPosition: [],
      remaining: [],
      width: []
    }
  }
}
