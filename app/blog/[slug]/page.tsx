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
    id: string;
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
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  useEffect(() => {
    checkAuth();
  }, [slug]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/simple-auth/session', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.user) {
        // Check if user is a subscriber (ONLY subscribers have blog access per requirements)
        const isSubscriber = data.user.subscription?.tier === 'premium' && 
                           data.user.subscription?.stripeSubscriptionId;
        
        if (isSubscriber || data.user.isAdmin) {
          // Allow access for subscribers or admins
          setUser(data.user);
          checkAdminStatus(data.user.id);
          fetchPost();
        } else {
          // Not a subscriber - redirect to pricing
          router.push('/pricing?message=subscribe');
        }
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
    console.log('Comment submit triggered', { commentText, postId: post?.id });
    
    if (!commentText.trim() || !post) {
      console.log('Submit blocked - empty text or no post');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Sending comment to API...');
      const response = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: post.id,
          content: commentText
        })
      });

      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Comment posted successfully:', data);
        setCommentText('');
        fetchPost(); // Refresh to show new comment
      } else {
        const error = await response.json();
        console.error('Failed to post comment:', error);
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
      const response = await fetch(`/api/blog/posts/delete?id=${post.id}`, {
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

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editingCommentText.trim()) return;

    try {
      const response = await fetch('/api/blog/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commentId,
          content: editingCommentText
        })
      });

      if (response.ok) {
        setEditingCommentId(null);
        setEditingCommentText('');
        fetchPost(); // Refresh to show updated comment
      } else {
        alert('Failed to update comment. Please try again.');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/comments?id=${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchPost(); // Refresh to remove deleted comment
      } else {
        alert('Failed to delete comment. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('An error occurred. Please try again.');
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
        </article>
      </div>
      {/* ^^^ CLOSED blog-content-wrapper HERE ^^^ */}

      {/* Comments Section - COMPLETELY OUTSIDE blog-content-wrapper AND blog-article */}
      <div style={{
        width: '100%',
        background: '#ffffff',
        padding: '3rem 0 4rem'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            borderTop: '2px solid #e2e8f0',
            paddingTop: '3rem',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              marginBottom: '2rem',
              color: '#1e293b'
            }}>
              💬 Comments ({post.comments.length})
            </h2>

          {/* Comment Form */}
          {user ? (
            <div style={{
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '1rem'
              }}>
                💭 Leave a Comment
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '1rem'
              }}>
                Signed in as <strong>{user.name || user.email}</strong>
              </p>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Type your comment here..."
                  rows={5}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '3px solid #667eea',
                    background: '#ffffff',
                    color: '#000000',
                    borderRadius: '12px',
                    fontSize: '1.125rem',
                    resize: 'vertical',
                    marginBottom: '1rem',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    minHeight: '120px',
                    display: 'block',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#764ba2';
                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102,126,234,0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setCommentText('')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'transparent',
                      color: '#64748b',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    style={{
                      padding: '0.75rem 2rem',
                      background: submitting || !commentText.trim() ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: submitting || !commentText.trim() ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.2s',
                      boxShadow: submitting || !commentText.trim() ? 'none' : '0 4px 12px rgba(102,126,234,0.3)'
                    }}
                    onMouseEnter={(e) => !submitting && commentText.trim() && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => !submitting && (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {submitting ? '📤 Posting...' : '📤 Post Comment'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
              border: '2px solid #c7d2fe',
              borderRadius: '16px',
              padding: '3rem 2rem',
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{
                color: '#1e293b',
                marginBottom: '0.75rem',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                Join the Conversation
              </h3>
              <p style={{
                color: '#64748b',
                marginBottom: '1.5rem',
                fontSize: '1rem'
              }}>
                Sign in to share your thoughts and engage with other readers
              </p>
              <Link
                href="/auth/signin"
                style={{
                  display: 'inline-block',
                  padding: '0.875rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                🔐 Sign In to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          {post.comments.length > 0 && (
            <>
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '2rem',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: '1.5rem'
                }}>
                  💭 All Comments ({post.comments.length})
                </h3>
              </div>
            </>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {post.comments.length === 0 && (
              <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '2px dashed #e2e8f0'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</div>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>No comments yet</p>
                <p>Be the first to share your thoughts!</p>
              </div>
            )}
            {post.comments.map((comment) => {
              const isAuthor = user && comment.user.id === user.id;
              const canEdit = isAuthor;
              const canDelete = isAdmin; // ONLY admins can delete comments
              const isEditing = editingCommentId === comment.id;

              return (
                <div
                  key={comment.id}
                  style={{
                    padding: '1.5rem',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {!isEditing && canEdit && (
                        <button
                          onClick={() => handleEditComment(comment)}
                          style={{
                            padding: '0.375rem 0.75rem',
                            background: 'transparent',
                            color: '#667eea',
                            border: '1px solid #667eea',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#667eea';
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#667eea';
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
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
                  </div>
                  
                  {isEditing ? (
                    <div>
                      <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          fontSize: '0.95rem',
                          resize: 'vertical',
                          marginBottom: '0.75rem',
                          fontFamily: 'inherit',
                          color: '#1e293b',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#e2e8f0',
                            color: '#475569',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p style={{
                      color: '#475569',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {comment.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {/* Closed comments list */}
          </div>
          {/* Closed border-top container */}
        </div>
        {/* Closed max-width container */}
      </div>
      {/* Closed full-width comments container */}
    </div>
  );
}
