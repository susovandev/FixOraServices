import nodemailer from 'nodemailer';
import envConfig from './env.config.js';

const transporter = nodemailer.createTransport({
  service: envConfig.MAIL_SERVICE,
  host: envConfig.MAIL_HOST,
  port: Number(envConfig.MAIL_PORT),
  secure: Number(envConfig.MAIL_PORT) === 587,
  auth: {
    user: envConfig.MAIL_USER,
    pass: envConfig.MAIL_PASSWORD,
  },
});

export default transporter;
