import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Settings from '@/lib/models/Settings';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const query = id.startsWith('ORD-') ? { orderId: id } : { _id: id };
    const order = await Order.findOne({ ...query, user: user._id });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const configRecord = await Settings.findOne({ key: 'store_config' });
    const settings = configRecord ? configRecord.value : null;

    return NextResponse.json({ success: true, order, settings });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
