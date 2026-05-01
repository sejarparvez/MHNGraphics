import { type NextRequest, NextResponse } from 'next/server';
import { bkashConfig } from '@/lib/bkash';
import Prisma from '@/lib/prisma';
import { executePayment, queryPayment } from '@/services/bkash';
import cloudinary from '@/utils/cloudinary';

export async function GET(req: NextRequest) {
  const myUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const query = req.nextUrl.searchParams;
    const paymentID = query.get('paymentID');
    const status = query.get('status');
    const statusMessage = query.get('statusMessage');
    const applicationId = query.get('applicationId');
    const userId = query.get('userId');

    if (!paymentID || !applicationId || !userId) {
      return NextResponse.redirect(
        `${myUrl}/oylkka-it-and-training-center/application/cancel?error=invalid_callback_parameters`,
        303,
      );
    }

    const application = await Prisma.application.findUnique({
      where: { id: applicationId, userId },
    });

    if (!application) {
      return NextResponse.redirect(
        `${myUrl}/oylkka-it-and-training-center/application/cancel?error=application_not_found`,
        303,
      );
    }

    // Handle explicit status failure (e.g., user cancels or payment gateway fails)
    if (status && status !== 'success') {
      await Prisma.application.update({
        where: { id: applicationId },
        data: {
          applicationFee: 'FAILED',
          metadata: {
            // biome-ignore lint: error
            ...(application.metadata as Record<string, any>),
            failedAt: new Date().toISOString(),
            paymentFailedReason: statusMessage ?? 'Bkash payment failed',
          },
        },
      });

      if (application.imageId) {
        const result = await cloudinary.uploader.destroy(application.imageId);
        if (result.result !== 'ok') {
          // biome-ignore lint: error
          console.error('Error deleting image from Cloudinary:', result);
        }
      }

      await Prisma.application.delete({
        where: { id: applicationId },
      });

      return NextResponse.redirect(
        `${myUrl}/oylkka-it-and-training-center/application/cancel?reason=${encodeURIComponent(
          statusMessage || 'Payment failed',
        )}`,
        303,
      );
    }

    // Step 1: Try executing payment
    const executePaymentResponse = await executePayment(bkashConfig, paymentID);

    // Step 2: If execution fails, check with query API
    if (executePaymentResponse.statusCode !== '0000') {
      const queryResponse = await queryPayment(bkashConfig, paymentID);

      const isSuccessfulQuery =
        queryResponse.statusCode === '0000' &&
        queryResponse.transactionStatus === 'Completed';

      if (isSuccessfulQuery) {
        await Prisma.application.update({
          where: { id: applicationId },
          data: {
            applicationFee: 'PAID',
            transactionId: queryResponse.trxID,
            metadata: {
              // biome-ignore lint: error
              ...(application.metadata as Record<string, any>),
              bkashTransactionId: queryResponse.trxID,
              paymentId: paymentID,
              paymentExecuteTime: new Date().toISOString(),
              paymentComplete: true,
              bkashResponse: queryResponse,
              paymentPending: false,
              executionFailedButQuerySucceeded: true,
            },
          },
        });

        return NextResponse.redirect(
          `${myUrl}/oylkka-it-and-training-center/application/success?applicationId=${application.id}`,
          303,
        );
      }

      // If both execution and query failed → delete application
      if (application.imageId) {
        const result = await cloudinary.uploader.destroy(application.imageId);
        if (result.result !== 'ok') {
          // biome-ignore lint: error
          console.error('Error deleting image from Cloudinary:', result);
        }
      }
      await Prisma.application.delete({ where: { id: applicationId } });

      return NextResponse.redirect(
        `${myUrl}/oylkka-it-and-training-center/application/cancel?error=${encodeURIComponent(
          executePaymentResponse.statusMessage || 'Payment execution failed',
        )}`,
        303,
      );
    }

    // If execute succeeded
    await Prisma.application.update({
      where: { id: applicationId },
      data: {
        applicationFee: 'PAID',
        transactionId: executePaymentResponse.trxID,
        metadata: {
          // biome-ignore lint: error
          ...(application.metadata as Record<string, any>),
          bkashTransactionId: executePaymentResponse.trxID,
          paymentId: executePaymentResponse.paymentID,
          paymentExecuteTime: new Date().toISOString(),
          paymentComplete: true,
          bkashResponse: executePaymentResponse,
          paymentPending: false,
        },
      },
    });

    return NextResponse.redirect(
      `${myUrl}/oylkka-it-and-training-center/application/success?applicationId=${application.id}`,
      303,
    );
    // biome-ignore lint: error
  } catch (error) {
    return NextResponse.redirect(
      `${myUrl}/oylkka-it-and-training-center/application/cancel?error=server_error`,
      303,
    );
  }
}
