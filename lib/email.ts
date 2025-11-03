import { Resend } from 'resend';

// Initialize Resend with a dummy key if not provided (build time)
// The real key will be used at runtime from environment variables
const RESEND_API_KEY = process.env['RESEND_API_KEY'] || 're_dummy_key_for_build';
const resend = new Resend(RESEND_API_KEY);

const ADMIN_EMAIL = 'admin@mystyledwardrobe.com';
const FROM_EMAIL = 'MyStyled Wardrobe <admin@mystyledwardrobe.com>';

/**
 * Send verification request notification to admin with customer's AI analysis photo
 */
export async function sendVerificationRequestToAdmin({
  customerEmail,
  customerName,
  bodyShape,
  colorPalette,
  imageUrls,
  verificationId,
}: {
  customerEmail: string;
  customerName?: string;
  bodyShape: string;
  colorPalette: string;
  imageUrls: string[];
  verificationId: string;
}) {
  try {
    console.log('📧 Attempting to send verification request to admin...');
    console.log('   - Customer:', customerEmail);
    console.log('   - Image URLs:', imageUrls.length, 'images');
    console.log('   - Verification ID:', verificationId);

    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🎨 New Verification Request - ${customerEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✨ New Verification Request</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #667eea; margin-top: 0;">Customer Details</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${customerName || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Verification ID:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 12px;">${verificationId}</td>
                </tr>
              </table>

              <h2 style="color: #667eea;">AI Analysis Results</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Body Shape:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${bodyShape}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Color Palette:</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${colorPalette}</td>
                </tr>
              </table>

              <h2 style="color: #667eea;">Customer Photos for Review</h2>
              <p style="color: #6b7280; margin-bottom: 20px; background-color: #fef3c7; padding: 12px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>⚠️ Important:</strong> Please review these photos carefully before completing the verification.
              </p>
              
              ${imageUrls.map((url, index) => `
                <div style="margin-bottom: 25px; background-color: #f9fafb; padding: 15px; border-radius: 12px; border: 2px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151;">📸 Photo ${index + 1}:</p>
                  <a href="${url}" target="_blank" style="color: #667eea; text-decoration: none; font-size: 13px; word-break: break-all; display: block; margin-bottom: 10px;">
                    🔗 Open Full Size Image →
                  </a>
                  <img src="${url}" alt="Customer Analysis Photo ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); display: block;" />
                </div>
              `).join('')}

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin-top: 30px;">
                <h3 style="margin-top: 0; color: #374151;">📋 Next Steps</h3>
                <ol style="color: #6b7280; padding-left: 20px; line-height: 1.8;">
                  <li>Review the AI analysis results above: <strong>${bodyShape}</strong> body shape and <strong>${colorPalette}</strong> color palette</li>
                  <li>Carefully examine all customer photos</li>
                  <li>Log in to the admin dashboard</li>
                  <li>Navigate to Stylist Verifications</li>
                  <li>Complete the verification for <strong>${customerEmail}</strong></li>
                </ol>
                <a href="https://www.mystyledwardrobe.com/admin/verifications" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Go to Verification Dashboard →</a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
              <p>MyStyled Wardrobe Admin Notification</p>
              <p style="font-size: 12px; margin-top: 10px;">If images don't load, <a href="https://www.mystyledwardrobe.com/admin/verifications" style="color: #667eea;">view them in the dashboard</a></p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Verification request email sent to admin. Email ID:', emailResult.data?.id);
    return { success: true, emailId: emailResult.data?.id };
  } catch (error) {
    console.error('❌ Failed to send verification request email to admin:');
    console.error('   Error details:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
    }
    return { success: false, error };
  }
}

/**
 * Send purchase confirmation to customer
 */
export async function sendVerificationConfirmationToCustomer({
  customerEmail,
  customerName,
  bodyShape,
  colorPalette,
}: {
  customerEmail: string;
  customerName?: string;
  bodyShape: string;
  colorPalette: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: '✅ Verification Request Received - MyStyled Wardrobe',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">✅ Payment Successful!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #10b981; margin-top: 0;">Thank You, ${customerName || 'Valued Customer'}!</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.8;">
                We've received your payment for professional stylist verification. A qualified stylist will now review your AI analysis results.
              </p>

              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #065f46;">Your AI Analysis Results</h3>
                <p style="margin: 5px 0; color: #047857;"><strong>Body Shape:</strong> ${bodyShape}</p>
                <p style="margin: 5px 0; color: #047857;"><strong>Color Palette:</strong> ${colorPalette}</p>
              </div>

              <h3 style="color: #374151;">What Happens Next?</h3>
              <ol style="color: #6b7280; padding-left: 20px; line-height: 1.8;">
                <li><strong>Professional Review:</strong> A qualified stylist will carefully review your AI analysis and photos</li>
                <li><strong>Email Notification:</strong> You'll receive an email when your verification is complete (usually within 24-48 hours)</li>
                <li><strong>Verified Results:</strong> Your verified body shape, color palette, and personalized styling recommendations will appear in your account</li>
              </ol>

              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin-top: 30px; text-align: center;">
                <p style="color: #374151; margin: 0 0 15px 0; font-size: 15px;">
                  <strong>⏰ Expected Timeline:</strong> Most verifications are completed within 24-48 hours
                </p>
                <a href="https://www.mystyledwardrobe.com/style-interface" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Your Style Interface →</a>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 14px; margin: 5px 0;">
                  <strong>Order Details:</strong>
                </p>
                <p style="color: #9ca3af; font-size: 14px; margin: 5px 0;">
                  Service: Professional Stylist Verification<br>
                  Amount: £30.00<br>
                  Email: ${customerEmail}
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
              <p>Questions? Reply to this email or visit our <a href="https://www.mystyledwardrobe.com/faq" style="color: #667eea; text-decoration: none;">FAQ page</a></p>
              <p style="margin-top: 10px;">MyStyled Wardrobe</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Confirmation email sent to customer');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send confirmation email to customer:', error);
    return { success: false, error };
  }
}

/**
 * Send new signup alert to admin
 */
export async function sendNewSignupAlert({
  userEmail,
  userName,
  signupDate,
}: {
  userEmail: string;
  userName?: string;
  signupDate: Date;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🎉 New User Signup - ${userEmail}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎉 New User Signup!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #6b7280; font-size: 16px; line-height: 1.8; margin-top: 0;">
                A new user has just created an account on MyStyled Wardrobe!
              </p>

              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #1e40af;">User Details</h3>
                <p style="margin: 5px 0; color: #1e3a8a;"><strong>Name:</strong> ${userName || 'Not provided'}</p>
                <p style="margin: 5px 0; color: #1e3a8a;"><strong>Email:</strong> ${userEmail}</p>
                <p style="margin: 5px 0; color: #1e3a8a;"><strong>Signup Date:</strong> ${signupDate.toLocaleString('en-GB', { 
                  dateStyle: 'full', 
                  timeStyle: 'short',
                  timeZone: 'Europe/London'
                })}</p>
              </div>

              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin-top: 30px; text-align: center;">
                <p style="color: #374151; margin: 0 0 15px 0;">View this user in your admin dashboard</p>
                <a href="https://www.mystyledwardrobe.com/admin" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Go to Admin Dashboard →</a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
              <p>MyStyled Wardrobe Admin Notification</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ New signup alert sent to admin');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send signup alert to admin:', error);
    return { success: false, error };
  }
}

/**
 * Send verification completion notification to customer
 */
export async function sendVerificationCompleteToCustomer({
  customerEmail,
  customerName,
  verifiedBodyShape,
  verifiedColorPalette,
  stylistNotes,
}: {
  customerEmail: string;
  customerName?: string;
  verifiedBodyShape: string;
  verifiedColorPalette: string;
  stylistNotes?: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: '🎨 Your Verification is Complete! - MyStyled Wardrobe',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🎨 Verification Complete!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #8b5cf6; margin-top: 0;">Great News, ${customerName || 'Valued Customer'}!</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.8;">
                A professional stylist has completed your verification. Your personalized style profile is now ready!
              </p>

              <div style="background-color: #faf5ff; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #6b21a8;">Your Verified Results</h3>
                <p style="margin: 5px 0; color: #7e22ce;"><strong>Body Shape:</strong> ${verifiedBodyShape}</p>
                <p style="margin: 5px 0; color: #7e22ce;"><strong>Color Palette:</strong> ${verifiedColorPalette}</p>
              </div>

              ${stylistNotes ? `
              <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #065f46;">Stylist Notes</h3>
                <p style="margin: 0; color: #047857; line-height: 1.8;">${stylistNotes}</p>
              </div>
              ` : ''}

              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin-top: 30px; text-align: center;">
                <h3 style="color: #374151; margin-top: 0;">Ready to Start Styling?</h3>
                <p style="color: #6b7280; margin-bottom: 15px;">View your verified results and get personalized recommendations</p>
                <a href="https://www.mystyledwardrobe.com/style-interface" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">View Your Style Profile →</a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
              <p>Questions? Reply to this email or visit our <a href="https://www.mystyledwardrobe.com/faq" style="color: #667eea; text-decoration: none;">FAQ page</a></p>
              <p style="margin-top: 10px;">MyStyled Wardrobe</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Verification complete email sent to customer');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send verification complete email to customer:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail({
  customerEmail,
  customerName,
}: {
  customerEmail: string;
  customerName?: string;
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: '👋 Welcome to MyStyled Wardrobe!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">👋 Welcome!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #667eea; margin-top: 0;">Hi ${customerName || 'there'}! 🎉</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.8;">
                Thank you for joining <strong>MyStyled Wardrobe</strong>! We're thrilled to help you discover your perfect style and make the most of your wardrobe.
              </p>

              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin-top: 0; color: #78350f; font-size: 18px;">✨ What You Can Do Now</h3>
                <ul style="color: #92400e; padding-left: 20px; margin: 10px 0; line-height: 2;">
                  <li><strong>AI Style Analysis:</strong> Upload your photos and discover your body shape and color palette</li>
                  <li><strong>Wardrobe Upload:</strong> Add your existing clothes and get outfit recommendations</li>
                  <li><strong>Professional Verification:</strong> Get your AI results verified by a qualified stylist (£30)</li>
                  <li><strong>Personalized Styling:</strong> Receive recommendations tailored to your unique style</li>
                </ul>
              </div>

              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #1e40af;">🎁 Your Free Trial</h3>
                <p style="margin: 5px 0; color: #1e3a8a; line-height: 1.8;">
                  <strong>1 FREE AI Analysis</strong> - Discover your body shape and color palette<br>
                  <strong>Upload up to 6 items</strong> - Build your digital wardrobe<br>
                  <strong>10 outfit generations</strong> - Get styling ideas from your clothes
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.mystyledwardrobe.com/style-interface" style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);">Start Your Style Journey →</a>
              </div>

              <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin-top: 30px;">
                <h3 style="color: #374151; margin-top: 0; font-size: 16px;">💡 Quick Start Tips</h3>
                <ol style="color: #6b7280; padding-left: 20px; margin: 10px 0; line-height: 1.8;">
                  <li>Head to the <strong>Style Interface</strong> to run your AI analysis</li>
                  <li>Upload clear, well-lit photos for the best results</li>
                  <li>Explore your wardrobe and generate outfit ideas</li>
                  <li>Consider professional verification for expert confirmation</li>
                </ol>
              </div>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.8; margin: 5px 0;">
                  <strong>Need help?</strong> We're here for you!<br>
                  Reply to this email or check out our <a href="https://www.mystyledwardrobe.com/faq" style="color: #667eea; text-decoration: none;">FAQ page</a>
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
              <p style="margin: 5px 0;">Happy styling! ✨</p>
              <p style="margin: 5px 0;">The MyStyled Wardrobe Team</p>
              <p style="margin: 15px 0 5px 0; font-size: 12px;">
                <a href="https://www.mystyledwardrobe.com" style="color: #9ca3af; text-decoration: none;">mystyledwardrobe.com</a>
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Welcome email sent to customer');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send welcome email to customer:', error);
    return { success: false, error };
  }
}
