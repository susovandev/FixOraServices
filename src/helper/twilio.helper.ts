import Logger from 'config/logger.config.js';
import twilioClient from 'config/twilio.config.js';

export interface ISendSMSOptions {
  body: string;
  to: string;
}
export default async function sendSMS({ body, to }: ISendSMSOptions) {
  try {
    if (!to) {
      throw new Error('No phone number provided');
    }

    await twilioClient.messages.create({
      body: body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
  } catch (error) {
    Logger.error(`Twilio SMS sending failed`, error);
    throw error;
  }
}
