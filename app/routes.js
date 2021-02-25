const express = require('express')
const router = express.Router()
const _ = require('lodash')
const countriesList = require('./data/countries.json')
const practiceAreasList = require('./data/practiceAreas.json')
const thailandLawyers = require('./data/thailand-lawyers.json')
const thailandMedicalFacilities = require('./data/thailand-medical-facilities.json')

console.log(practiceAreasList)

const fakeDB = {
  thailand: {
    lawyers: thailandLawyers,
    'medical-facilities': thailandMedicalFacilities
  },
  spain: {}
}

const DEFAULT_VIEW_PROPS = {
  serviceName: 'Service finder',
  countriesList,
  practiceAreasList,
  thailandLawyers,
  thailandMedicalFacilities
}

router.get('/service-finder-v1/:serviceName?', function (req, res, next) {
  res.render('service-finder-v1', { ...DEFAULT_VIEW_PROPS })
})

// V2 APP
const v2Route =
  '/service-finder-v2/:find?/:serviceType?/:country?/:region?/:practiceArea?/:legalAid?'
function v2RouteHandler (req, res, next) {
  const viewProps = {
    ...DEFAULT_VIEW_PROPS,
    ...req.params
  }

  const { find, serviceType, country, region, practiceArea, legalAid } = req.params

  const isSearchingForLawyers = serviceType === 'lawyers'

  if (!find) {
    return res.render('v2-start', {
      ...viewProps,
      nextRoute: '/service-finder-v2/find',
      previousRoute: '/service-finder-v2/'
    })
  }

  if (!serviceType && !req.body.serviceType) {
    return res.render('v2-question-service-type', {
      ...viewProps,
      nextRoute: '/service-finder-v2/find',
      previousRoute: '/service-finder-v2/'
    })
  } else if (!serviceType && req.body.serviceType) {
    return res.redirect(`/service-finder-v2/find/${req.body.serviceType}`)
  }

  if (!country && !req.body.country) {
    return res.render('v2-question-country', {
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
    return res.render('v2-question-region', {
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
    return res.render('v2-question-practice-area', {
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
    return res.render('v2-question-legal-aid', {
      ...viewProps,
      nextRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}`.toLowerCase(),
      previousRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}`.toLowerCase()
    })
  } else if (!legalAid && isSearchingForLawyers && req.body.legalAid) {
    return res.redirect(
      `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}/${req.body.legalAid}`
    )
  }

  const listToRender = _.get(fakeDB, `${country.toLowerCase()}.${serviceType.toLowerCase()}`, [])

  return res.render('v2-list', {
    ...viewProps,
    listToRender,
    isSearchingForLawyers,
    _,
    previousRoute: `/service-finder-v2/find/${serviceType}/${country}/${region}/${practiceArea}/`
  })
}

router.get(v2Route, v2RouteHandler)
router.post(v2Route, v2RouteHandler)

module.exports = router
