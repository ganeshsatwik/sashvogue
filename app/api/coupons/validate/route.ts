import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/lib/models/Coupon';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Code and subtotal are required' }, { status: 400 });
    }

    await connectDB();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (coupon.status === 'disabled') {
      return NextResponse.json({ error: 'This coupon is disabled' }, { status: 400 });
    }

    const now = new Date();
    if (now < new Date(coupon.startDate)) {
      return NextResponse.json({ error: 'This coupon is not active yet' }, { status: 400 });
    }

    if (now > new Date(coupon.endDate) || coupon.status === 'expired') {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        { error: `Minimum order value to use this coupon is ₹${coupon.minOrderValue}` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon usage limit has been reached' }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else if (coupon.discountType === 'fixed') {
      discount = Math.min(coupon.discountValue, subtotal);
    }

    return NextResponse.json({
      success: true,
      discount: Math.round(discount),
      couponId: coupon._id,
      code: coupon.code,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
