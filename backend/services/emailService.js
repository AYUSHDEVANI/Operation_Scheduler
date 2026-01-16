const nodemailer = require('nodemailer');
const logger = require('../logs/logger');

// Create Transporter
// NOTE: User must configure these in .env
// For Gmail: Use App Password, not main password.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Increased timeouts for cloud environments
  connectionTimeout: 30000, 
  // Force IPv4 to avoid IPv6 routing issues
  family: 4, 
  debug: true, 
  logger: true 
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    logger.error(`SMTP Connection Error (Force IPv4): ${error.message}`);
  } else {
    logger.info("SMTP Server is ready (IPv4)");
  }
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email credentials not found in .env. Skipping email sending.');
    return;
  }

  const mailOptions = {
    from: `"Hospital Scheduler" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
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

module.exports = { sendSurgeryNotification };
