'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import RichTextEditor from '@/components/RichTextEditor';

export default function CreateBlogPost() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setFormData({ ...formData, coverImage: data.url });
      } else {
        setError(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const { post } = await response.json();
        router.push(`/blog/${post.slug}`);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-page compact-home" style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '8rem 4rem 3rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link
            href="/admin"
            style={{
              display: 'inline-block',
              color: '#a78bfa',
              textDecoration: 'none',
              fontWeight: '600',
              marginBottom: '1rem',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#c4b5fd'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a78bfa'}
          >
            ← Back to Admin
          </Link>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            Create New Blog Post
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem' }}>
            Share your fashion insights and styling tips
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            color: '#fca5a5',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Title */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem',
              fontSize: '1.05rem'
            }}>
              Post Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter an engaging title..."
              required
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '1.2rem',
                fontWeight: '600',
                color: 'white'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          {/* Excerpt */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem',
              fontSize: '1.05rem'
            }}>
              Excerpt (Summary)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="A brief summary that appears in the blog listing..."
              rows={4}
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '1.05rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                color: 'white',
                lineHeight: '1.6'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
          </div>

          {/* Cover Image */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem',
              fontSize: '1.05rem'
            }}>
              Cover Image
            </label>
            
            {/* Upload Button */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                opacity: uploading ? 0.6 : 1,
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1)')}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'rgba(255,255,255,0.5)',
                fontSize: '0.9rem'
              }}>
                or enter URL below
              </span>
            </div>
            
            {/* URL Input */}
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                fontSize: '1.05rem',
                color: 'white'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#a78bfa'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
            />
            
            {/* Image Preview */}
            {formData.coverImage && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={formData.coverImage} 
                  alt="Cover preview" 
                  style={{
                    maxWidth: '300px',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem' }}>
              Optional: Upload an image or enter a URL for the cover image
            </p>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.75rem',
              fontSize: '1.05rem'
            }}>
              Content *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write your blog post content here... Use the toolbar above to format text, add images, and create layouts."
            />
          </div>

          {/* Publish Checkbox */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                style={{
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontWeight: '600', color: 'white', fontSize: '1.05rem' }}>
                Publish immediately
              </span>
            </label>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.75rem', marginLeft: '2.5rem' }}>
              Uncheck to save as draft
            </p>
          </div>

          {/* Submit Buttons */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 1,
                padding: '1rem 2rem',
                background: submitting
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {submitting ? 'Creating...' : (formData.published ? 'Publish Post' : 'Save as Draft')}
            </button>
            <Link
              href="/admin"
              style={{
                padding: '1rem 2rem',
                background: 'rgba(239, 68, 68, 0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

