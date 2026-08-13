import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth-jwt';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Order from '@/lib/models/Order';
import Link from 'next/link';
import { Eye } from 'lucide-react';

export default async function OrdersListPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    return (
      <div className="text-center text-xs text-gray-500 py-12">
        Please sign in to view your orders.
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

  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">
          My Orders
        </h1>
        <p className="text-sm font-medium tracking-wide leading-relaxed text-gray-500">Track and view history of your purchase orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl text-gray-500 text-sm font-medium">
          You haven't placed any orders yet. <Link href="/" className="text-black font-bold underline hover:text-gray-600">Start Shopping</Link>
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-hidden border-none shadow-xl shadow-black/5 rounded-3xl">
          <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-700">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Items Qty</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-600 font-medium">
              {orders.map((ord) => {
                const totalItems = ord.items.reduce((sum: number, i: any) => sum + i.quantity, 0);
                return (
                  <tr key={ord._id.toString()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{ord.orderId}</td>
                    <td className="px-6 py-4">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{totalItems}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">₹{ord.totalPrice}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded ${
                        ord.status === 'Delivered'
                          ? 'bg-green-50 text-green-700 border border-green-150'
                          : ord.status === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-150'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-150'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/orders/${ord.orderId}`}
                        className="inline-flex items-center gap-2 bg-[#0A1128] hover:bg-black text-white font-bold py-2 px-4 rounded-xl uppercase text-[10px] tracking-widest cursor-pointer transition-all shadow-md shadow-black/10"
                      >
                        <Eye size={12} />
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
