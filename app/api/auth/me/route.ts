import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifySessionToken } from '@/lib/auth-jwt';

// Required for mongoose model registers
import '@/lib/models/Role';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifySessionToken(sessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = decodedToken.userId;

    await connectDB();

    const user = await User.findOne({ _id: userId }).populate('role');

    if (!user) {
      return NextResponse.json({ error: 'User profile not synchronized' }, { status: 404 });
    }

    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
