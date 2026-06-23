const nodemailer = require('nodemailer');
const dns = require('dns');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    connectionTimeout: 5000, // 5 seconds connection timeout
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Force IPv4 resolution to prevent ENETUNREACH over IPv6 on Render
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
  });

  const mailOptions = {
    from: `"ChatTalk Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
