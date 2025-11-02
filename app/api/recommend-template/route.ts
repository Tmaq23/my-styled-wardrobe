import { NextRequest, NextResponse } from 'next/server';
import templates from '@/data/outfit-templates.json';

// Body shape styling guidance
const BODY_SHAPE_TIPS: Record<string, string[]> = {
  'Hourglass': [
    'Have great waist definition. Perfectly in proportion and curves in the right place, giving the most feminine figure. Sizing on the top and bottom will be the same',
    'Look for items of clothing that emphasise your curves - high waisted skirts, wrap dresses, skinny jeans tucked into boots or worn with heels',
    'Maintain the balance of your body shape, for example think of your outfit as a whole, so if you are wearing a necklace avoid wearing full earrings to keep the focus on one area',
    'The best patterns for an hourglass to wear are florals, abstracts, spots and checks',
    'For trousers: Look for medium waisted with pockets and pleats, classic tailoring with a belt is ideal. Capri trousers also work well. Consider chinos as alternatives to jeans. Low waisted skinny jeans work well for a slender hourglass',
    'For skirts: Pencil skirts are perfect as they really emphasis your curves. A line and straight skirts can be dressed up or down. If you choose to wear a full circle skirt, then think about maintaining that balance and keeping the top simple',
    'For dresses: Look for V necklines or halter necks, they are good for showing off your torso and décolletage. Figure hugging dresses will define your waist. Try and avoid baggy dresses that are too boxy, however if you are going to wear one, experiment with belts worn around the waist to define your shape and go from shapeless to feminine'
  ],
  'Pear': [
    'Draw attention upward with detailed necklines and shoulder embellishments',
    'Balance your silhouette with A-line skirts and bootcut trousers',
    'Choose darker colours for bottoms and brighter tones for tops'
  ],
  'Apple': [
    'Create definition with V-necks and empire waistlines',
    'Choose flowing fabrics that skim rather than cling',
    'Draw the eye to your legs with well-fitted trousers and skirts'
  ],
  'Rectangle': [
    'Bust, waist and hips will be a similar size, they have straight shoulder line and little waist definition. Carry weight evenly around their body. Easiest body shape to work with as they try lots of different styles making dressing up exciting',
    'Choose the illusion of curves using different, cuts, colours, prints and fabrics',
    'Define the waist - use belts and high waisted clothing, tops that cinch in at the waist',
    'Maintain the balance - between the upper and lower body',
    'For trousers: Boot cut, wide legged and subtle flare trousers have a good cut that will provide curves on the bottom half of the body, they will also help hug the bottom. Look for pleated trousers and ones with pockets that are medium to low waisted. Belt loops will mean you\'ll be able to add to belt and help create a waist'
  ],
  'Triangle': [
    'Takes a smaller size on top, hips bottom and thighs are wider than shoulders. Curvaceous hips will be the key feature. Think about creating an hourglass shape when trying to create an hourglass shape',
    'Look for items of clothing that draw attention upwards - Widening neck lines, wrap tops V necks and ruffles',
    'Minimise the bottom half - wearing darker colours below, so the top becomes the focal point',
    'Layering - create layers on the top half of the body to attract attention upwards making the look more interesting than the bottom',
    'For trousers: Look for trousers that fit the hip and waist, wide banded trousers will work best as they offer support around the tummy. Flared or boot cut are great as they will help balance out the hips. Look for trousers that are medium and are long in length to help elongate the legs, pattern such as pinstripes can help with this also'
  ],
  'Inverted Triangle': [
    'Shoulders are wider than their hips, will wear a larger size on top half of the body, slender inverted triangles lack obvious curves. Fuller figures have more of a gracious curve. Slender figures will have fuller busts and shorter waist',
    'Look for drawing downwards - flared skirts, belts to draw attention to the hips, back pockets on trousers to add volume',
    'Minimise the top half - keep tops simple but use scoop and v necks to draw attention to the waist, or long necklaces',
    'Draw attention to waist, hips and bottom - wear patterns below to draw the eye down',
    'For trousers: Boot cut and wide legged work well on inverted triangles as they add curves to the bottom. Look for low to medium rise jeans that have back pockets or flaps, this helps to add volume to the bottom and create a great shape on the bottom half of the body. Use belts whenever possible to bring attention to the centre of the body'
  ],
  'Round': [
    'Round figures have an average to generous bust and rounded shoulders. They carry weight around their tummy and need to balance out their hips and shoulders. They have great curves but need to define the waist',
    'Aim to create a rectangle/hourglass shape - take the emphasis away from the shoulders and hips. Keep it simple',
    'Enhance and define the waist - use belts and high waisted clothing, tops that cinch in at the waist',
    'Elongate the figure - by adding height and wearing elongating patterns below to create height. Try and match the colour you ear on top to what you are wearing on the bottom',
    'For trousers: Medium rise trousers with wide waistbands will help to keep the help to create the desired body shape. Look for side fastening, to avoid bulkiness at the front of trousers and skirts. Materials that are cut loose and fall straight down will look flattering. Dark colours and pinstripe are great to elongate the legs. But try and avoid side pockets as they will widen the hips'
  ]
};

// Colour palette guidance
const COLOR_PALETTE_TIPS: Record<string, string[]> = {
  'Spring': [
    'Embrace warm, bright colours like coral, peach, and warm golden tones',
    'Choose ivory over stark white, and warm camel over grey',
    'Add energy with clear, vibrant hues'
  ],
  'Summer': [
    'Opt for cool, soft colours like rose pink, lavender, and soft blues',
    'Choose soft white over cream, and cool greys over warm browns',
    'Stick to muted, elegant tones that complement cool undertones'
  ],
  'Autumn': [
    'Select rich, warm colours like rust, olive, chocolate brown, and warm reds',
    'Choose cream over bright white, and warm earth tones',
    'Embrace golden, spicy colours that reflect autumn leaves'
  ],
  'Winter': [
    'Choose bold, clear colours like true red, royal blue, and pure white',
    'Embrace high contrast with black and white combinations',
    'Select jewel tones and icy pastels that complement cool undertones'
  ]
};

export async function POST(request: NextRequest) {
  try {
    console.log('📋 Generating template-based recommendations...');
    
    // Handle both FormData and JSON
    let occasion = 'Work';
    let palette = 'Winter';
    let shape = 'Rectangle';
    let budget = '££';
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      occasion = (formData.get('occasion') as string) || 'Work';
      palette = (formData.get('palette') as string) || 'Winter';
      shape = (formData.get('shape') as string) || 'Rectangle';
      budget = (formData.get('budget') as string) || '££';
    } else {
      const body = await request.json();
      occasion = body.occasion || 'Work';
      palette = body.palette || 'Winter';
      shape = body.shape || 'Rectangle';
      budget = body.budget || '££';
    }
    
    console.log('🔍 Parameters:', { occasion, palette, shape, budget });
    
    // Find templates that match the occasion
    const matchingTemplates = templates.templates.filter(template => 
      template.occasion.toLowerCase() === occasion.toLowerCase() ||
      occasion.toLowerCase() === 'any'
    );
    
    // If no specific match, provide all templates
    const selectedTemplates = matchingTemplates.length > 0 
      ? matchingTemplates 
      : templates.templates.slice(0, 3);
    
    // Get styling tips for the specific body shape and colour palette
    const bodyShapeTips = BODY_SHAPE_TIPS[shape] || BODY_SHAPE_TIPS['Rectangle'];
    const colourPaletteTips = COLOR_PALETTE_TIPS[palette] || COLOR_PALETTE_TIPS['Winter'];
    
    // Personalise templates with user's shape and palette
    const personalisedTemplates = selectedTemplates.map(template => ({
      ...template,
      personalisedStyling: {
        bodyShapeTips: bodyShapeTips,
        colourPaletteTips: colourPaletteTips,
        budgetNote: getBudgetNote(budget)
      }
    }));
    
    const response = NextResponse.json({
      success: true,
      templates: personalisedTemplates,
      isGeneric: true,
      personalisation: {
        bodyShape: shape,
        colourPalette: palette,
        occasion: occasion,
        budget: budget
      },
      stylingGuidance: {
        bodyShape: {
          type: shape,
          tips: bodyShapeTips
        },
        colourPalette: {
          season: palette,
          tips: colourPaletteTips
        }
      },
      customShopAvailable: true,
      message: 'These are generic outfit templates personalised to your style profile. For a fully customised online shopping experience with specific product recommendations, request a personalised shop below.'
    });
    
    return response;
    
  } catch (error) {
    console.error('❌ Template recommendation error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getBudgetNote(budget: string): string {
  switch (budget) {
    case '£':
      return 'Look for high-street options and sales at affordable retailers';
    case '££':
      return 'Mid-range retailers offer excellent quality and style';
    case '£££':
      return 'Invest in premium pieces that will last for years';
    default:
      return 'Choose pieces that fit your budget and lifestyle';
  }
}

