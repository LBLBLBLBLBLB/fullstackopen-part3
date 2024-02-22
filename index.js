const express = require("express");
const morgan = require("morgan");
const app = express();

app.use(express.json());

app.use(morgan("tiny"));

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// generate random id for persons
const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((n) => n.id)) : 0;
  return maxId + 1;
};

// get all persons
app.get("/api/persons/", (request, response) => {
  response.json(persons);
});

// get single preson
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  person ? response.json(person) : response.status(404).end();
});

// get amount of people and request time
app.get("/info", (request, response) => {
  const now = new Date();
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
                 <br/>
                 <p>${now}</p>`);
});

// delete person
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

// add person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number is missing",
    });
  }

  const isNameUnique = persons.some((person) => person.name === body.name);
  if (isNameUnique) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  response.json(person);
});
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
