const express = require('express');
const Flip = require('./flip');

const router = express.Router();
router.use('/rps', Flip);
module.exports = router;
