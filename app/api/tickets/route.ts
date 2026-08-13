import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';
import User from '@/lib/models/User';
import { verifySessionToken } from '@/lib/auth-jwt';

function generateTicketId() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `TCK-${digits}`;
}

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

    const tickets = await SupportTicket.find({ user: user._id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Fetch tickets error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    const userId = decodedToken.userId;
    const { subject, description, department } = await request.json();

    if (!subject || !description || !department) {
      return NextResponse.json({ error: 'Subject, description, and department are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ticketId = generateTicketId();

    const newTicket = await SupportTicket.create({
      ticketId,
      user: user._id,
      subject,
      description,
      department,
      status: 'Open',
    });

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error) {
    console.error('Create ticket error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
