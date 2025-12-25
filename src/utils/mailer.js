const nodemailer = require('nodemailer');
require('dotenv').config();

let transporterPromise = null;

async function createTransporter() {
  // If SMTP env vars provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  // Otherwise create an Ethereal account for dev/testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function getTransporter() {
  if (!transporterPromise) transporterPromise = createTransporter();
  return transporterPromise;
}

function verificationEmailHtml(name, url) {
  return `
    <div style="font-family:Inter,system-ui,Arial;line-height:1.4;color:#111">
      <h2>Hola ${name || ''},</h2>
      <p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
      <p><a href="${url}">${url}</a></p>
      <p>Si no reconoces esta acción, ignora este mensaje.</p>
    </div>`;
}

async function sendVerificationEmail(to, token, name) {
  const transporter = await getTransporter();
  const verifyUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email/${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@karejack.art',
    to,
    subject: 'Verifica tu cuenta - Kare Jack Art',
    html: verificationEmailHtml(name, verifyUrl),
    text: `Visita ${verifyUrl} para verificar tu cuenta`,
  });

  // If using Ethereal, log preview URL
  if (nodemailer.getTestMessageUrl && info) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.info('[Mailer] Preview URL (dev only):', preview);
  }

  return info;
}

async function sendResetEmail(to, token) {
  const transporter = await getTransporter();
  const resetUrl = `${process.env.APP_BASE_URL || 'http://localhost:3000'}/reset-password/${encodeURIComponent(token)}`;
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@karejack.art',
    to,
    subject: 'Restablece tu contraseña - Kare Jack Art',
    html: `<p>Pide restablecer la contraseña. Usa este enlace:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    text: `Visita ${resetUrl} para restablecer tu contraseña`,
  });

  if (nodemailer.getTestMessageUrl && info) {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.info('[Mailer] Reset preview (dev only):', preview);
  }

  return info;
}

module.exports = {
  sendVerificationEmail,
  sendResetEmail,
};
