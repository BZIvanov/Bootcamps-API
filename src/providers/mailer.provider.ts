import type { Transporter, SendMailOptions } from 'nodemailer';
import nodemailer from 'nodemailer';
import ENV from '@/config/env.config.js';
import logger from '@/config/logger.config.js';

interface MailOptions {
  email: string;
  subject: string;
  text: string;
}

export async function sendEmail(options: MailOptions): Promise<void> {
  const transporter: Transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    auth: {
      user: ENV.SMTP_USERNAME,
      pass: ENV.SMTP_PASSWORD,
    },
  });

  const message: SendMailOptions = {
    from: `${ENV.FROM_NAME ?? 'NoName'} <${ENV.FROM_EMAIL ?? 'no-reply@example.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  const info = await transporter.sendMail(message);

  logger.info('Message sent: %s', info.messageId);
}
