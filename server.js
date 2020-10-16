require("dotenv").config();  // For .env variables, check the Google Drive.
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const ws = require('ws');
const http = require ('http');

const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const uri = `mongodb+srv://${ process.env.DBUSER }:${ process.env.DBPASS }@${ process.env.DBHOST }/${ process.env.DBNAME }?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection = null;
client.connect(err => {
  collection = client.db("test").collection("devices");
  console.log(collection);
});

app.use(express.static("bubble/dist/bubble"));
const server = http.createServer( app );
const socketServer = new ws.Server({ server });

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
});

// https://expressjs.com/en/starter/basic-routing.html
app.get("/about", (request, response) => {
  response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
});

let clients = [];
let count = 0;
socketServer.on( 'connection', client => {
  // when the server receives a message from this client...
  client.on( 'message', msg => {
	  // send msg to every client EXCEPT
    // the one who originally sent it. in this demo this is
    // used to send p2p offer/answer signals between clients
    clients.forEach( c => {
      if( c !== client )
        c.send( msg );
    });
  });

  // add client to client list
  clients.push( client )
  
  client.send(
    JSON.stringify({ 
      address:'connect',
      // we only initiate p2p if this is the second client connected
      initiator:++count % 2 === 0
    })
  );
  
});

// listen for requests :)
const listener = server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});