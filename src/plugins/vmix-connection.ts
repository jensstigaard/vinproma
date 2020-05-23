import Vue from 'vue'

import { ConnectionTCP } from 'node-vmix'

// vMix connection plugin for Vue
// Implemented with inspiration from
//  - https://vuejs.org/v2/guide/plugins.html
//  - https://codepen.io/stigaard/pen/yLNNQbg
export class vMixConnectionPluginStore {
  storeVM: Vue = new Vue({
    data: {
      internal: {
        connection: null,
        connected: false
      }
    }
  })

  get connection() {
    return this.storeVM!.$data.internal.connection
  }

  get connected() {
    if (!this.storeVM!.$data.internal.connection) {
      return false
    }
    return this.storeVM!.$data.internal.connection.connected()
  }

  setConnection(host: string) {
    // Shutdown/Destroy old connection?
    if (this.storeVM!.$data.internal.connection) {
      console.log('Shutdown old connection!', this.storeVM!.$data.internal.connection)
      this.storeVM!.$data.internal.connection.shutdown()
    }
    // @ts-ignore
    this.storeVM!.$data.internal.connection = new ConnectionTCP(host)
  }

  send(commands: any) {
    this.storeVM!.$data.internal.connection.send(commands)
  }

  on(type: string, cb: Function) {
    this.storeVM!.$data.internal.connection.on(type, cb)
  }
}

const vMixConnectionPlugin = {
  install(Vue: any, store: any) {
    Vue.mixin({
      beforeCreate() {
        this.$vMixConnection = store
      }
    })

    // Global method - set vMix connection
    Vue.prototype.setVmixConnection = function(
      host: string,
      options: object = {},
      keepListeners: boolean = false
    ) {
      if (keepListeners) {
        console.log('Take care of listeners...')
      }

      this.$vMixConnection.setConnection(host, options)
    }

    Vue.prototype.execVmixCommands = function(commands: any) {
      this.$vMixConnection.send(commands)
    }
  }
}

export default vMixConnectionPlugin
