import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured. Please try again later.' },
        { status: 500 }
      );
    }

    try {
      // Send email using Resend
      const result = await resend.emails.send({
        from: 'Contact Form <noreply@mystyledwardrobe.com>',
        to: 'info@mystyledwardrobe.com', // Updated to correct email
        replyTo: email,
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">My Styled Wardrobe</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none;">
              <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin: 0 0 5px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Contact Details</h2>
                <p style="margin: 8px 0; color: #475569; font-size: 16px;"><strong>Name:</strong> ${name}</p>
                <p style="margin: 8px 0; color: #475569; font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #6366f1; text-decoration: none;">${email}</a></p>
              </div>
              
              <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e2e8f0;">
                <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Subject</h2>
                <p style="margin: 0; color: #475569; font-size: 18px; font-weight: 600;">${subject}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Message</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.6;">
                  <p style="margin: 0; color: #334155; font-size: 16px; white-space: pre-line;">${message}</p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Sent via My Styled Wardrobe Contact Form<br>
                  <span style="font-size: 12px;">${new Date().toLocaleString()}</span>
                </p>
              </div>
            </div>
          </div>
        `,
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return NextResponse.json(
          { error: 'Failed to send email. Please try again.' },
          { status: 500 }
        );
      }

      console.log('Contact form email sent successfully:', result.data?.id);
      return NextResponse.json(
        { success: true, message: 'Email sent successfully' },
        { status: 200 }
      );
    } catch (resendError) {
      console.error('Resend API error:', resendError);
      return NextResponse.json(
        { error: 'Email service error. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}