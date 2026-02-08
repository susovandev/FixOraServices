import twilio from 'twilio';

import envConfig from './env.config.js';

const twilioClient = twilio(envConfig.TWILIO_ACCOUNT_SID, envConfig.TWILIO_AUTH_TOKEN);

export default twilioClient;
