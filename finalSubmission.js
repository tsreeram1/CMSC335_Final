let http = require('http');
let path = require("path");
let express = require("express"); /* Accessing express module */
let app = express(); /* app is a request handler function */
let bodyParser = require("body-parser");

const mongoModule = require("./mongoModule");

const { render } = require('ejs');
app.use(express.static(__dirname));

process.stdin.setEncoding("utf8");
if (process.argv.length != 3) {
    process.stdout.write(`Usage finalSubmission.js PORT_NUMBER_HERE\n`);
    process.exit(1);
  }

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

let portNumber = process.argv[2];
console.log(`Web server started and running at http://localhost:${portNumber}`);
http.createServer(app).listen(portNumber)

app.use(bodyParser.urlencoded({extended:false}));

app.get("/", function (request, response) {
  response.render("index");
});

// submit redirects to processapplication
app.get("/addActivity", function (request, response) {
  response.render("addActivity");
});

app.post("/processActivity", (request, response) => {
  let {name, time, instruction} = request.body;
  let variables = {
    name: name,
    time: time,
    instruction: instruction
  }
  mongoModule.insertApplication(variables);
  response.render("activityReview", variables)
});

app.get("/randomActivity", async function (request, response) {
  let data = await mongoModule.getAll();
  let randIndex = Math.floor(Math.random() * data.length);
  let variables = {
        name: data[randIndex].name,
        time: data[randIndex].time,
        instruction: data[randIndex].instruction
  }
  response.render("getRandom", variables)
});

app.get("/deleteActivity", async function(request, response) {
  let data = await mongoModule.getAll()
  let activities = "";
  data.forEach(element =>
    activities += `<option value = "${element.name}">${element.name}</option>`
  );
  let variables = {
    activities: activities
  }
  response.render("deleteActivity", variables)
});

app.post("/processDeleteActivity", async function(request, response) {
  let {itemsSelected, deleteAllActivities} = request.body
  let table = "<table border=1> <thead> <tr> <th>Activity</th> </tr> </thead> <tbody>";
  if (deleteAllActivities == "on") {
    let data = await mongoModule.getAll();
    data.forEach(element =>
      table += `<tr> <td>${element.name}</td> </tr>`  
    )
  } else if (itemsSelected != null) {
    itemsSelected.forEach(element =>
      table += `<tr> <td>${element}</td> </tr>`   
    )
  }
  table += "</tbody> </table>";
  console.log(itemsSelected + ",,,,," + deleteAllActivities)
  let num = await mongoModule.deleteActivities(itemsSelected, deleteAllActivities);
  let variables = {
    table: table,
    num: num
  }
  response.render("processDeleteActivities", variables)
});

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