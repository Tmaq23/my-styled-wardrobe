# Blog System Documentation

## Overview
The blog system is a Substack-style blogging platform integrated into My Styled Wardrobe. It allows admins to create and publish blog posts, and users to read and comment on them.

## Features

### For Admins
- **Create Blog Posts**: Rich text blog post creation with title, excerpt, content, and cover image
- **Publish or Draft**: Posts can be published immediately or saved as drafts
- **Post Management**: Update or delete existing posts
- **Comment Moderation**: Delete any user comment

### For Users
- **Read Posts**: Browse all published blog posts in a beautiful Substack-style layout
- **Comment**: Authenticated users can comment on blog posts
- **View Stats**: See view counts and comment counts for each post

## Pages & Routes

### Public Pages
- **/blog**: Blog listing page showing all published posts
- **/blog/[slug]**: Individual blog post page with comments

### Admin Pages
- **/admin/blog/create**: Create new blog post (admin only)

## API Endpoints

### Blog Posts
- `GET /api/blog/posts`: Get all published posts (or all if admin)
- `POST /api/blog/posts`: Create a new blog post (admin only)
- `GET /api/blog/posts/[slug]`: Get a single post by slug
- `PUT /api/blog/posts/[slug]`: Update a post (admin only)
- `DELETE /api/blog/posts/[slug]`: Delete a post (admin only)

### Comments
- `POST /api/blog/comments`: Create a new comment (authenticated users)
- `DELETE /api/blog/comments?id={commentId}`: Delete a comment (author or admin)

## Database Schema

### BlogPost
- `id`: Unique identifier (cuid)
- `title`: Post title
- `slug`: URL-friendly slug (auto-generated from title)
- `content`: Full post content
- `excerpt`: Short summary (optional)
- `coverImage`: Cover image URL (optional)
- `authorId`: Reference to User
- `published`: Boolean flag
- `publishedAt`: Publication timestamp
- `views`: View count
- `createdAt`, `updatedAt`: Timestamps

### BlogComment
- `id`: Unique identifier (cuid)
- `postId`: Reference to BlogPost
- `userId`: Reference to User
- `content`: Comment text
- `createdAt`, `updatedAt`: Timestamps

## How to Use

### Creating a Blog Post (Admin)
1. Log in to the admin dashboard at `/admin`
2. Click the "✍️ Create Blog Post" button
3. Fill in the post details:
   - **Title**: Required - The main heading of your post
   - **Excerpt**: Optional - A summary for the blog listing
   - **Cover Image**: Optional - URL to a cover image
   - **Content**: Required - The full blog post content with rich text formatting
4. Check "Publish immediately" or leave unchecked to save as draft
5. Click "Publish Post" or "Save as Draft"

### Rich Text Editor Features
The content editor includes a powerful toolbar with:

**Text Formatting:**
- **Bold**, *Italic*, Underline
- Headings (H1, H2, H3)
- Paragraphs

**Layout:**
- Bullet lists
- Numbered lists
- Left, Center, Right alignment

**Media & Links:**
- 🔗 Insert hyperlinks
- 🖼️ Insert images (via URL)

**Special Formatting:**
- Blockquotes for highlighting important text
- Code blocks for technical content

**How to Insert Images:**

*Method 1: Upload from Computer*
1. Click the "📤 Upload" button in the toolbar
2. Select an image from your computer
3. Wait for the upload to complete
4. The image will be automatically inserted

*Method 2: Insert from URL*
1. Click the "🖼️ URL" button in the toolbar
2. Enter the image URL when prompted
3. The image will be inserted at your cursor position

**Cover Image Upload:**
- Click "📤 Upload Image" button to select from your computer
- Or enter a URL in the text field below
- Preview appears immediately after upload
- Images are stored in `/public/uploads/blog/`

**Image Storage:**
- All uploaded images are stored on your server
- Location: `public/uploads/blog/`
- Max file size: 5MB
- Supported formats: JPEG, PNG, GIF, WebP
- Filenames are automatically timestamped to prevent conflicts

### Reading Posts (Users)
1. Navigate to `/blog` from the main navigation bar
2. Browse all published posts
3. Click on any post to read the full content
4. Sign in to leave comments

### Commenting (Users)
1. Navigate to a blog post
2. Scroll to the comments section
3. Sign in if not already authenticated
4. Type your comment and click "Post Comment"

## Design Features

### Substack-Inspired Design
- **Clean Typography**: Large, readable fonts with generous line height
- **Minimalist Layout**: Focus on content with minimal distractions
- **Card-Based Design**: Posts displayed in elegant cards with hover effects
- **Responsive**: Optimized for all screen sizes
- **Cover Images**: Optional hero images for visual appeal
- **Author Attribution**: Display author name and publication date
- **Engagement Metrics**: View counts and comment counts

### Color Scheme
- **Primary Gradient**: Purple gradient (#667eea → #764ba2)
- **Background**: Light gray (#f8f9fa) for comfortable reading
- **Text Colors**: Dark slate for content, gray for metadata
- **Accent Colors**: Green gradient for action buttons

## Security

### Authentication
- Only authenticated users can comment
- Only admins can create, update, or delete posts
- Admin status checked via database `isAdmin` field

### Authorization
- Comment deletion allowed for comment author or admin
- Post management restricted to admin users only
- Session-based authentication using cookies

## Future Enhancements (Optional)
- Rich text editor (WYSIWYG) for better content formatting
- Image upload functionality instead of URLs
- Categories and tags for posts
- Search functionality
- Post analytics (detailed view tracking)
- Email notifications for new comments
- Social sharing buttons
- Related posts suggestions
- RSS feed for blog posts

## Navigation
The blog is accessible from the main navigation bar:
- Header → **Blog** link

## Admin Access
To manage blog posts, admins should:
1. Log in to `/admin` with admin credentials
2. Click "✍️ Create Blog Post" to write a new post
3. Visit `/blog` to see published posts
4. Edit or delete posts as needed (future feature)

---

**Last Updated**: November 1, 2025

