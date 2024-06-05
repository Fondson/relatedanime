const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendMail = async (
  subject,
  html,
  from_email = process.env.SYSTEM_EMAIL,
  to_email = process.env.ADMIN_EMAIL,
) => {
  const msg = {
    to: to_email,
    from: from_email,
    subject,
    html,
  }
  await sgMail.send(msg)
}

module.exports = { sendMail }
