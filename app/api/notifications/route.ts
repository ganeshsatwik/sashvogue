import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifySessionToken } from '@/lib/auth-jwt';

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
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
    const { notificationId, markAll } = await request.json();

    await connectDB();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (markAll) {
      await Notification.updateMany({ user: user._id, read: false }, { read: true });
    } else if (notificationId) {
      await Notification.findOneAndUpdate({ _id: notificationId, user: user._id }, { read: true });
    }

    return NextResponse.json({ success: true, message: 'Notifications updated successfully' });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
