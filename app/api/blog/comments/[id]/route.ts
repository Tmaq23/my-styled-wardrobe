import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionContext } from '@/lib/apiAuth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const context = await getSessionContext(request);
    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminEmail = process.env['ADMIN_USERNAME']?.toLowerCase();
    const isAdminByEmail = adminEmail && context.user.email?.toLowerCase() === adminEmail;
    const isAdmin = context.user.isAdmin || isAdminByEmail;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if comment exists
    const comment = await prisma.blogComment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        post: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Delete the comment
    await prisma.blogComment.delete({
      where: { id },
    });

    console.log(`✅ Admin ${context.user.email} deleted comment by ${comment.user.email} on post "${comment.post.title}"`);

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
