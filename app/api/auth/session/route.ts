import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    authenticated: false,
    message: "User not authenticated"
  });
}