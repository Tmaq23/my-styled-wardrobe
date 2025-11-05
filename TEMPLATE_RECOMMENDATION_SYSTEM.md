# 📋 Template-Based Recommendation System

## Overview

The shopping recommendations have been completely redesigned to use **generic outfit templates** stored locally on the site, with an option for clients to request a **customised online shop** created by My Style Wardrobe employees.

---

## ✅ What's Changed

### 1. **Generic Template System**
- Outfit recommendations now use pre-defined templates stored in `/data/outfit-templates.json`
- Templates are personalised based on:
  - **Body Shape** (Hourglass, Pear, Apple, Rectangle, Inverted Triangle)
  - **Colour Palette** (Spring, Summer, Autumn, Winter)
  - **Occasion** (Work, Casual, Formal, Smart Casual, Date, Active)
  - **Budget** (£, ££, £££)

### 2. **Template Categories**
Six outfit templates are included:
1. **Professional Work Outfit** - Office and business meetings
2. **Casual Weekend Look** - Relaxed weekend activities
3. **Evening Formal Attire** - Special occasions
4. **Smart Casual Ensemble** - Various social settings
5. **Date Night Outfit** - Romantic evenings
6. **Active Lifestyle Look** - Exercise and active pursuits

### 3. **Customised Shop Request**
- Clients can request a personalised online shop
- Request includes their full styling profile
- My Style Wardrobe team curates specific product recommendations
- Customised shop emailed directly to client within 2-3 business days

---

## 📂 Files Created/Modified

### New Files:
1. **`/data/outfit-templates.json`** - Template data storage
2. **`/app/api/recommend-template/route.ts`** - Template recommendation API
3. **`/app/api/request-custom-shop/route.ts`** - Custom shop request API
4. **`/components/TemplateResults.tsx`** - Template results display component
5. **`/components/CustomShopRequestModal.tsx`** - Custom shop request modal

### Modified Files:
1. **`/app/style-interface/page.tsx`** - Uses new template system

---

## 🎨 Template Structure

Each template contains:

```json
{
  "id": "professional-work",
  "name": "Professional Work Outfit",
  "occasion": "Work",
  "description": "A sophisticated and polished look...",
  "items": [
    {
      "category": "Blazer",
      "description": "Tailored blazer in a neutral tone",
      "styling": "Choose a well-fitted blazer..."
    }
  ],
  "image": "/templates/professional-work.jpg"
}
```

---

## 💡 How It Works

### Client Journey:

1. **Complete Profile Analysis**
   - Upload photos for body shape and colour season analysis
   - Select occasion, budget, and preferences

2. **Receive Generic Templates**
   - System shows outfit templates matching their occasion
   - Templates personalised with body shape and colour palette tips
   - Each template shows specific styling guidance

3. **Review & Decide**
   - Client reviews generic templates
   - If satisfied, they can use the styling guidance for shopping
   - If they want specific products, they can request a custom shop

4. **Request Custom Shop** (Optional)
   - Click "Request Customised Online Shop"
   - Fill in contact details
   - Receive confirmation
   - Get personalised shop via email in 2-3 business days

---

## 🔧 API Endpoints

### `POST /api/recommend-template`
**Purpose:** Generate template-based recommendations

**Request (FormData):**
- `occasion`: Work, Casual, Formal, etc.
- `palette`: Spring, Summer, Autumn, Winter
- `shape`: Body shape type
- `budget`: £, ££, £££

**Response:**
```json
{
  "success": true,
  "templates": [...],
  "isGeneric": true,
  "stylingGuidance": {
    "bodyShape": { "type": "...", "tips": [...] },
    "colourPalette": { "season": "...", "tips": [...] }
  },
  "message": "...",
  "customShopAvailable": true
}
```

### `POST /api/request-custom-shop`
**Purpose:** Submit custom shop request

**Request (JSON):**
```json
{
  "userName": "Client Name",
  "userEmail": "client@email.com",
  "bodyShape": "Rectangle",
  "colourPalette": "Winter",
  "occasion": "Work",
  "budget": "££",
  "preferences": "Additional notes..."
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "CSR-...",
  "message": "Request received",
  "estimatedCompletionTime": "2-3 business days"
}
```

---

## 📧 Email Workflow

### When a Custom Shop is Requested:

1. **Immediate:**
   - Request logged in console
   - Client receives confirmation on screen
   - Request ID generated

2. **Within 24 Hours:**
   - My Style Wardrobe team receives notification
   - Team reviews client's styling profile

3. **Within 2-3 Business Days:**
   - Team curates personalised product selection
   - Creates clickable online shop page
   - Sends customised shop link to client's email

4. **Client Receives Email:**
   - Personalised greeting
   - Link to their custom online shop
   - Specific product recommendations with purchase links
   - Styling notes and outfit combinations

---

## 🎯 Benefits

### For Clients:
- ✅ Instant styling guidance with generic templates
- ✅ No waiting for basic recommendations
- ✅ Option to upgrade to personalised service
- ✅ Clear path to purchase customised recommendations

### For Business:
- ✅ Scalable: Generic templates serve unlimited users
- ✅ Premium service: Custom shops as paid/premium feature
- ✅ Manual control: Team curates quality recommendations
- ✅ Email marketing: Direct client communication channel
- ✅ Flexible: Easy to update templates locally

---

## 🔄 Future Enhancements

### Potential Additions:
1. **Template Images** - Add visual examples for each template
2. **More Templates** - Expand beyond 6 templates
3. **Seasonal Templates** - Add seasonal-specific recommendations
4. **Database Storage** - Store custom shop requests in database
5. **Admin Panel** - Interface for team to manage requests
6. **Automated Emails** - Send confirmation/update emails
7. **Payment Integration** - Charge for custom shop service
8. **Template Editor** - UI to create/edit templates without code

---

## 📝 Adding New Templates

To add a new template, edit `/data/outfit-templates.json`:

```json
{
  "templates": [
    {
      "id": "unique-id",
      "name": "Template Name",
      "occasion": "Occasion",
      "description": "Description...",
      "items": [
        {
          "category": "Item Category",
          "description": "Item description",
          "styling": "Styling advice"
        }
      ],
      "image": "/templates/image.jpg"
    }
  ]
}
```

---

## ✨ Summary

The new system provides:
- **Instant** generic styling guidance
- **Personalised** body shape and colour advice
- **Premium** custom shop request option
- **Scalable** template-based approach
- **Manual** quality control by your team

**Result:** Clients get immediate value while you maintain control over personalised recommendations!





