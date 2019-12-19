const express = require('express');

const urlController = require('../controllers/url');

const router = express.Router();

router.use('/url', urlController.getURL);

router.post('/url_response', urlController.urlResponse);

router.use(urlController.incomingFilter);

module.exports = router;