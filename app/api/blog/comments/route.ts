import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { getSessionContext, verifyAdminAccess } from '@/lib/apiAuth';

// POST create a new comment (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    const context = await getSessionContext(req);

    if (!context) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const body = await req.json();
    const { postId, content } = body;
    
    if (!postId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
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
    
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// DELETE a comment (author or admin only)
export async function DELETE(req: NextRequest) {
  try {
    const context = await getSessionContext(req);

    if (!context) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
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

    if (comment.userId !== context.user.id) {
      const adminAccess = await verifyAdminAccess(req);

      if (adminAccess.status !== 'ok') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
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

