import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';
import Order from '@/lib/models/Order';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await verifySessionToken(sessionToken);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const transactionId = formData.get('transactionId') as string;
    const screenshotUrl = formData.get('screenshotUrl') as string;

    if (!orderId || !transactionId) {
      return NextResponse.json({ error: 'Order ID and Transaction ID are required' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const payment = await Payment.findById(order.paymentDetails);
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }



    // Update payment record details
    payment.transactionId = transactionId;
    if (screenshotUrl) {
      payment.screenshotUrl = screenshotUrl;
    }
    payment.status = 'Pending';
    await payment.save();

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Payment receipt submit failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
