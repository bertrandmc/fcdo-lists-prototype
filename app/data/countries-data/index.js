const bulgariaData = require("./bulgaria");
const ghanaData = require("./ghana");
const greeceData = require("./greece");
const netherlandsData = require("./netherlands");
const spainData = require("./spain");
const stLuciaData = require("./saint-lucia");
const thailandData = require("./thailand");

const lawyers = [
  { serviceType: "lawyers", country: "bulgaria", values: bulgariaData.lawyers },
  { serviceType: "lawyers", country: "ghana", values: ghanaData.lawyers },
  { serviceType: "lawyers", country: "greece", values: greeceData.lawyers },
  {
    serviceType: "lawyers",
    country: "netherlands",
    values: netherlandsData.lawyers,
  },
  {
    serviceType: "lawyers",
    country: "spain",
    values: spainData.lawyers,
  },
  {
    serviceType: "lawyers",
    country: "saint lucia",
    values: stLuciaData.lawyers,
  },
  {
    serviceType: "lawyers",
    country: "thailand",
    values: thailandData.lawyers,
  },
];

const medicalFacilities = [
  {
    serviceType: "medical-facilities",
    country: "bulgaria",
    values: bulgariaData.medicalFacilities,
  },
  {
    serviceType: "medical-facilities",
    country: "ghana",
    values: ghanaData.medicalFacilities,
  },
  {
    serviceType: "medical-facilities",
    country: "greece",
    values: greeceData.medicalFacilities,
  },
  {
    serviceType: "medical-facilities",
    country: "netherlands",
    values: netherlandsData.medicalFacilities,
  },
  {
    serviceType: "medical-facilities",
    country: "spain",
    values: spainData.medicalFacilities,
  },
  {
    serviceType: "medical-facilities",
    country: "saint lucia",
    values: stLuciaData.medicalFacilities,
  },
  {
    serviceType: "medical-facilities",
    country: "thailand",
    values: thailandData.medicalFacilities,
  },
];

module.exports = [...lawyers, ...medicalFacilities];
