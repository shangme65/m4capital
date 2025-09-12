import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid-token', request.url));
  }

  try {
    // For development without Prisma, we'll simulate verification
    // In production, this would verify the token in the database
    console.log('📧 Verifying email with token:', token);
    
    /*
    // Production implementation with Prisma:
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.redirect(new URL('/login?error=expired-token', request.url));
    }

    // Update user's emailVerified field
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the verification token
    await prisma.verificationToken.delete({
      where: { token },
    });
    */

    // For development, we'll just redirect to success
    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('❌ Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification-failed', request.url));
  }
}