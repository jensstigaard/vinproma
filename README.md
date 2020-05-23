# vinprom



**v**Mix **In**put **Pro**gress **M**onitor app (shortened: vinprom) built with [ElectronJS](https://electronjs.org). ElectronJS is a cross-platform framework allowing the app to be built for each Windows, Mac or Linux. 

The app is oriented for touch use.

You are free to clone the repository to develop your own app based in this code.


## Downloads

See the [Releases](../../releases) tab for a direct download of the app for Mac and Windows.

## Feature summary
 - Read progress of current input in program
 - HTML view: View progress as a HTML page - Light or dark mode
 - vMix title mode: Send progress to a vMix title input


## Known issues
When running in development mode you can experience loss of connection to the vMix instance after some minutes.

## Project setup
### Install dependencies (based on package.json)
```
yarn
```

### Compiles and hot-reloads for development
```
yarn electron:serve
```

### Compiles and minifies for production
```
yarn electron:build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
