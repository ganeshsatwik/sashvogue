import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/lib/models/Banner';

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find({ status: 'active' }).sort({ position: 1, createdAt: -1 });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    console.error('Fetch banners error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
