const axios = require('axios');
const logger = require('../logs/logger');

// Brevo API Endpoint
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send an email using Brevo (Sendinblue) API via Axios
 * This uses HTTP (Port 443) which works on Render Free Tier
 */
const sendEmail = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    logger.warn('BREVO_API_KEY or BREVO_SENDER_EMAIL not found in .env. Skipping email.');
    return;
  }

  const data = {
    sender: { email: senderEmail, name: 'Hospital Scheduler' },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
  };

  try {
    const response = await axios.post(BREVO_URL, data, {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      timeout: 10000 // 10s timeout
    });

    logger.info(`Email sent successfully via Brevo: ${response.data.messageId || 'OK'}`);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      logger.error(`Brevo API Error: ${JSON.stringify(error.response.data)}`);
    } else {
      logger.error(`Error sending email: ${error.message}`);
    }
  }
};

const sendSurgeryNotification = async (recipientEmail, surgeryDetails, type) => {
    let subject = '';
    let message = '';

    const { patientName, doctorName, date, time, ot } = surgeryDetails;

    switch (type) {
        case 'SCHEDULED':
            subject = 'Surgery Scheduled Confirmation';
            message = `
                <h3>Surgery Scheduled</h3>
                <p>Dear User,</p>
                <p>A surgery has been scheduled with the following details:</p>
                <ul>
                    <li><strong>Patient:</strong> ${patientName}</li>
                    <li><strong>Doctor:</strong> ${doctorName}</li>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                    <li><strong>OT:</strong> ${ot}</li>
                </ul>
                <p>Please log in to the portal for more details.</p>
            `;
            break;
        case 'CANCELLED':
            subject = 'URGENT: Surgery Cancelled';
            message = `
                <h3 style="color: red;">Surgery Cancelled</h3>
                <p>The following surgery has been cancelled:</p>
                <ul>
                    <li><strong>Patient:</strong> ${patientName}</li>
                    <li><strong>Doctor:</strong> ${doctorName}</li>
                    <li><strong>Date:</strong> ${date}</li>
                </ul>
            `;
            break;
        case 'RESCHEDULED':
            subject = 'Surgery Rescheduled Update';
            message = `
                <h3>Surgery Rescheduled</h3>
                <p>The surgery details have been updated:</p>
                <ul>
                    <li><strong>Patient:</strong> ${patientName}</li>
                    <li><strong>New Date:</strong> ${date}</li>
                    <li><strong>New Time:</strong> ${time}</li>
                </ul>
            `;
            break;
        default:
            subject = 'Surgery Update';
            message = '<p>There is an update regarding your surgery.</p>';
    }

    await sendEmail(recipientEmail, subject, message);
};

const sendOTP = async (email, otp) => {
    const subject = 'Password Reset OTP';
    const message = `
        <h3>Password Reset Request</h3>
        <p>Your OTP for password reset is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;
    await sendEmail(email, subject, message);
};

const sendRoleChangeNotification = async (email, name, newRole) => {
    const subject = 'Your Account Role Has Changed';
    const message = `
        <h3>Role Update Notification</h3>
        <p>Hello ${name},</p>
        <p>Your account role has been updated by the Super Admin.</p>
        <p>Your new role is: <strong style="color: #2563eb;">${newRole}</strong></p>
        <p>Please log out and log back in to access your new privileges.</p>
    `;
    await sendEmail(email, subject, message);
};

module.exports = { sendSurgeryNotification, sendOTP, sendRoleChangeNotification };
