let http = require('http');
let path = require("path");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let bodyParser = require("body-parser");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })
process.stdin.setEncoding("utf8");
app.use(express.static(__dirname));

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.7hqzy.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

if (process.argv.length != 3) {
    process.stdout.write(`Usage finalSubmission.js PORT_NUMBER_HERE`);
    process.exit(1);
  }

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

app.get("/", function (request, response) {
  response.render("index");
});

// submit redirects to processapplication
app.get("/addActivity", function (request, response) {
  response.render("addActivity");
});

// Function to add to mongoDB
async function insertApplication(client, newData) {
  const result = await client.db(dbName).collection(collectionName).insertOne(newData);
}

app.use(bodyParser.urlencoded({extended:false}));
app.post("/processActivity", (request, response) => {
  (async () => {
    try {
      await client.connect();
      let newData = {
        name: request.body.name,
        time: request.body.time,
        instruction: request.body.information,
      }
      // Insert into mongoDB database
      await insertApplication(client, newData);
      // Display on new page
      response.render("activityReview", newData)
    } catch (e) {
      console.log("ERROR, ERROR: " + e);
    } finally {
      client.close()
    }
  })();
});
// Mongo Search
async function lookUpMany(client) {
  let filter = {};
  const cursor = client.db(dbName)
  .collection(collectionName)
  .find(filter);
  //console.log(cursor);
  const result = await cursor.toArray();
  return result;
}
app.get("/randomActivity", function (request, response) {
  (async () => {
    try {
      await client.connect();
      // Search mongoDB database
      let data = await lookUpMany(client);
      let randIndex = Math.floor(Math.random() * data.length);
      let newData = {
        name: data[randIndex].name,
        time: data[randIndex].time,
        instruction: data[randIndex].instruction
      }
      // Display on new page
      response.render("getRandom", newData);
    } catch (e) {
      console.log("ERROR, ERROR: " + e);
    } finally {
      client.close()
    }
  })();
});

let portNumber = process.argv[2];
console.log(`Web server started and running at http://localhost:${portNumber}`);
http.createServer(app).listen(portNumber)

let prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on("readable", function () {
  let dataInput = process.stdin.read();
  if (dataInput !== null) {
    let command = dataInput.trim();
   if (command === "stop") {
      process.stdout.write("Shutting down server\n");
      process.exit(0);
    } else { 
        process.stdout.write(`Invalid command: ${command}\n`)
    }
    process.stdout.write(prompt);
    process.stdin.resume();
  }
});
