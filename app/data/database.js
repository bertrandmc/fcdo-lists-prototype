const Loki = require("lokijs");

const { thailandLawyers, thailandMedicalFacilities } = require("./thailand");
const { spainLawyers } = require("./spain");

const db = new Loki("database.db");

const lawyersTable = db.addCollection("lawyers");
const medicalFacilitiesTable = db.addCollection("medical-facilities");

// populate lawyers
spainLawyers.forEach((item) =>
  lawyersTable.insert({ ...item, country: "spain" })
);
thailandLawyers.forEach((item) =>
  lawyersTable.insert({ ...item, country: "thailand" })
);

// populate medical facilities
thailandMedicalFacilities.forEach((item) =>
  medicalFacilitiesTable.insert({ ...item, country: "thailand" })
);

module.exports = {
  lawyersTable,
  medicalFacilitiesTable,
};
