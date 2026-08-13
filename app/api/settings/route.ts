import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export async function GET() {
  try {
    await connectDB();
    const configRecord = await Settings.findOne({ key: 'store_config' });
    const settings = configRecord ? configRecord.value : null;

    // We only expose public settings like UPI
    const publicSettings = settings
      ? { upiId: settings.upiId, upiMerchantName: settings.upiMerchantName, upiHelpVideoUrl: settings.upiHelpVideoUrl || '', upiHelpText: settings.upiHelpText || '', upiHelpImageUrl: settings.upiHelpImageUrl || '' }
      : { upiId: 'dyhardx@okaxis', upiMerchantName: 'Sash Clothing', upiHelpVideoUrl: '', upiHelpText: 'After making the payment, open your UPI app\'s transaction history. Look for a 12-digit number labeled as "UPI Ref. ID", "UTR", or "Transaction ID". Enter it exactly as shown.', upiHelpImageUrl: '' };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
