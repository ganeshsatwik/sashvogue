import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';
import User from '@/lib/models/User';
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

    const query = id.startsWith('TCK-') ? { ticketId: id } : { _id: id };
    const ticket = await SupportTicket.findOne({ ...query, user: user._id });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, messages: ticket.messages });
  } catch (error) {
    console.error('Fetch ticket messages error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { text, fileUrl } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const query = id.startsWith('TCK-') ? { ticketId: id } : { _id: id };
    const ticket = await SupportTicket.findOne({ ...query, user: user._id });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const newMessage = {
      sender: 'User' as const,
      senderId: userId,
      senderName: user.name,
      text: text.trim(),
      fileUrl,
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);
    if (ticket.status === 'Closed') {
      ticket.status = 'Open';
    }
    await ticket.save();

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('Send ticket message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
