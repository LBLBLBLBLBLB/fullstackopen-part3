const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "You should add a password or a password with person name and phone number."
  );

  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://levanbirchadze:${password}@cluster0.d9v2d5i.mongodb.net/thePhonebook?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Phonebook = mongoose.model("Phonebook", phonebookSchema);

if (process.argv.length === 3) {
  Phonebook.find({})
    .then((entries) => {
      console.log("phonebook:");
      entries.forEach((entry) => {
        console.log(`${entry.name} ${entry.number}`);
      });
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error("Error listing entries:", error.message);
      mongoose.connection.close();
    });
} else if (process.argv.length === 5) {
  const name = process.argv[3];
  const number = process.argv[4];

  const phonebook = new Phonebook({
    name: name,
    number: number,
  });

  phonebook
    .save()
    .then((result) => {
      console.log(`Added ${name} number ${number} to phonebook`);
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error("Error adding entry:", error.message);
      mongoose.connection.close();
    });
} else {
  console.log("Invalid number of arguments");
  process.exit(1);
}
