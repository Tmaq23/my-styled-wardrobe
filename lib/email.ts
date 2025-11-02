// Email templates and retention logic
const RESEND_API_KEY = process.env['RESEND_API_KEY'];

export interface EmailTemplate {
  subject: string;
  html: string;
  trigger: 'weekly_nudge' | 'new_items_match' | 'outfit_reminder' | 'seasonal_update';
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  weekly_outfit_nudge: {
    subject: 'New outfit ideas for your {PALETTE} palette 💫',
    html: `
      <h2>Hi {USER_NAME}!</h2>
      <p>We've created some fresh outfit combinations just for you:</p>
      
      <div style="margin: 20px 0;">
        <h3>This Week's Spotlight: {OUTFIT_NAME}</h3>
        <p>{OUTFIT_DESCRIPTION}</p>
        <img src="{OUTFIT_IMAGE}" alt="{OUTFIT_NAME}" style="max-width: 300px;" />
      </div>
      
      <p><strong>3 ways to wear your {FEATURED_ITEM}:</strong></p>
      <ol>
        <li>{STYLING_TIP_1}</li>
        <li>{STYLING_TIP_2}</li>
        <li>{STYLING_TIP_3}</li>
      </ol>
      
      <a href="{APP_URL}/style-interface" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Get More Outfit Ideas
      </a>
    `,
    trigger: 'weekly_nudge'
  },
  
  wardrobe_insights: {
    subject: 'Your wardrobe stats are in! 📊',
    html: `
      <h2>Monthly Wardrobe Report</h2>
      <p>Hi {USER_NAME}, here's how you styled this month:</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your Style Stats</h3>
        <ul>
          <li>You've worn <strong>{WEAR_PERCENTAGE}%</strong> of your wardrobe this month</li>
          <li>Most loved item: <strong>{TOP_ITEM}</strong> (worn {WEAR_COUNT} times)</li>
          <li>Average cost per wear: <strong>£{COST_PER_WEAR}</strong></li>
        </ul>
      </div>
      
      <p><strong>Style tip:</strong> {PERSONALIZED_TIP}</p>
    `,
    trigger: 'weekly_nudge'
  },
  
  shopping_match: {
    subject: 'Perfect match found for your wardrobe! 🎯',
    html: `
      <h2>We found something perfect for you</h2>
      <p>This {ITEM_TYPE} would be amazing with items you already own:</p>
      
      <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <img src="{ITEM_IMAGE}" alt="{ITEM_NAME}" style="max-width: 200px;" />
        <h3>{ITEM_NAME}</h3>
        <p>{ITEM_DESCRIPTION}</p>
        <p><strong>£{ITEM_PRICE}</strong> at {RETAILER}</p>
        
        <a href="{AFFILIATE_URL}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Shop Now
        </a>
      </div>
      
      <p><strong>Why this works for you:</strong> {STYLING_REASON}</p>
    `,
    trigger: 'new_items_match'
  }
};

export async function sendEmail(to: string, templateKey: string, variables: Record<string, string>) {
  const template = EMAIL_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Email template ${templateKey} not found`);
  }
  
  let { subject, html } = template;
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key.toUpperCase()}}`;
    subject = subject.replace(new RegExp(placeholder, 'g'), value);
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'stylist@mystyledwardrobe.com',
        to: [to],
        subject,
        html
      })
    });
    
    if (!response.ok) {
      throw new Error(`Email API failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Email sent successfully: ${result.id}`);
    return result;
    
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function scheduleWeeklyNudges(userId: string, userEmail: string, userProfile: {
  name: string;
  bodyShape: string;
  palette: string;
}) {
  // This would typically be handled by a cron job or background worker
  // For now, we'll just expose the function for manual triggering
  
  const variables = {
    user_name: userProfile.name,
    palette: userProfile.palette,
    outfit_name: 'Casual Friday Chic',
    outfit_description: 'Perfect blend of professional and relaxed',
    outfit_image: 'https://picsum.photos/300/400?random=outfit',
    featured_item: 'blazer',
    styling_tip_1: 'Pair with jeans for a smart-casual look',
    styling_tip_2: 'Layer over a dress for extra sophistication', 
    styling_tip_3: 'Wear with trousers for a classic office outfit',
    app_url: 'https://mystyledwardrobe.com'
  };
  
  return await sendEmail(userEmail, 'weekly_outfit_nudge', variables);
}
