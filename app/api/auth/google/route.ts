import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { signSessionToken } from '@/lib/auth-jwt';

export async function POST(request: NextRequest) {
  try {
    const { token, phoneNumber } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify token by fetching user profile from Google
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!googleRes.ok) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }

    const googleUser = await googleRes.json();
    const googleId = googleUser.sub;
    const email = googleUser.email;
    const name = googleUser.name;

    await connectDB();

    // Check if user already exists
    let existingUser = await User.findOne({ googleId });

    if (!existingUser) {
      // Check if an existing record matches the email
      if (email) {
        existingUser = await User.findOne({ email });
        if (existingUser) {
          // Link Google ID to existing email record
          existingUser.googleId = googleId;
          if (phoneNumber && !existingUser.phoneNumber) {
            existingUser.phoneNumber = phoneNumber;
          }
          await existingUser.save();
        }
      }
    } else {
       // User exists, update phone number if provided and not already set
       if (phoneNumber && !existingUser.phoneNumber) {
           existingUser.phoneNumber = phoneNumber;
           await existingUser.save();
       }
    }

    if (!existingUser) {
      // Fetch the default Customer role
      let customerRole = await Role.findOne({ name: 'Customer' });
      if (!customerRole) {
        customerRole = await Role.create({ name: 'Customer', permissions: [] });
      }

      // Create new customer user
      existingUser = await User.create({
        googleId,
        name: name || email.split('@')[0],
        email: email,
        phoneNumber,
        role: customerRole._id,
        status: 'active',
      });
    }

    // Generate JWT Session
    const sessionToken = await signSessionToken({
      userId: existingUser._id.toString(),
      email: existingUser.email,
      role: existingUser.role.toString()
    });

    const response = NextResponse.json({ success: true, user: existingUser });

    // Set cookie
    response.cookies.set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Google Auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
