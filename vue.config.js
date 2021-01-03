module.exports = {
  transpileDependencies: ['vuetify'],
  pluginOptions: {
    electronBuilder: {
      // https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/484#issuecomment-711085442
      nodeIntegration: true,
    },
  },
}
