import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function PUT(request: NextRequest) {
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
    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { name: name.trim() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
