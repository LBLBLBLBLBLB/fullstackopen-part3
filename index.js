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

app.get("/info", (request, response) => {
  const date = new Date();
  response.send(`<p>phonebook has info for ${persons.length} people</p>
  <br/>
  <p>${date}</p>`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((pers) => pers.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((pers) => pers.id !== id);
  response.status(204).end();
});

const generateId = () => {
  let maxId;
  if (persons.length > 0) {
    maxId = Math.max(...persons.map((p) => p.id));
  } else {
    maxId = 0;
  }
  return maxId + 1;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Both name and number are required",
    });
  }

  const nameExists = persons.some((person) => person.name === body.name);
  if (nameExists) {
    return response.status(400).json({
      error: "Name must be unique",
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
  console.log(`Server running on port ${PORT}`);
});
