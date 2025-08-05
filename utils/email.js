// utils/email.js
require('dotenv').config(); 
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create transporter (use your email service)
  const transporter = nodemailer.createTransport({
     service: "Gmail",
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2. Define email options
  const mailOptions = {
    from: 'Sumaya <support@sumaya.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: options.html (you could use HTML templates)
  };

  // 3. Send email
 try {
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.response);
} catch (err) {
  console.error('Email error:', err); // full log
}

};

module.exports = sendEmail;