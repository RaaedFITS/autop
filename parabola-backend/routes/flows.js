// routes/flows.js
const express = require('express');
const router = express.Router();
const { getFlows, createFlow, deleteFlow } = require('../controllers/flowController');


router.get('/', getFlows);

router.post('/', createFlow);

router.delete('/:id', deleteFlow);

module.exports = router;
