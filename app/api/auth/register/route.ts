import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Input validation schema
const UserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Simple rate limiting
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;
const ipRequests = new Map<string, { count: number, resetTime: number }>();

export async function POST(request: Request) {
  try {
    // Implement rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    let ipData = ipRequests.get(ip);
    if (!ipData || now > ipData.resetTime) {
      ipData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    } else {
      ipData.count++;
      if (ipData.count > MAX_REQUESTS) {
        return NextResponse.json(
          { message: 'Too many requests, please try again later' },
          { status: 429, headers: { 'Retry-After': '900' } }
        );
      }
    }
    ipRequests.set(ip, ipData);
    
    // Parse and validate input
    const body = await request.json();
    const validation = UserSchema.safeParse(body);
    
    if (!validation.success) {
      const error = validation.error.errors[0];
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    
    // Check if user exists (optimized query)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true } // Only get what we need
    });
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password with appropriate cost factor
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Use transaction for data integrity
    const user = await prisma.$transaction(async (tx) => {
      return tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      });
    });
    
    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
