import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import '@/lib/models/Category';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // 'men', 'women'
    const tag = searchParams.get('tag'); // 'trending', 'best-seller'
    const limit = parseInt(searchParams.get('limit') || '12');

    await connectDB();
    
    const query: any = { status: 'published' };
    
    if (gender) {
      // Match gender by tags field
      query['tags'] = { $in: [gender] };
    }
    
    if (tag === 'trending') {
      query['tags'] = { $in: ['trending', 'new'] };
    } else if (tag === 'best-seller') {
      query['tags'] = { $in: ['best-seller', 'bestseller'] };
    }

    let products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);

    // If tagged query returns nothing, fallback to latest published products
    if (products.length === 0) {
      const fallbackQuery: any = { status: 'published' };
      if (gender) {
        fallbackQuery['tags'] = { $in: [gender] };
      }
      products = await Product.find(fallbackQuery)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit);
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
