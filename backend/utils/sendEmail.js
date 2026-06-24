const nodemailer = require('nodemailer');
const dns = require('dns');

const sendEmail = async (options) => {
  const fromEmail = process.env.EMAIL_FROM || 'Talkify <onboarding@resend.dev>';
  
  // 1. Try SendGrid API if configured
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('Sending email via SendGrid API...');
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.email }] }],
          from: { email: fromEmail.includes('<') ? fromEmail.split('<')[1].replace('>', '').trim() : fromEmail },
          subject: options.subject,
          content: [
            { type: 'text/plain', value: options.message },
            { type: 'text/html', value: options.html }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`SendGrid API response error: ${JSON.stringify(errorData)}`);
      }

      console.log('Email sent successfully via SendGrid API');
      return;
    } catch (apiError) {
      console.error('SendGrid API failed:', apiError.message);
    }
  }

  // 2. Try Resend API if configured
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
          from: fromEmail,
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

  // 3. Fallback to Gmail SMTP (Note: Render's free tier blocks SMTP ports 25, 465, and 587)
  console.log('Attempting SMTP fallback...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465 SSL/TLS
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4 }, callback);
    },
  });

  const mailOptions = {
    from: `"${fromEmail.split('<')[0].trim() || 'ChatTalk Support'}" <${process.env.EMAIL_USER || fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
