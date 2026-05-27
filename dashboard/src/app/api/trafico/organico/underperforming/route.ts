import { NextResponse } from 'next/server';
import { bq, DATASET_ID } from '@/lib/bigquery';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const maxLimit = Math.min(Math.max(1, limit), 12); // clamp between 1 and 12

    // Query to the new view that calculates underperforming products
    const query = `
      SELECT 
        product_id AS id, 
        title, 
        handle, 
        vendor,
        total_clicks,
        total_impressions,
        ctr,
        avg_position
      FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.v_gsc_underperforming_products\`
      ORDER BY total_impressions DESC
      LIMIT @limit
    `;

    const [rows] = await bq.query({
      query: query,
      params: { limit: maxLimit }
    });

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error fetching underperforming products:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch underperforming products' }, { status: 500 });
  }
}
