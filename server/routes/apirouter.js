const express = require('express');
const router = express.Router();
const authController = require('../middleware/authController');
const argoController = require('../middleware/argoController');
const updateController = require('../middleware/updateController');
const checkAppsUpdate = require('../middleware/updateAppList');

//endpoint for checking if user is authenticated
router.get('/checkUser', authController.isLoggedIn, (req, res) => {
  console.log('user is being checked');
  return res.json(req.user);
})

//endpoint for apps request
router.get('/apps', argoController.getApps, (req, res) => {
  return res.status(200).json(res.locals.apps)
});

//endpoint for manifest request for a specific app
router.get('/manifest', argoController.getManifests, (req, res) => {
  return res.json(res.locals.manifests)
})

//endpoint to check for argoToken and start query to argo API
router.get('/argoToken', argoController.checkToken, updateController.updateApp, updateController.updateAppDatabase, updateController.addManifestForApp, updateController.startConstantUpdate, (req, res) => {
  setTimeout(() => checkAppsUpdate(res.locals.argoToken.url, res.locals.argoToken.api_key), 5000)
  return res.status(200).json(res.locals.argoToken)
})

module.exports = router;