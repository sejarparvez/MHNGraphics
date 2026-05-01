import { type NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// Define a schema for input validation
const contactSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

// Escapes user input before embedding in HTML to prevent injection attacks
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, phoneNumber, message } = contactSchema.parse(body);

    // Sanitize all user-controlled values before using in HTML
    const safeUsername = escapeHtml(username);
    const safeEmail = escapeHtml(email);
    const safePhoneNumber = phoneNumber ? escapeHtml(phoneNumber) : undefined;
    const safeMessage = escapeHtml(message);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Oylkka IT" <${process.env.SMTP_SENDER}>`,
      to: 'contact@freelancermohon.com',
      subject: 'New Contact Form Submission',
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Inter', Arial, sans-serif;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 50px; background-color: #4f46e5; background-image: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #ffffff; text-align: left;">New Contact Form Submission</h1>
                        </td>
                    </tr>
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 50px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">Hello, you have received a new message from your contact form:</p>
                            <table role="presentation" style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
                                <tr>
                                    <td style="padding: 16px; background-color: #f3f4f6; border-radius: 6px;">
                                        <p style="margin: 0 0 8px 0;"><strong style="color: #4f46e5; font-weight: 600;">Name:</strong> ${safeUsername}</p>
                                        <p style="margin: 0 0 8px 0;"><strong style="color: #4f46e5; font-weight: 600;">Email:</strong> ${safeEmail}</p>
                                        ${safePhoneNumber ? `<p style="margin: 0 0 8px 0;"><strong style="color: #4f46e5; font-weight: 600;">Phone Number:</strong> ${safePhoneNumber}</p>` : ''}
                                        <p style="margin: 0 0 8px 0;"><strong style="color: #4f46e5; font-weight: 600;">Message:</strong></p>
                                        <p style="margin: 0; padding: 12px; background-color: #ffffff; border-radius: 4px; border-left: 4px solid #4f46e5;">${safeMessage}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 50px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">Thank you for using our service!</p>
                            <p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                                Contact Us: <a href="mailto:${process.env.SMTP_SENDER}" style="color: #4f46e5; text-decoration: none;">${process.env.SMTP_SENDER}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
