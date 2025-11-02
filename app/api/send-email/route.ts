import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    const { type, userId, userEmail, userProfile, customData } = await request.json();
    
    if (!userEmail || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    let templateKey: string;
    let variables: Record<string, string>;
    
    switch (type) {
      case 'weekly_nudge':
        templateKey = 'weekly_outfit_nudge';
        variables = {
          user_name: userProfile?.name || 'Fashionista',
          palette: userProfile?.palette || 'Winter',
          outfit_name: customData?.outfitName || 'Seasonal Favorites',
          outfit_description: customData?.outfitDescription || 'Curated just for you',
          outfit_image: customData?.outfitImage || 'https://picsum.photos/300/400?random=outfit',
          featured_item: customData?.featuredItem || 'favorite piece',
          styling_tip_1: customData?.tips?.[0] || 'Mix textures for visual interest',
          styling_tip_2: customData?.tips?.[1] || 'Add a belt to define your waist',
          styling_tip_3: customData?.tips?.[2] || 'Layer with complementary colors',
          app_url: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'
        };
        break;
        
      case 'wardrobe_insights':
        templateKey = 'wardrobe_insights';
        variables = {
          user_name: userProfile?.name || 'Fashionista',
          wear_percentage: customData?.wearPercentage || '75',
          top_item: customData?.topItem || 'black blazer',
          wear_count: customData?.wearCount || '8',
          cost_per_wear: customData?.costPerWear || '3.50',
          personalized_tip: customData?.tip || 'Try mixing patterns for a bold new look!'
        };
        break;
        
      case 'shopping_match':
        templateKey = 'shopping_match';
        variables = {
          item_type: customData?.itemType || 'top',
          item_name: customData?.itemName || 'Stylish piece',
          item_description: customData?.itemDescription || 'Perfect addition to your wardrobe',
          item_image: customData?.itemImage || 'https://picsum.photos/200/250?random=item',
          item_price: customData?.itemPrice || '45.00',
          retailer: customData?.retailer || 'ASOS',
          affiliate_url: customData?.affiliateUrl || '#',
          styling_reason: customData?.stylingReason || 'This complements your existing pieces perfectly'
        };
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }
    
    const result = await sendEmail(userEmail, templateKey, variables);
    
    // TODO: Log email send for analytics
    console.log(`Email sent to ${userEmail}: ${type}`);
    
    return NextResponse.json({ 
      success: true, 
      emailId: result.id,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
