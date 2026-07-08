class MockRazorpay {
  constructor(options) {
    this.key_id = options.key_id;
    this.key_secret = options.key_secret;
    this.orders = {
      create: async (data) => {
        return {
          id: 'order_mock_' + Math.random().toString(36).substr(2, 9),
          amount: data.amount,
          currency: data.currency,
          status: 'created'
        };
      }
    };
  }
}

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || keyId.includes('mockkey')) {
    console.warn('Razorpay: Using mock provider.');
    return new MockRazorpay({ key_id: keyId, key_secret: keySecret });
  }
  
  return new MockRazorpay({ key_id: keyId, key_secret: keySecret });
};

const razorpayInstance = getRazorpayInstance();
export default razorpayInstance;
