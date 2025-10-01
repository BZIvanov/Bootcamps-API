import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import logger from '@/config/logger.js';

interface MailOptions {
  email: string;
  subject: string;
  text: string;
}

export async function sendEmail(options: MailOptions): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined;
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration is missing in environment variables');
  }

  const transporter: Transporter = nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });

  const message: SendMailOptions = {
    from: `${process.env.FROM_NAME ?? 'NoName'} <${process.env.FROM_EMAIL ?? 'no-reply@example.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  const info = await transporter.sendMail(message);

  logger.info('Message sent: %s', info.messageId);
}
