<template lang="pug">
div
	h3 HTML view
	div
		span.d-inline-block(style="width:120px") Overview: 
		v-btn(@click="htmlOverview").my-1
			small {{ htmlOverviewAddress }}
	div
		span.d-inline-block(style="width:120px") Light mode: 
		v-btn(@click="htmlLightMode").my-1
			small {{ htmlLightModeAddress }}
	div
		span.d-inline-block(style="width:120px") Dark mode: 
		v-btn(@click="htmlDarkMode").my-1
			small {{ htmlDarkModeAddress }}
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

  get htmlLightModeAddress() {
    return `${this.htmlOverviewAddress}/light`
  }

  get htmlDarkModeAddress() {
    return `${this.htmlOverviewAddress}/dark`
  }

  htmlOverview() {
    // Open url
    shell.openExternal(this.htmlOverviewAddress)
  }

  htmlLightMode() {
    // Open url
    shell.openExternal(this.htmlLightModeAddress)
  }

  htmlDarkMode() {
    // Open url
    shell.openExternal(this.htmlDarkModeAddress)
  }
}
</script>
