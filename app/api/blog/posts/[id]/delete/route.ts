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

    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete the post (comments will be cascade deleted due to schema)
    await prisma.blogPost.delete({
      where: { id },
    });

    console.log(`✅ Admin ${context.user.email} deleted blog post: ${post.title}`);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
