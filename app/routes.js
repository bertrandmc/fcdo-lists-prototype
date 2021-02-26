const querystring = require("querystring");
const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { countriesList, practiceAreasList } = require("./data/metadata");
const {
  thailandLawyers,
  thailandMedicalFacilities,
} = require("./data/thailand");
const { spainLawyers } = require("./data/spain");
const db = require("./data/database");

const fakeDB = {
  thailand: {
    lawyers: thailandLawyers,
    "medical-facilities": thailandMedicalFacilities,
  },
  spain: {
    lawyers: spainLawyers,
  },
  query: function (params) {
    const { country, serviceType } = params;
    return _.get(
      this,
      `${country.toLowerCase()}.${serviceType.toLowerCase()}`,
      []
    );
  },
};

const DEFAULT_VIEW_PROPS = {
  _,
  serviceName: "Service finder",
  countriesList,
  practiceAreasList,
  thailandLawyers,
  thailandMedicalFacilities,
};

function queryStringFromParams(params) {
  console.log("queryStringFromParams", params);
  return Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

function regionFromParams(params) {
  if (!params.region) {
    return undefined;
  }

  let region = params.region;

  if (typeof region === "string") {
    region = region.split(/,/);
  }

  if (region[0] === "unknown" && region[1]) {
    // user is just posting region form, which includes hidden input with value unknown
    return region[1];
  }

  if (region[0] === "unknown" && !region[1]) {
    // user posted empty region
    return "unknown";
  }

  if (region[0] !== "unknown") {
    // region has already been defined
    return region[0];
  }
}

function practiceAreaFromParams(params) {
  if (!params.practiceArea) {
    return undefined;
  }

  if (params.practiceArea === "_unchecked") {
    return "unknown";
  }

  return params.practiceArea;
}

const v1Route = "/service-finder-v1/:find?";
function v1RouteHandler(req, res) {
  const { find } = req.params;

  const params = {
    ...req.query,
    ...req.body,
  };

  const { serviceType, country, practiceArea, legalAid } = params;
  const region = regionFromParams(params);
  const queryString = queryStringFromParams(params);
  const isSearchingForLawyers = serviceType === "lawyers";

  const viewProps = {
    ...params,
    ...DEFAULT_VIEW_PROPS,
    responses: { ...req.query },
  };

  if (!find) {
    return res.render("start-page", {
      ...viewProps,
      nextRoute: "/service-finder-v1/find",
      previousRoute: "/service-finder-v1/",
    });
  }

  let questionToRender;
  let searchResults = [];

  if (!serviceType) {
    questionToRender = "question-service-type.html";
  } else if (!country) {
    questionToRender = "question-country.html";
  } else if (!region) {
    questionToRender = "question-region.html";
  } else if (!region) {
    questionToRender = "question-region.html";
  } else if (!practiceArea && isSearchingForLawyers) {
    questionToRender = "question-practice-area.html";
  } else if (!legalAid && isSearchingForLawyers) {
    questionToRender = "question-legal-aid.html";
  } else if (req.method === "POST") {
    return res.redirect(`/service-finder-v1/find?${queryString}`);
  } else {
    switch (serviceType) {
      case "lawyers":
        searchResults = db.lawyersTable.find({ country });
        break;
      case "medical-facilities":
        searchResults = db.medicalFacilitiesTable.find({ country });
        break;
      default:
        searchResults = [];
    }
  }

  return res.render("v1-service-finder", {
    ...viewProps,
    previousRoute: "/service-finder-v1/",
    nextRoute: `/service-finder-v1/find?${queryString}`,
    questionToRender,
    params,
    searchResults,
    removeQueryParameter: (route, parameterName) => {
      const [path, query] = route.split(/\?/);
      const params = querystring.parse(query);
      delete params[parameterName];
      return `${path}?${querystring.stringify(params)}`;
    },
  });
}

router.get(v1Route, v1RouteHandler);
router.post(v1Route, v1RouteHandler);

// V2 APP
const v2Route = "/service-finder-v2/:find?";
function v2RouteHandler(req, res) {
  const params = {
    ...req.query,
    ...req.body,
    ...req.params,
  };

  const region = regionFromParams(params);
  const practiceArea = practiceAreaFromParams(params);

  if (region) {
    params.region = region;
  }
  if (practiceArea) {
    params.practiceArea = practiceArea;
  }

  const { find, serviceType, country, legalAid, readNotice } = params;

  const isSearchingForLawyers = serviceType === "lawyers";
  const viewProps = {
    ...DEFAULT_VIEW_PROPS,
    ...params,
  };

  const queryString = queryStringFromParams(params);
  const nextRoute = `/service-finder-v2/find?${queryString}`;

  if (req.method === "POST") {
    return res.redirect(nextRoute);
  }

  if (!find) {
    return res.render("start-page", {
      ...viewProps,
      nextRoute: "/service-finder-v2/find",
      previousRoute: "/service-finder-v2/",
    });
  }

  if (!serviceType) {
    return res.render("v2-page-question-service-type", {
      ...viewProps,
      nextRoute,
    });
  }

  if (!readNotice) {
    return res.render("v2-page-notice", {
      ...viewProps,
      nextRoute,
    });
  }

  if (!country) {
    return res.render("v2-page-question-country", {
      ...viewProps,
      nextRoute,
    });
  }

  if (!region) {
    return res.render("v2-page-question-region", {
      ...viewProps,
      nextRoute,
    });
  }

  if (!practiceArea && isSearchingForLawyers) {
    return res.render("v2-page-question-practice-area", {
      ...viewProps,
      nextRoute,
    });
  }

  if (!legalAid && isSearchingForLawyers) {
    return res.render("v2-page-question-legal-aid", {
      ...viewProps,
      nextRoute,
    });
  }

  const searchResults = fakeDB.query({ country, serviceType });

  return res.render("v2-page-results-list", {
    ...viewProps,
    searchResults,
    isSearchingForLawyers,
    previousRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}/`,
  });
}

router.get(v2Route, v2RouteHandler);
router.post(v2Route, v2RouteHandler);

module.exports = router;
