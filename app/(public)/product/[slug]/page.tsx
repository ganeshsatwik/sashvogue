import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
// Required for category models registers
import '@/lib/models/Category';
import ProductDetails from '@/components/ProductDetails';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  await connectDB();
  
  // Check if slug is actually a valid 24-character hex string (ObjectId fallback)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
  
  let productDoc;
  if (isObjectId) {
    productDoc = await Product.findById(slug).populate('category');
  } else {
    productDoc = await Product.findOne({ slug }).populate('category');
  }

  if (!productDoc) {
    notFound();
  }

  // Serialize Document for Client Components
  const product = JSON.parse(JSON.stringify(productDoc));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <ProductDetails product={product} />
    </div>
  );
}
