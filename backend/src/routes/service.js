const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');

router.post('/request', async (req, res) => {
  try {
    const { tableNumber, requestType } = req.body;

    if (!tableNumber || !requestType) {
      return res.status(400).json({ message: 'Table number and request type are required' });
    }

    if (!['call_waiter', 'request_water', 'request_cleaning'].includes(requestType)) {
      return res.status(400).json({ message: 'Invalid request type' });
    }

    const serviceRequest = new ServiceRequest({
      tableNumber,
      requestType,
      status: 'pending'
    });

    await serviceRequest.save();

    res.status(201).json({ 
      success: true, 
      request: serviceRequest,
      message: 'Service request sent successfully' 
    });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
