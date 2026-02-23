import Logger from 'config/logger.config.js';
import twilioClient from 'config/twilio.config.js';

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  if (phone.startsWith('+') && cleaned.length >= 10) {
    return phone;
  }

  throw new Error('Invalid phone number format');
}

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
