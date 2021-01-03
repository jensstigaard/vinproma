'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import windowStateKeeper from 'electron-window-state'

// Web socket and web socket server
import WebSocket from 'ws'
import { wss } from './webserver'

// VueX store
// import store from './store'
import './store'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

function createWindow() {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1000,
    defaultHeight: 600,
  })

  // Create the browser window.
  win = new BrowserWindow({
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,

    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  // Manage window state (position and size)
  // and remember it for every time the application is opened
  mainWindowState.manage(win)

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// this.conn.on('disconnect', console.error)

// const isMac = process.platform === 'darwin'

// const template = [
//   // { role: 'appMenu' }
//   ...(isMac
//     ? [
//       {
//         label: app.name,
//         submenu: [
//           { role: 'about' },
//           { type: 'separator' },
//           { role: 'services' },
//           { type: 'separator' },
//           { role: 'hide' },
//           { role: 'hideothers' },
//           { role: 'unhide' },
//           { type: 'separator' },
//           { role: 'quit' }
//         ]
//       }
//     ]
//     : []),
//   {
//     label: 'View',
//     submenu: [
//       // {
//       //   label: 'Swap Preview/Program rows',
//       //   accelerator: process.platform === 'darwin' ? 'Alt+Cmd+P' : 'Ctrl+Shift+P',
//       //   click: async () => {
//       //     store.dispatch('swapPreviewProgramRows')
//       //   }
//       // },
//       { type: 'separator' },
//       { role: 'reload' },
//       { role: 'forcereload' },
//       { role: 'toggledevtools' },
//       { type: 'separator' },
//       { role: 'resetzoom' },
//       { role: 'zoomin' },
//       { role: 'zoomout' },
//       { type: 'separator' },
//       { role: 'togglefullscreen' }
//     ]
//   }
// ]

// // @ts-ignore
// Menu.setApplicationMenu(Menu.buildFromTemplate(template))

let currentvMixData: string = ''

// Upon new ws connection - send current vMix data
wss.on('connection', (ws: WebSocket) => {
  // Guard if current vMix data is empty...
  if (currentvMixData.length === 0) {
    return
  }

  ws.send(
    JSON.stringify({
      type: 'input',
      data: currentvMixData,
    })
  )
})

// Listen for vMix info data from renderer thread
ipcMain.on('vMixInfo', (_event, data: any) => {
  currentvMixData = data
  // console.log('IPC Event', event)
  // console.log(data)

  // Broadcast to all open ws clients
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'input',
          data,
        })
      )
    }
  })
})
