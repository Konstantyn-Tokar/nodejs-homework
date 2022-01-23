const fs = require("fs/promises");

const contactsPath = require("./contactsPath");

const getAll = async () => {
  const data = await fs.readFile(contactsPath);
  const allContacts = JSON.parse(data);
  return allContacts;
};

module.exports = getAll;
