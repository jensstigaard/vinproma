<template lang="pug">
div
  h3 HTML view
  div View progress as a HTML page. Both linear and circular modes are available, and both light and dark themes. 
  div: small Open web overview to view presentation options.
  v-btn(@click="openWeb(htmlOverviewAddress)").my-1
    small {{ htmlOverviewAddress }}
</template>

<script lang="ts">
import { shell } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'

import ip from 'ip'

@Component({})
export default class App extends Vue {
  get htmlOverviewAddress() {
    return `http://${ip.address()}:8095`
  }

  htmlViewAddress(type: string, theme: string = 'light') {
    return `${this.htmlOverviewAddress}/${type}?theme=${theme}`
  }

  openWeb(url: string) {
    shell.openExternal(url)
  }
}
</script>
