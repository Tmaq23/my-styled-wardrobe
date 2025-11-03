'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  views: number;
  author: {
    name: string | null;
    email: string;
  };
  _count: {
    comments: number;
  };
}

export default function BlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/simple-auth/session');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        fetchPosts();
      } else {
        // Not logged in - redirect to sign in
        router.push('/auth/signin?redirect=/blog');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/auth/signin?redirect=/blog');
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Draft';
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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(90,76,219,0.18) 0%, rgba(10,14,34,0.9) 35%, rgba(4,7,20,1) 90%)',
        color: 'white'
      }}
    >
      <Header />
      
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(140deg, rgba(102,126,234,0.35) 0%, rgba(124,58,237,0.28) 45%, rgba(9,14,36,0.95) 100%)',
        padding: '6rem 2rem 4rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: '1.2',
            color: 'white'
          }}>
            Style Stories & Tips
          </h1>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.85,
            lineHeight: '1.6',
            color: 'rgba(241,245,255,0.85)'
          }}>
            Fashion insights, styling tips, and personal stories from our team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 2rem 5rem'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ fontSize: '1.1rem', color: 'rgba(226,232,255,0.7)' }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            border: '1px solid rgba(148,163,255,0.12)',
            boxShadow: '0 25px 45px rgba(2,6,23,0.45)'
          }}>
            <p style={{ fontSize: '1.2rem', color: 'rgba(226,232,255,0.85)', marginBottom: '1rem' }}>
              📝 No posts yet
            </p>
            <p style={{ fontSize: '0.95rem', color: 'rgba(148,163,255,0.75)' }}>
              Check back soon for styling tips and fashion insights!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {posts.map((post) => (
              <article
                key={post.id}
                style={{
                  background: 'rgba(13,18,44,0.85)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(124,58,237,0.18)',
                  boxShadow: '0 25px 45px rgba(2,6,23,0.55)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 35px 55px rgba(91,104,255,0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 25px 45px rgba(2,6,23,0.55)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  {post.coverImage && (
                    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  
                  <div style={{ padding: '2rem' }}>
                    <h2 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      marginBottom: '1rem',
                      color: 'white',
                      lineHeight: '1.3'
                    }}>
                      {post.title}
                    </h2>
                    
                    {post.excerpt && (
                      <p style={{
                        fontSize: '1.1rem',
                        color: 'rgba(226,232,255,0.8)',
                        lineHeight: '1.7',
                        marginBottom: '1.5rem'
                      }}>
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      fontSize: '0.9rem',
                      color: 'rgba(148,163,255,0.75)'
                    }}>
                      <span style={{ fontWeight: '500' }}>
                        {post.author.name || post.author.email}
                      </span>
                      <span>•</span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>•</span>
                      <span>{post.views} views</span>
                      <span>•</span>
                      <span>{post._count.comments} comments</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(148,163,255,0.12)',
        padding: '3rem 2rem 4rem',
        marginTop: '4rem'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(226,232,255,0.75)',
            marginBottom: '1.5rem'
          }}>
            Want to contribute to our blog?
          </p>
          <Link
            href="/admin"
            style={{
              display: 'inline-block',
              padding: '0.875rem 2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}

