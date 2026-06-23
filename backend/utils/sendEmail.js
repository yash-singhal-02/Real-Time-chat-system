const nodemailer = require('nodemailer');
const dns = require('dns');

const sendEmail = async (options) => {
  const resendApiKey = process.env.RESEND_API_KEY || 're_ZTrWcgyC_6n22MUK5dyuo27gyRrpXaGFr';

  if (resendApiKey) {
    try {
      console.log('Sending email via Resend API...');
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'Talkify <onboarding@resend.dev>',
          to: options.email,
          subject: options.subject,
          text: options.message,
          html: options.html,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Resend API response error: ${JSON.stringify(errorData)}`);
      }

      console.log('Email sent successfully via Resend API');
      return;
    } catch (apiError) {
      console.error('Resend API failed, falling back to SMTP:', apiError.message);
    }
  }

  console.log('Attempting SMTP fallback...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465 SSL/TLS
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
