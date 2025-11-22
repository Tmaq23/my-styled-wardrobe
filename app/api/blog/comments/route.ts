import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext, verifyAdminAccess } from '@/lib/apiAuth';

// POST create a new comment (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    console.log('[API] Comment POST request received');
    const context = await getSessionContext(req);
    console.log('[API] Session context:', context ? 'User found' : 'No user');

    if (!context) {
      console.log('[API] Not authenticated - returning 401');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    const { postId, content } = body;
    console.log('[API] Request body:', { postId, contentLength: content?.length });
    
    if (!postId || !content) {
      console.log('[API] Missing required fields - returning 400');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    console.log('[API] Creating comment in database...');
    const comment = await prisma.blogComment.create({
      data: {
        postId,
        userId: context.user.id,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('[API] Comment created successfully:', comment.id);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment', details: String(error) }, { status: 500 });
  }
}

// PATCH update a comment (author only)
export async function PATCH(req: NextRequest) {
  try {
    const context = await getSessionContext(req);

    if (!context) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { commentId, content } = body;
    
    if (!commentId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.userId !== context.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const updatedComment = await prisma.blogComment.update({
      where: { id: commentId },
      data: { content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

// DELETE a comment (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const context = await getSessionContext(req);

    if (!context) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify admin access - ONLY admins can delete comments
    const adminAccess = await verifyAdminAccess(req);
    if (adminAccess.status !== 'ok') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }
    
    const comment = await prisma.blogComment.findUnique({
      where: { id: commentId }
    });
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    
    await prisma.blogComment.delete({
      where: { id: commentId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

