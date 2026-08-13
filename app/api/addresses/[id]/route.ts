import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Address from '@/lib/models/Address';
import User from '@/lib/models/User';
import { verifySessionToken } from '@/lib/auth-jwt';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { fullName, phoneNumber, addressLine1, addressLine2, city, state, postalCode, country, isDefault } =
      await request.json();

    await connectDB();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const address = await Address.findOne({ _id: id, user: user._id });
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (isDefault) {
      await Address.updateMany({ user: user._id }, { isDefault: false });
    }

    address.fullName = fullName || address.fullName;
    address.phoneNumber = phoneNumber || address.phoneNumber;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 !== undefined ? addressLine2 : address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.postalCode = postalCode || address.postalCode;
    address.country = country || address.country;
    address.isDefault = isDefault !== undefined ? !!isDefault : address.isDefault;

    await address.save();

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const address = await Address.findOneAndDelete({ _id: id, user: user._id });

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
