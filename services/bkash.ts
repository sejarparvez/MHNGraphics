'use server';

import axios, { type AxiosError } from 'axios';
import Prisma from '@/lib/prisma';

interface BkashConfig {
  base_url?: string;
  username?: string;
  password?: string;
  app_key?: string;
  app_secret?: string;
}

interface ApplicationFeeDetails {
  amount: number;
  callbackURL: string;
  userId: string;
  applicationId: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
}

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

export async function createPayment(
  bkashConfig: BkashConfig,
  payment: ApplicationFeeDetails,
) {
  const { amount, callbackURL, userId, reference } = payment;

  if (!amount || amount < 1) {
    return {
      statusCode: 400,
      statusMessage: !amount ? 'Amount required' : 'Minimum amount is 1 BDT',
    };
  }

  if (!callbackURL) {
    return {
      statusCode: 400,
      statusMessage: 'Callback URL is required',
    };
  }

  try {
    const response = await axios.post(
      `${bkashConfig.base_url}/tokenized/checkout/create`,
      {
        mode: '0011',
        currency: 'BDT',
        intent: 'sale',
        amount,
        callbackURL,
        payerReference: reference || '1',
        merchantInvoiceNumber: userId,
      },
      {
        headers: await authHeaders(bkashConfig),
      },
    );

    return response.data;
    // biome-ignore lint: error
  } catch (e) {
    return handleAxiosError('Create Bkash Payment Error');
  }
}

export async function executePayment(
  bkashConfig: BkashConfig,
  paymentID: string,
) {
  try {
    const response = await axios.post(
      `${bkashConfig.base_url}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: await authHeaders(bkashConfig),
      },
    );
    return response.data;
    // biome-ignore lint: error
  } catch (e) {
    return handleAxiosError('Bkash executePayment Error');
  }
}

export async function queryPayment(
  bkashConfig: BkashConfig,
  paymentID: string,
) {
  try {
    const response = await axios.post(
      `${bkashConfig.base_url}/tokenized/checkout/payment/status`,
      { paymentID },
      {
        headers: await authHeaders(bkashConfig),
      },
    );
    return response.data;
    // biome-ignore lint: error
  } catch (e) {
    return handleAxiosError('Bkash queryPayment Error');
  }
}

// Generate Auth Headers
const authHeaders = async (bkashConfig: BkashConfig) => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  authorization: await grantToken(bkashConfig),
  // biome-ignore lint: error
  'x-app-key': bkashConfig.app_key!,
});

// Token Grant
const grantToken = async (bkashConfig: BkashConfig): Promise<string | null> => {
  try {
    const existingToken = await Prisma.bkashToken.findFirst();

    if (!existingToken || isTokenExpired(existingToken)) {
      return await setToken(bkashConfig);
    }

    return existingToken.token;
    // biome-ignore lint: error
  } catch (e) {
    return null;
  }
};

// Set New Token
const setToken = async (bkashConfig: BkashConfig): Promise<string | null> => {
  const response = await axios.post(
    `${bkashConfig.base_url}/tokenized/checkout/token/grant`,
    {
      app_key: bkashConfig.app_key,
      app_secret: bkashConfig.app_secret,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // biome-ignore lint: error
        username: bkashConfig.username!,
        // biome-ignore lint: error
        password: bkashConfig.password!,
      },
    },
  );

  const idToken = response.data?.id_token;
  const expiresIn = response.data?.expires_in ?? 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  if (idToken) {
    const existing = await Prisma.bkashToken.findFirst();

    if (existing) {
      await Prisma.bkashToken.update({
        where: { id: existing.id },
        data: { token: idToken, expiresAt },
      });
    } else {
      await Prisma.bkashToken.create({
        data: { token: idToken, expiresAt },
      });
    }
  }

  return idToken;
};

// Token Expiry Check
const isTokenExpired = (
  tokenRecord: { expiresAt: Date } | { updatedAt: Date },
) => {
  if ('expiresAt' in tokenRecord) {
    return (
      new Date() >
      new Date(tokenRecord.expiresAt.getTime() - TOKEN_EXPIRY_BUFFER_MS)
    );
  }

  return tokenRecord.updatedAt < new Date(Date.now() - TOKEN_EXPIRY_MS);
};

// Axios Error Handler
const handleAxiosError = (error: unknown) => {
  const err = error as AxiosError;

  return {
    statusCode: 500,
    statusMessage: 'Something went wrong',
    error: err?.response?.data || err.message,
  };
};
