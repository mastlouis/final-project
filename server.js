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

/* START OF PASSPORT CHANGES */
const passport = require('passport');

app.listen(process.env.PORT || 5000)

const GitHubStrategy = require('passport-github').Strategy;

passport.use(new GitHubStrategy({
    clientID: "cbec862a05635fb23d9d",
    clientSecret: "63089da72d4340bd55a34dbaa1843829759ca66a",
    callbackURL: "http://localhost:4200/return"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile)
      return cb(null, profile);
  }
));

passport.serializeUser(function(user, cb) {
    cb(null, user);
  });
  
passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});


app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.get('/auth/github',
passport.authenticate('github'));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', 
(req, res) => res.sendFile('/bubble/dist/bubble/auth.html', { root : __dirname, user: req.user}),
require('connect-ensure-login').ensureLoggedIn(),
);

app.get('/home', 
(req, res) => res.sendFile('/bubble/dist/bubble/index.html', { root : __dirname, user: req.user}),
require('connect-ensure-login').ensureLoggedIn(),
);

app.get('/auth/github',
passport.authenticate('github'));

let userID;
app.get('/error', (req, res) => res.send("error logging in"));

app.get('/return',
  passport.authenticate('github', { failureRedirect: '/error' }),
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
    userID = req.user.id
    // console.log("user ID:", userID);
    res.redirect('/home');
  });



/* END OF PASSPORT CHANGES */

// https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
// });

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/about", (request, response) => {
//   response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
// });

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