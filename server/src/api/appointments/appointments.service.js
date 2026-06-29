const db = require('../../db');

class AppointmentsService {
  /**
   * Helper function to generate time slots between a start and end time
   * @param {string} startTime - HH:MM:SS
   * @param {string} endTime - HH:MM:SS
   * @param {number} durationMinutes 
   */
  generateSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    let [startH, startM, startS] = startTime.split(':').map(Number);
    const [endH, endM, endS] = endTime.split(':').map(Number);
    
    let currentTotalMinutes = startH * 60 + startM;
    const endTotalMinutes = endH * 60 + endM;

    while (currentTotalMinutes + durationMinutes <= endTotalMinutes) {
      const h = Math.floor(currentTotalMinutes / 60);
      const m = currentTotalMinutes % 60;
      const formattedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
      slots.push(formattedTime);
      currentTotalMinutes += durationMinutes;
    }
    
    return slots;
  }

  async getAvailableSlots(doctorId, date) {
    // 1. Check if doctor is on leave
    const leaveResult = await db.query(
      'SELECT id FROM doctor_leave WHERE doctor_id = $1 AND leave_date = $2',
      [doctorId, date]
    );
    if (leaveResult.rowCount > 0) {
      return []; // Doctor is on leave, no slots available
    }

    // 2. Determine day of week (0 = Sunday in JS, check if matching postgres or standard)
    const dateObj = new Date(date + 'T00:00:00Z');
    const dayOfWeek = dateObj.getUTCDay();

    // 3. Fetch availability and doctor details (for slot duration)
    const availabilityResult = await db.query(
      `SELECT a.start_time, a.end_time, d.slot_duration_minutes 
       FROM doctor_availability a
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.doctor_id = $1 AND a.day_of_week = $2`,
      [doctorId, dayOfWeek]
    );

    if (availabilityResult.rowCount === 0) {
      return []; // Doctor does not work on this day
    }

    let allGeneratedSlots = [];
    const slotDuration = availabilityResult.rows[0].slot_duration_minutes;

    // Doctor might have multiple shifts (e.g. morning and evening)
    for (const shift of availabilityResult.rows) {
      const slotsForShift = this.generateSlots(shift.start_time, shift.end_time, slotDuration);
      allGeneratedSlots = allGeneratedSlots.concat(slotsForShift);
    }

    // 4. Fetch existing active appointments
    const appointmentsResult = await db.query(
      `SELECT slot_time FROM appointments 
       WHERE doctor_id = $1 AND appointment_date = $2 AND status != 'cancelled'`,
      [doctorId, date]
    );

    const bookedSlots = appointmentsResult.rows.map(r => r.slot_time);

    // 5. Filter out booked slots
    const availableSlots = allGeneratedSlots.filter(slot => !bookedSlots.includes(slot));
    
    return availableSlots;
  }

  async bookAppointment(patientUserId, data) {
    const { doctor_id, appointment_date, slot_time } = data;

    // First get the actual patient_id from the users table
    const patientResult = await db.query('SELECT id FROM patients WHERE user_id = $1', [patientUserId]);
    if (patientResult.rowCount === 0) {
      throw { statusCode: 404, message: 'Patient profile not found for this user' };
    }
    const patient_id = patientResult.rows[0].id;

    // Ensure slot is valid and available (Double check)
    const availableSlots = await this.getAvailableSlots(doctor_id, appointment_date);
    if (!availableSlots.includes(slot_time)) {
       throw { statusCode: 400, message: 'This slot is not available or outside working hours' };
    }

    try {
      const result = await db.query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, slot_time, status)
         VALUES ($1, $2, $3, $4, 'booked') RETURNING *`,
        [patient_id, doctor_id, appointment_date, slot_time]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation (Concurrency protection)
        throw { statusCode: 409, message: 'This time slot was just booked by someone else. Please select another slot.' };
      }
      throw error;
    }
  }

  async getAppointments(userId, role) {
    // This query is dynamic based on role
    let query = `
      SELECT 
        a.id, a.appointment_date, a.slot_time, a.status,
        p.first_name AS patient_first_name, p.last_name AS patient_last_name,
        d.first_name AS doctor_first_name, d.last_name AS doctor_last_name, d.specialisation
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
    `;
    const params = [];

    if (role === 'patient') {
      query += ` WHERE p.user_id = $1`;
      params.push(userId);
    } else if (role === 'doctor') {
      query += ` WHERE d.user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY a.appointment_date DESC, a.slot_time DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  async cancelAppointment(appointmentId, userId, role) {
    const appointmentResult = await db.query(
      `SELECT a.id, p.user_id AS patient_user_id, d.user_id AS doctor_user_id, a.status 
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = $1`,
      [appointmentId]
    );

    if (appointmentResult.rowCount === 0) {
      throw { statusCode: 404, message: 'Appointment not found' };
    }

    const appt = appointmentResult.rows[0];

    // RBAC verification
    if (role !== 'admin' && appt.patient_user_id !== userId && appt.doctor_user_id !== userId) {
      throw { statusCode: 403, message: 'Forbidden to cancel this appointment' };
    }

    if (appt.status === 'cancelled') {
      throw { statusCode: 400, message: 'Appointment is already cancelled' };
    }

    const result = await db.query(
      `UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [appointmentId]
    );
    
    return result.rows[0];
  }
}

module.exports = new AppointmentsService();
