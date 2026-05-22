import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bq = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });

export async function GET(request: Request) {
  try {
    const queryOrders = "SELECT id, transfer_name, status, created_at, expected_arrival_date, supplier_name, destination_name, reference_name, tags, total_quantity, received_quantity, synced_at FROM `" + process.env.GCP_PROJECT_ID + ".raw_layer.shopify_purchase_orders` ORDER BY created_at DESC LIMIT 200";

    const queryItems = "SELECT transfer_id, sku, title, total_quantity, received_quantity FROM `" + process.env.GCP_PROJECT_ID + ".raw_layer.shopify_purchase_order_items`";

    const [rowsOrders] = await bq.query({ query: queryOrders });
    const [rowsItems] = await bq.query({ query: queryItems });

    // Combine them
    const data = rowsOrders.map((o: any) => {
      const items = rowsItems.filter((i: any) => i.transfer_id === o.id);
      return { ...o, items };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
