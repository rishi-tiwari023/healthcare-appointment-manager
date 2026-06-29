const express = require('express');
const router = express.Router();
const appointmentsController = require('./appointments.controller');
const validate = require('../../common/middleware/validate.middleware');
const { authenticate, authorize } = require('../../common/middleware/auth.middleware');
const { getSlotsSchema, bookAppointmentSchema } = require('./appointments.schema');

// Fetch available slots for a given doctor & date
router.get(
  '/slots', 
  authenticate, 
  validate(getSlotsSchema, 'query'), 
  appointmentsController.getAvailableSlots
);

// Get user's appointments
router.get(
  '/', 
  authenticate, 
  appointmentsController.getAppointments
);

// Book an appointment (Patient only)
router.post(
  '/', 
  authenticate, 
  authorize('patient'), 
  validate(bookAppointmentSchema), 
  appointmentsController.bookAppointment
);

// Cancel an appointment (Patient, Doctor, Admin)
router.put(
  '/:id/cancel', 
  authenticate, 
  appointmentsController.cancelAppointment
);

module.exports = router;
