'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Image from 'next/image';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  views: number;
  author: {
    name: string | null;
    email: string;
  };
  comments: Comment[];
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [slug]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/simple-auth/session');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        checkAdminStatus(data.user.id);
        fetchPost();
      } else {
        // Not logged in - redirect to sign in
        router.push(`/auth/signin?redirect=/blog/${slug}`);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push(`/auth/signin?redirect=/blog/${slug}`);
    } finally {
      setCheckingAuth(false);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/check?userId=${userId}`);
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/simple-auth/session');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}`);
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: commentText
        })
      });

      if (response.ok) {
        setCommentText('');
        fetchPost(); // Refresh to show new comment
      } else {
        alert('Failed to post comment. Please try again.');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${post.id}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Post deleted successfully');
        router.push('/blog');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An error occurred while deleting the post');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Comment deleted successfully');
        fetchPost(); // Refresh to update comments
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An error occurred while deleting the comment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, rgba(90,76,219,0.18) 0%, rgba(10,14,34,0.9) 35%, rgba(4,7,20,1) 90%)',
          color: 'white'
        }}
      >
        <Header />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'rgba(226,232,255,0.7)' }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not logged in, don't render content (redirect will happen)
  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, rgba(90,76,219,0.18) 0%, rgba(10,14,34,0.9) 35%, rgba(4,7,20,1) 90%)',
          color: 'white'
        }}
      >
        <Header />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1.1rem', color: 'rgba(226,232,255,0.7)' }}>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top, rgba(90,76,219,0.18) 0%, rgba(10,14,34,0.9) 35%, rgba(4,7,20,1) 90%)',
          color: 'white'
        }}
      >
        <Header />
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>Post not found</h1>
          <Link href="/blog" style={{ color: 'rgba(129,140,248,0.95)', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(90,76,219,0.18) 0%, rgba(10,14,34,0.9) 35%, rgba(4,7,20,1) 90%)',
        color: 'white'
      }}
    >
      <Header />
      
      {/* Article Header */}
      <div className="blog-content-wrapper">
        <article className="blog-article">
          <Link
            href="/blog"
            className="blog-back-link"
          >
            ← Back to Blog
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
            <h1 className="blog-title" style={{ margin: 0, flex: 1 }}>
              {post.title}
            </h1>
            {isAdmin && (
              <button
                onClick={handleDeletePost}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
              >
                🗑️ Delete Post
              </button>
            )}
          </div>

          <div className="blog-meta">
            <span style={{ fontWeight: '600' }}>
              {post.author.name || post.author.email}
            </span>
            <span>•</span>
            <span>{post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}</span>
            <span>•</span>
            <span>{post.views} views</span>
          </div>

          {post.coverImage && (
            <div className="blog-cover-image">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        
        <style jsx>{`
          div :global(h1) {
            font-size: 2rem;
            font-weight: 700;
            margin: 1.5rem 0 1rem;
            color: #e0e7ff;
          }
          div :global(h2) {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 1.25rem 0 0.875rem;
            color: #c7d2fe;
          }
          div :global(h3) {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 1rem 0 0.75rem;
            color: #c7d2fe;
          }
          div :global(p) {
            margin: 0.75rem 0;
          }
          div :global(img) {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            margin: 1.5rem 0;
            box-shadow: 0 30px 45px rgba(15,23,42,0.45);
          }
          div :global(blockquote) {
            border-left: 4px solid rgba(129,140,248,0.65);
            padding-left: 1.5rem;
            margin: 1.5rem 0;
            font-style: italic;
            color: rgba(201,213,255,0.75);
          }
          div :global(pre) {
            background: rgba(15,23,42,0.7);
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            color: #e0f2fe;
          }
          div :global(ul), div :global(ol) {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          div :global(li) {
            margin: 0.5rem 0;
          }
          div :global(a) {
            color: #a5b4fc;
            text-decoration: underline;
          }
          div :global(strong) {
            font-weight: 700;
          }
          div :global(em) {
            font-style: italic;
          }
        `}</style>

        {/* Comments Section */}
        <div style={{
          borderTop: '2px solid #e2e8f0',
          paddingTop: '3rem',
          marginBottom: '4rem'
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: '#1e293b'
          }}>
            Comments ({post.comments.length})
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: '3rem' }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  marginBottom: '1rem',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                style={{
                  padding: '0.75rem 2rem',
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div style={{
              padding: '2rem',
              background: '#f1f5f9',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Sign in to join the conversation
              </p>
              <Link
                href="/auth/signin"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {post.comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>
                      {comment.user.name || comment.user.email}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', marginLeft: '0.75rem' }}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        padding: '0.375rem 0.75rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <p style={{
                  color: '#475569',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>
        </article>
      </div>
    </div>
  );
}

