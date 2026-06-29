# Healthcare Appointment and Follow-up Manager

A full-stack appointment platform with patient, doctor, and admin portals. Patients book slots, submit symptoms (AI-generated pre-visit summary), and receive post-visit summaries. Doctors manage appointments, notes, and prescriptions. Admins manage doctor profiles and leave schedules.

**Stack**: React, Express, Node.js, PostgreSQL, JWT, Google Calendar API, Nodemailer, OpenAI/Gemini

**Key Features**: Role-based auth, race-condition-safe slot booking, AI symptom analysis, email notifications, Google Calendar sync, medication reminders

**Setup**: `cp .env.example .env` then `npm install` and `npm run dev` in both `/client` and `/server`
