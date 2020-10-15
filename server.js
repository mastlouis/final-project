const express = require('express'),
      app     = express(),
      ws      = require('ws'),
      http    = require('http')

app.use( express.static('./') )

const server = http.createServer( app )

const socketServer = new ws.Server({ server })

const clients = []

let count = 0
socketServer.on( 'connection', client => {
  // when the server receives a message from this client...
  client.on( 'message', msg => {
	  // send msg to every client EXCEPT
    // the one who originally sent it. in this demo this is
    // used to send p2p offer/answer signals between clients
    clients.forEach( c => {
      if( c !== client )
        c.send( msg )
    })
  })

  // add client to client list
  clients.push( client )
  
  client.send(
    JSON.stringify({ 
      address:'connect',
      // we only initiate p2p if this is the second client connected
      initiator:++count % 2 === 0
    })
  )
  
})

server.listen( 3000 )