const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/db-status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: states[state],
    readyState: state,
    message: state === 1 ? 'MongoDB is connected' : 'MongoDB is not connected'
  });
});

module.exports = router;
