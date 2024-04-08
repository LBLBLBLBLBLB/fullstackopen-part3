const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require("dotenv").config();

const Person = require("./modules/phonebook");

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());
app.use(express.static("dist"));

morgan.token("post-data", (request, response) => {
  if (request.method === "POST") {
    return JSON.stringify(request.body);
  }
  return "";
});

const postLog =
  ":method :url :status :response-time ms - :res[content-length] :post-data";

app.use(
  morgan(postLog, {
    skip: (request, response) => request.method !== "POST",
  })
);

// // generate random id for persons
// const generateId = () => {
//   const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
//   return maxId + 1;
// };

// get all persons
app.get("/api/persons/", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

// get single preson
app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

// get amount of people and request time
app.get("/info", (request, response) => {
  Person.countDocuments({}, (error, count) => {
    if (error) {
      console.error("Error counting persons:", error);
      response.status(500).json({ error: "Internal server error" });
    } else {
      const now = new Date();
      response.send(`<p>Phonebook has info for ${count} people</p>
                     <br/>
                     <p>${now}</p>`);
    }
  });
});

// delete person
app.delete("/api/persons/:id", (request, response) => {
  Person.findByIdAndDelete(request.params.id).then((deletedPerson) => {
    if (deletedPerson) {
      response.status(204).end();
    } else {
      response.status(404).json({ error: "Person not found" });
    }
  });
});

// add person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number is missing",
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
