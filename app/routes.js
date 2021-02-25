const querystring = require('querystring');
const express = require('express')
const router = express.Router()
const _ = require('lodash')
const countriesList = require('./data/countries.json')
const practiceAreasList = require('./data/practiceAreas.json')
const thailandLawyers = require('./data/thailand-lawyers.json')
const thailandMedicalFacilities = require('./data/thailand-medical-facilities.json')

const fakeDB = {
  thailand: {
    lawyers: thailandLawyers,
    'medical-facilities': thailandMedicalFacilities
  },
  spain: {},
  query: function (params) {
    const { country, serviceType } = params
    return _.get(this, `${country.toLowerCase()}.${serviceType.toLowerCase()}`, [])
  }
}

const DEFAULT_VIEW_PROPS = {
  _,
  serviceName: 'Service finder',
  countriesList,
  practiceAreasList,
  thailandLawyers,
  thailandMedicalFacilities
}

const v1Route = '/service-finder-v1/:find?'
function v1RouteHandler (req, res) {
  const { find } = req.params

  const params = {
    ...req.query,
    ...req.body
  }

  const {
    serviceType,
    country,
    region,
    practiceArea,
    legalAid
  } = params

  const isSearchingForLawyers = serviceType === 'lawyers'

  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&')

  const viewProps = {
    ...params,
    ...DEFAULT_VIEW_PROPS,
    responses: { ...req.query }
  }

  if (!find) {
    return res.render('start-page', {
      ...viewProps,
      nextRoute: '/service-finder-v1/find',
      previousRoute: '/service-finder-v1/'
    })
  }

  let questionToRender
  let searchResults = []

  if (!serviceType) {
    questionToRender = 'question-service-type.html'
  } else if (!country) {
    questionToRender = 'question-country.html'
  } else if (!region) {
    questionToRender = 'question-region.html'
  } else if (!region) {
    questionToRender = 'question-region.html'
  } else if (!practiceArea && isSearchingForLawyers) {
    questionToRender = 'question-practice-area.html'
  } else if (!legalAid && isSearchingForLawyers) {
    questionToRender = 'question-legal-aid.html'
  } else if (req.method === 'POST') {
    return res.redirect(`/service-finder-v1/find?${queryString}`)
  } else {
    searchResults = fakeDB.query({ country, serviceType })
  }

  return res.render('v1-service-finder', {
    ...viewProps,
    previousRoute: '/service-finder-v1/',
    nextRoute: `/service-finder-v1/find?${queryString}`,
    questionToRender,
    params,
    searchResults,
    removeQueryParameter: (route, parameterName) => {
      const [path, query] = route.split(/\?/)
      const params = querystring.parse(query)
      delete params[parameterName]
      return `${path}?${querystring.stringify(params)}`
    }
  })
}

router.get(v1Route, v1RouteHandler)
router.post(v1Route, v1RouteHandler)

// V2 APP
const v2Route =
  '/service-finder-v2/:find?/:serviceType?/:country?/:region?/:practiceArea?/:legalAid?'
function v2RouteHandler (req, res) {
  const viewProps = {
    ...DEFAULT_VIEW_PROPS,
    ...req.params
  }

  const { find, serviceType, country, region, practiceArea, legalAid } = req.params

  const isSearchingForLawyers = serviceType === 'lawyers'

  if (!find) {
    return res.render('start-page', {
      ...viewProps,
      nextRoute: '/service-finder-v2/find',
      previousRoute: '/service-finder-v2/'
    })
  }

  if (!serviceType && !req.body.serviceType) {
    return res.render('v2-page-question-service-type', {
      ...viewProps,
      nextRoute: '/service-finder-v2/find',
      previousRoute: '/service-finder-v2/'
    })
  } else if (!serviceType && req.body.serviceType) {
    return res.redirect(`/service-finder-v2/find/${req.body.serviceType}`)
  }

  if (!country && !req.body.country) {
    return res.render('v2-page-question-country', {
      ...viewProps,
      nextRoute: `/service-finder-v2/find/${serviceType}`,
      previousRoute: '/service-finder-v2/find'
    })
  } else if (!country && req.body.country) {
    return res.redirect(
      `/service-finder-v2/find/${serviceType}/${req.body.country.toLowerCase()}`
    )
  }

  if (!region && !req.body.region) {
    return res.render('v2-page-question-region', {
      ...viewProps,
      nextRoute: `/service-finder-v2/find/${serviceType}/${country}`,
      previousRoute: `/service-finder-v2/find/${serviceType}`
    })
  } else if (!region && req.body.region) {
    return res.redirect(
      `/service-finder-v2/find/${serviceType}/${country}/${req.body.region.toLowerCase()}`
    )
  }

  if (!practiceArea && isSearchingForLawyers && !req.body.practiceArea) {
    return res.render('v2-page-question-practice-area', {
      ...viewProps,
      nextRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}`.toLowerCase(),
      previousRoute: `/service-finder-v2/find/${serviceType}/${country}`
    })
  } else if (!practiceArea && isSearchingForLawyers && req.body.practiceArea) {
    return res.redirect(
      `/service-finder-v2/find/${serviceType}/${country}/${region}/${req.body.practiceArea}`
    )
  }

  if (!legalAid && isSearchingForLawyers && !req.body.legalAid) {
    return res.render('v2-page-question-legal-aid', {
      ...viewProps,
      nextRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}`.toLowerCase(),
      previousRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}`.toLowerCase()
    })
  } else if (!legalAid && isSearchingForLawyers && req.body.legalAid) {
    return res.redirect(
      `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}/${req.body.legalAid}`
    )
  }

  const searchResults = fakeDB.query({ country, serviceType })

  return res.render('v2-page-results-list', {
    ...viewProps,
    searchResults,
    isSearchingForLawyers,
    previousRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}/`
  })
}

router.get(v2Route, v2RouteHandler)
router.post(v2Route, v2RouteHandler)

module.exports = router
