import { useState, useEffect } from "react";

import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Person from "./components/Persons";
import Notification from "./components/Notification";

import phonebookServ from "./services/phonebook";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchedName, setSearchedName] = useState("");
  const [message, setMessage] = useState({ text: null, isError: false });

  useEffect(() => {
    phonebookServ.getAll().then((updatedPersons) => {
      setPersons(updatedPersons);
    });
  }, []);
  const addName = (event) => {
    event.preventDefault();
    const newPersonEntry = {
      name: newName,
      number: newNumber,
    };

    const isNameAlreadyExists = persons.find(
      (person) =>
        person.name.toLowerCase() === newPersonEntry.name.toLowerCase()
    );

    if (isNameAlreadyExists) {
      const shouldReplaceNum = window.confirm(
        `${isNameAlreadyExists.name} is already added to phonebook, replace the old number with a new one?`
      );
      if (shouldReplaceNum) {
        const updatedPerson = {
          ...isNameAlreadyExists,
          number: newNumber,
        };

        phonebookServ
          .update(isNameAlreadyExists.id, updatedPerson)
          .then((updatedPerson) => {
            if (updatedPerson && updatedPerson.name) {
              setPersons(
                persons.map((person) =>
                  person.id !== isNameAlreadyExists.id ? person : updatedPerson
                )
              );
              createMessage(
                `Updated ${isNameAlreadyExists.name}'s number`,
                false
              );

              setNewName("");
              setNewNumber("");
            } else {
              console.error(
                "Updated person object is undefined or missing name property"
              );
            }
          })
          .catch(() => {
            createMessage(
              `${isNameAlreadyExists.name}'s number is already deleted`,
              true
            );
            setPersons(persons.filter((p) => p.id !== isNameAlreadyExists.id));
          });
        return;
      }
    } else {
      if (!newPersonEntry.name || !newPersonEntry.number) {
        alert("add all information");
      } else {
        phonebookServ
          .create(newPersonEntry)
          .then((newPersEnt) => {
            setPersons([...persons, newPersEnt]);
            createMessage(`Added ${newPersonEntry.name}'s number`, false);

            setNewName("");
            setNewNumber("");
          })
          .catch((error) => {
            console.error("Error:", error);
            createMessage(error.response?.data?.error, true);
          });
      }
    }
  };

  const deletePerson = (id, name) => {
    const shouldDelete = window.confirm(`Delete ${name}?`);
    if (shouldDelete) {
      phonebookServ.deletePerson(id).then(() => {
        setPersons(persons.filter((person) => person.id !== id));
        createMessage(`Deleted ${name}'s number`, true);
      });
    }
  };

  const searchPerson = (event) => {
    event.preventDefault();
  };

  const searchedPerson = persons.filter((person) =>
    person.name.toLowerCase().startsWith(searchedName.toLowerCase())
  );

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };
  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchedName(event.target.value);
  };
  const createMessage = (messageText, error = false) => {
    setMessage({ text: messageText, isError: error });
    setTimeout(() => {
      setMessage({ text: null, isError: error });
    }, 5000);
  };

  return (
    <div>
      <h1>Phonebook</h1>

      <Notification message={message.text} error={message.isError} />
      <Filter searchPerson={searchPerson} handleSearch={handleSearch} />
      <PersonForm
        addName={addName}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />
      <Person
        searchedName={searchedName}
        searchedPerson={searchedPerson}
        persons={persons}
        deletePerson={deletePerson}
      />
    </div>
  );
};

export default App;
