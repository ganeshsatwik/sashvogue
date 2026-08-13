import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Address from '@/lib/models/Address';
import Link from 'next/link';
import { MapPin, ShoppingBag, ArrowRight } from 'lucide-react';

export default async function DashboardOverviewPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    return (
      <div className="text-center text-xs text-gray-500 py-12">
        Please sign in to view your dashboard.
      </div>
    );
  }

  const decodedToken = await verifySessionToken(sessionToken);
  if (!decodedToken) {
    return (
      <div className="text-center text-xs text-gray-500 py-12">
        Invalid session. Please login again.
      </div>
    );
  }

  const userId = decodedToken.userId;

  await connectDB();
  const user = await User.findOne({ _id: userId });

  if (!user) {
    return (
      <div className="text-center text-xs text-gray-500 py-12">
        User account not synchronized.
      </div>
    );
  }

  const recentOrders = await Order.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(2);

  const totalOrders = await Order.countDocuments({ user: user._id });
  const defaultAddress = await Address.findOne({ user: user._id, isDefault: true });

  return (
    <div className="space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">
          Account Overview
        </h1>
        <p className="text-sm font-medium tracking-wide leading-relaxed text-gray-500">Summary of your account status and recent orders.</p>
      </div>

      {/* Overview Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#F9F7F2] flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <span className="p-3.5 bg-[#0A1128] text-white rounded-2xl shadow-lg shadow-black/10">
            <ShoppingBag size={24} />
          </span>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Purchases</p>
            <p className="text-2xl font-black text-gray-900">{totalOrders} Orders</p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#F9F7F2] flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
          <span className="p-3.5 bg-[#0A1128] text-white rounded-2xl shadow-lg shadow-black/10">
            <MapPin size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Default Address</p>
            <p className="text-sm font-bold text-gray-800 truncate">
              {defaultAddress ? defaultAddress.fullName : 'No default address set'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders section */}
      <div className="space-y-6 pt-4">
        <div className="flex justify-between items-baseline border-b border-gray-100 pb-3">
          <h2 className="text-2xl font-serif text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-[10px] font-bold text-gray-500 hover:text-[#0A1128] uppercase tracking-widest flex items-center gap-1 transition-colors">
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-500 text-sm font-medium">
            You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div key={ord._id.toString()} className="flex justify-between items-center p-4 border border-gray-200 rounded hover:border-gray-400">
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-gray-900">{ord.orderId}</p>
                  <p className="text-[10px] text-gray-450">
                    Placed on {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-bold text-gray-900">₹{ord.totalPrice}</p>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saved Address Widget */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline border-b border-gray-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">Primary Shipping Address</h2>
          <Link href="/addresses" className="text-[10px] font-bold text-gray-500 hover:text-black uppercase tracking-wider flex items-center gap-0.5">
            Manage <ArrowRight size={10} />
          </Link>
        </div>

        {defaultAddress ? (
          <div className="p-4 border border-gray-200 rounded space-y-1 text-xs">
            <p className="font-bold text-gray-800">{defaultAddress.fullName}</p>
            <p className="text-gray-500">
              {defaultAddress.addressLine1}, {defaultAddress.addressLine2 && `${defaultAddress.addressLine2}, `}
              {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
            </p>
            <p className="text-gray-500">Phone: {defaultAddress.phoneNumber}</p>
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded text-gray-550 text-xs">
            No shipping address set yet. <Link href="/addresses" className="underline font-bold">Add Address</Link>
          </div>
        )}
      </div>

    </div>
  );
}
