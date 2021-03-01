const Loki = require("lokijs");
const countriesData = require("./countries-data");

// create db and tables
const db = new Loki("database.db");
const lawyersTable = db.addCollection("lawyers");
const medicalFacilitiesTable = db.addCollection("medical-facilities");

// populate tables
countriesData.forEach(({ country, serviceType, values }) => {
  var table = db.getCollection(serviceType);

  if (!table) {
    throw new Error(`Invalid serviceType ${serviceType}`);
  }

  values.forEach((item) => table.insert({ ...item, country }));
});

module.exports = {
  lawyersTable,
  medicalFacilitiesTable,
};
