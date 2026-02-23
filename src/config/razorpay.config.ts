import Razorpay from 'razorpay';

const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_TEST_API_SECRET,
});

export default razorpayClient;
