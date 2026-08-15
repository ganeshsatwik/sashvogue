import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Address from '@/lib/models/Address';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import Coupon from '@/lib/models/Coupon';
import { verifySessionToken } from '@/lib/auth-jwt';

// Helper to generate random string of digits
function generateId(prefix: string) {
  const digits = Math.floor(10000000 + Math.random() * 90000000); // 8 digits
  return `${prefix}-${digits}`;
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

    const { items, addressId, paymentMethod, couponCode, transactionId } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0 || !addressId || !paymentMethod) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return NextResponse.json({ error: 'User profile not synchronized' }, { status: 404 });
    }

    // Verify shipping address exists and belongs to the user
    const address = await Address.findOne({ _id: addressId, user: user._id });
    if (!address) {
      return NextResponse.json({ error: 'Invalid shipping address selected' }, { status: 400 });
    }

    let subtotal = 0;
    const orderedItems = [];

    // Process items and stock updates
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 });
      }

      if (product.status !== 'published') {
        return NextResponse.json({ error: `Product is not available: ${product.name}` }, { status: 400 });
      }

      // Check variant stock if variant is selected
      if (item.variantId) {
        const variant = product.variants.find((v: any) => v.sku === item.variantId);
        if (!variant) {
          return NextResponse.json({ error: `Selected variant not found for ${product.name}` }, { status: 400 });
        }

        if (variant.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${product.name} (${variant.size}/${variant.color})` }, { status: 400 });
        }

        // Decrement stock
        variant.stock -= item.quantity;
        product.stock -= item.quantity;
        
        const price = variant.price || product.price;
        subtotal += price * item.quantity;

        orderedItems.push({
          product: product._id,
          name: product.name,
          price,
          quantity: item.quantity,
          variant: { size: variant.size, color: variant.color }
        });
      } else {
        // Standard item without variants
        if (product.stock < item.quantity) {
          return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
        }

        product.stock -= item.quantity;
        subtotal += product.price * item.quantity;

        orderedItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          variant: { size: 'N/A', color: 'N/A' }
        });
      }

      await product.save();
    }

    // Validate Coupon
    let discountAmount = 0;
    let couponRef: any = undefined;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.status === 'active' && new Date() <= new Date(coupon.endDate) && subtotal >= coupon.minOrderValue) {
        if (coupon.usageLimit === undefined || coupon.usedCount < coupon.usageLimit) {
          if (coupon.discountType === 'percentage') {
            let discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount !== undefined) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
            discountAmount = Math.round(discount);
          } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
          }
          coupon.usedCount += 1;
          if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
            coupon.status = 'expired';
          }
          await coupon.save();
          couponRef = coupon._id;
        }
      }
    }

    const shippingFee = subtotal >= 1999 ? 0 : 69;
    const totalPrice = subtotal - discountAmount + shippingFee;

    const orderId = generateId('ORD');
    const paymentId = generateId('PAY');

    // Instantiate Payment document
    const payment = new Payment({
      paymentId,
      user: user._id,
      paymentMethod,
      amount: totalPrice,
      transactionId,
      status: 'Pending'
    });

    // Instantiate Order document
    const order = new Order({
      orderId,
      user: user._id,
      items: orderedItems,
      shippingAddress: {
        fullName: address.fullName,
        phoneNumber: address.phoneNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      },
      paymentMethod,
      paymentStatus: 'Pending',
      paymentDetails: payment._id,
      totalPrice,
      discountAmount,
      shippingFee,
      coupon: couponRef,
      status: 'Pending'
    });

    // Link order inside payment document
    payment.order = order._id;
    
    // Save both documents
    await order.save();
    await payment.save();

    return NextResponse.json({ success: true, orderId: order.orderId, order });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal Server Error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
  }
}
