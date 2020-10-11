require("dotenv").config();  // For .env variables, check the Google Drive.
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

const MongoDB = require('mongodb');
const MongoClient = MongoDB.MongoClient;
const uri = `mongodb+srv://${ process.env.DBUSER }:${ process.env.DBPASS }@${ process.env.DBHOST }/${ process.env.DBNAME }?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true });
let collection = null;
client.connect(err => {
  collection = client.db("test").collection("devices");
  console.log(collection);
});

app.use(express.static(path.join(__dirname, "bubble/dist/bubble")));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/bubble/dist/bubble/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
