import axios from 'axios';

const SMS_CONFIG = {
  // biome-ignore lint/style/noNonNullAssertion: this is fine
  apiKey: process.env.BULKSMS_API_KEY!,
  // biome-ignore lint/style/noNonNullAssertion: this is fine
  senderId: process.env.BULKSMS_SENDER_ID!,
  baseUrl: 'https://bulksmsbd.net/api/smsapi',
  balanceUrl: 'https://bulksmsbd.net/api/getBalanceApi',
} as const;

export async function sendSMS(phone: string, message: string) {
  const { data } = await axios.get(SMS_CONFIG.baseUrl, {
    params: {
      api_key: SMS_CONFIG.apiKey,
      type: 'text',
      number: phone,
      senderid: SMS_CONFIG.senderId,
      message,
    },
  });
  return data;
}

export async function checkBalance() {
  const { data } = await axios.get(SMS_CONFIG.balanceUrl, {
    params: {
      api_key: SMS_CONFIG.apiKey,
    },
  });
  return data;
}
