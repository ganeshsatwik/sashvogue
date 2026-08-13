import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Payment from '@/lib/models/Payment';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Package, CheckCircle, Truck, AlertTriangle } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    return (
      <div className="text-center text-xs text-gray-550 py-12">
        Please sign in to view order details.
      </div>
    );
  }

  const decodedToken = await verifySessionToken(sessionToken);
  if (!decodedToken) {
    return (
      <div className="text-center text-xs text-gray-550 py-12">
        Invalid session. Please login again.
      </div>
    );
  }

  const userId = decodedToken.userId;

  await connectDB();
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return (
      <div className="text-center text-xs text-gray-550 py-12">
        User account not synchronized.
      </div>
    );
  }

  // Ensure Payment model is loaded before populate
  Payment.init();

  // Find order by human-readable orderId
  const order: any = await Order.findOne({ orderId: id, user: user._id })
    .populate('paymentDetails')
    .populate('items.product')
    .lean();

  if (!order) {
    notFound();
  }

  // Map product image to items
  if (order.items) {
    order.items = order.items.map((item: any) => ({
      ...item,
      image: item.product?.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100'
    }));
  }

  const payment = order.paymentDetails as any;

  return (
    <div className="space-y-6">
      
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
        <div className="space-y-1">
          <Link
            href="/orders"
            className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-wider flex items-center gap-1 mb-2"
          >
            <ArrowLeft size={10} /> Back to Orders
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-wide text-gray-900">
            Order {order.orderId}
          </h1>
          <p className="text-[10px] text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className={`text-[9px] font-bold uppercase px-3 py-1 rounded border ${
          order.status === 'Delivered'
            ? 'bg-green-50 text-green-700 border-green-150'
            : order.status === 'Cancelled'
            ? 'bg-red-50 text-red-700 border-red-150'
            : 'bg-yellow-50 text-yellow-700 border-yellow-150'
        }`}>
          {order.status}
        </span>
      </div>

      {/* Invoice Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Ordered items and receipt details (Left Columns) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Ordered items list */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                Items Ordered
              </h2>
            </div>
            <div className="divide-y divide-gray-200 bg-white">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4 p-4 items-center">
                  <div className="w-12 aspect-[3/4] bg-gray-50 rounded overflow-hidden shrink-0 border border-gray-150">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=100'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                    {(item.variant?.size || item.size || item.variant?.color || item.color) && (
                      <div className="flex gap-1.5 items-center mt-1">
                        {(item.variant?.size || item.size) && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Size: {item.variant?.size || item.size}</span>}
                        {(item.variant?.color || item.color) && <span className="text-[9px] font-bold px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded">Color: {item.variant?.color || item.color}</span>}
                      </div>
                    )}
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                    <p className="text-[10px] text-gray-400">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment receipt info */}
          {order.paymentMethod === 'UPI' && payment && (
            <div className="border border-gray-200 rounded p-4 bg-white space-y-3 text-xs">
              <h3 className="font-bold text-gray-800 uppercase text-[10px] tracking-wide border-b border-gray-100 pb-2">
                UPI Payment Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Transaction ID</p>
                  <p className="font-semibold text-gray-850 truncate">{payment.transactionId || 'Not submitted yet'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Verification Status</p>
                  <p className={`font-bold ${payment.status === 'Approved' ? 'text-green-600' : payment.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
              {payment.screenshotUrl && (
                <div className="pt-2">
                  <p className="text-gray-400 mb-1">Receipt Screenshot</p>
                  <a
                    href={payment.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block border border-gray-300 rounded p-1 bg-gray-50 hover:bg-gray-100"
                  >
                    <img src={payment.screenshotUrl} alt="Receipt" className="max-w-[120px] max-h-[160px] object-contain" />
                  </a>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Shipping address & Invoice Summary (Right Column) */}
        <div className="space-y-6">
          
          {/* Shipping details */}
          <div className="border border-gray-200 rounded p-4 bg-white space-y-3 text-xs">
            <h3 className="font-bold text-gray-855 uppercase text-[10px] tracking-wide border-b border-gray-100 pb-2">
              Delivery Details
            </h3>
            <div className="space-y-1 leading-relaxed text-gray-600">
              <p className="font-bold text-gray-850">{order.shippingAddress.fullName}</p>
              <p>
                {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
              </p>
              <p>Phone: {order.shippingAddress.phoneNumber}</p>

              {order.estimatedDeliveryDate && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-green-700 mb-0.5 flex items-center gap-1">
                    <Truck size={12} /> Estimated Delivery
                  </p>
                  <p className="font-bold text-gray-900">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing totals summary */}
          <div className="border border-gray-200 rounded p-4 bg-white space-y-4 text-xs">
            <h3 className="font-bold text-gray-855 uppercase text-[10px] tracking-wide border-b border-gray-100 pb-2">
              Billing Breakdown
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-gray-550">
                <span>Subtotal</span>
                <span>₹{order.totalPrice + order.discountAmount - order.shippingFee}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-550">
                <span>Shipping Fee</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-950 text-sm">
                <span>Total Paid</span>
                <span>₹{order.totalPrice}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
