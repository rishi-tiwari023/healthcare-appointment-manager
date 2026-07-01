const getBookingConfirmationTemplate = (patientName, doctorName, date, time) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #4CAF50;">Appointment Confirmed!</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment with <strong>${doctorName}</strong> has been successfully booked.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
      </div>
      <p>Please arrive 10 minutes early. If you need to cancel or reschedule, you can do so from your patient portal.</p>
      <p>Best Regards,<br>Healthcare Clinic</p>
    </div>
  `;
};

const getReminderTemplate = (patientName, doctorName, date, time) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2196F3;">Appointment Reminder</h2>
      <p>Dear ${patientName},</p>
      <p>This is a reminder for your upcoming appointment with <strong>${doctorName}</strong>.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
      </div>
      <p>We look forward to seeing you soon!</p>
      <p>Best Regards,<br>Healthcare Clinic</p>
    </div>
  `;
};

const getCancellationTemplate = (patientName, doctorName, date, time) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #F44336;">Appointment Cancelled</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment with <strong>${doctorName}</strong> scheduled for <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
      <p>If you wish to book another appointment, please visit the portal.</p>
      <p>Best Regards,<br>Healthcare Clinic</p>
    </div>
  `;
};

const getLeaveNotificationTemplate = (patientName, doctorName, date) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #FF9800;">Important: Appointment Rescheduling Required</h2>
      <p>Dear ${patientName},</p>
      <p>Unfortunately, <strong>${doctorName}</strong> has marked a leave on <strong>${date}</strong>.</p>
      <p>Your appointment on this date has been cancelled. We apologize for the inconvenience.</p>
      <p>Please visit the portal to reschedule your appointment at your earliest convenience.</p>
      <p>Best Regards,<br>Healthcare Clinic</p>
    </div>
  `;
};

const getRescheduleTemplate = (patientName, doctorName, oldDate, oldTime, newDate, newTime) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #9C27B0;">Appointment Rescheduled</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment with <strong>${doctorName}</strong> has been successfully rescheduled.</p>
      <p><strong>Previous Appointment:</strong> ${oldDate} at ${oldTime}</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #333;">New Appointment Details</h3>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${newDate}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${newTime}</p>
      </div>
      <p>Best Regards,<br>Healthcare Clinic</p>
    </div>
  `;
};

module.exports = {
  getBookingConfirmationTemplate,
  getReminderTemplate,
  getCancellationTemplate,
  getLeaveNotificationTemplate,
  getRescheduleTemplate,
};
