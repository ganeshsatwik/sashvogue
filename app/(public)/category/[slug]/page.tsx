import connectDB from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import Product from '@/lib/models/Product';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  
  await connectDB();
  const category = await Category.findOne({ slug, status: 'active' });
  
  if (!category) {
    notFound();
  }

  const products = await Product.find({
    category: category._id,
    status: 'published',
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 uppercase">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-sm text-gray-500">{category.description}</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded text-gray-500 text-sm">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div key={prod._id.toString()} className="group flex flex-col border border-gray-200 rounded overflow-hidden bg-white">
              <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                <img
                  src={prod.images?.[0] || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'}
                  alt={prod.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/product/${prod.slug || prod._id}`} className="block text-center bg-white text-black text-xs font-bold py-2 rounded hover:bg-gray-100 uppercase tracking-wider">
                    View Details
                  </Link>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1 gap-1">
                <h3 className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-black">
                  <Link href={`/product/${prod.slug || prod._id}`}>
                    {prod.name}
                  </Link>
                </h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">₹{prod.price}</span>
                  {prod.compareAtPrice && (
                    <span className="text-xs text-gray-500 line-through">₹{prod.compareAtPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
