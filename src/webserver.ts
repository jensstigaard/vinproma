import paths from './utility/paths'

// Express
import express, { RequestHandler } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'

import WebSocket from 'ws'

import overviewView from './view-templates/overview'
import htmlView from './view-templates/progress'

// Web server port
const WEB_SERVER_PORT = 8095
const WEB_SOCKET_SERVER_PORT = 8096

/**
 * Init express web server and web socket server
 * including custom routes
 * @param routes
 */
function init(
  apiRoute: RequestHandler | null
): { app: Express.Application; wss: WebSocket.Server } {
  const app = express()
  const server = require('http').createServer(app)

  // Web socket server
  // Configuration from basic configuration in documentation
  const wss = new WebSocket.Server({
    port: WEB_SOCKET_SERVER_PORT,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  })

  // app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  // Public files folder
  const staticFilesPath = paths.getResourcePath('web-frontend/dist/public')
  // console.log(staticFilesPath)
  app.use(express.static(staticFilesPath))

  // Web server - listen for HTTP request on port
  server.listen(WEB_SERVER_PORT, () => {
    // console.log('\n')
    // console.log('\t', 'Open http://localhost:' + WEB_SERVER_PORT + ' in a browser to connect')
    // console.log('\n')
  })

  app.get('/', (_req: any, res: any) => {
    return res.send(overviewView)
  })

  app.get('/linear', (req: any, res: any) => {
    const theme = req.query.theme && req.query.theme === 'dark' ? 'dark' : 'light'
    // console.log('Theme', theme)
    return res.send(htmlView('linear', theme))
  })

  app.get('/circular', (req: any, res: any) => {
    const theme = req.query.theme && req.query.theme === 'dark' ? 'dark' : 'light'
    return res.send(htmlView('circular', theme))
  })

  // Append api route if present
  if (apiRoute) {
    app.get('/api', apiRoute)
  }

  // catch 404 and forward to error handler
  app.use((req: any, res: any, next: any) => {
    const err = new Error(`Page Not Found - ${req.originalUrl}`)

    res.status(404)
    next(err)
  })

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use((err: any, _req: any, res: any) => {
      res.status(err.status || 500)

      res.render('error', {
        message: err.message,
        error: err,
      })
    })
  } else {
    // production error handler
    // no stacktraces leaked to user
    app.use((err: any, _req: any, res: any) => {
      res.status(err.status || 500)

      res.render('error', {
        message: err.message,
        error: {},
      })
    })
  }

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
      // Ping request received
      if (data === 'ping') {
        // Return with sending a pong message
        ws.send('pong')
      }
    })
  })

  // Export express app and web sockets server to allow
  // to tap into listeners and to send/broadcast messages
  return {
    app,
    wss,
  }
}

export default init
