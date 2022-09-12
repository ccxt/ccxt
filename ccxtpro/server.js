'use strict';

;(async () => {

    const WebSocket = require ('ws')
    const wss = new WebSocket.Server ({ port: 8080 })

    wss.on ('connection', function connection (ws) {

        ws.on ('message', function incoming (message) {
            console.log ('received', message)
        })

        ws.on ('ping', function incoming (message) {
            console.log ('ping', message)
        })

        ws.on ('pong', function incoming (message) {
            console.log ('pong', message)
        })

        ws.send ('something')
        ws.ping ()
    })

}) ()