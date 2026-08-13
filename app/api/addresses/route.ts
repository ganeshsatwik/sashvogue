import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/lib/models/Address';
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
      return NextResponse.json({ error: 'User profile not synchronized' }, { status: 404 });
    }

    const addresses = await Address.find({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
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

    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, isDefault } =
      await request.json();

    if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !postalCode) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ error: 'User profile not synchronized' }, { status: 404 });
    }

    // If marked as default, set other addresses as not default
    if (isDefault) {
      await Address.updateMany({ user: user._id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: user._id,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'India',
      isDefault: !!isDefault,
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
