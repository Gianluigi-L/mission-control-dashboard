import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const bq = new BigQuery({ projectId: process.env.GCP_PROJECT_ID });
const DATASET_ID = 'raw_layer';

async function shopifyGraphQL(query: string) {
  const token = process.env.SHOPIFY_API_TOKEN;
  const domain = process.env.SHOPIFY_DOMAIN;
  if (!token || !domain) throw new Error("Missing SHOPIFY_API_TOKEN or SHOPIFY_DOMAIN");
  const url = `https://${domain}/admin/api/2024-10/graphql.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  if (data.errors && data.errors.length > 0) throw new Error(`GraphQL Error: ${data.errors[0].message}`);
  return data.data;
}

async function fetchAllTransfers() {
  let hasNextPage = true;
  let endCursor = null;
  let allTransfers: any[] = [];
  
  while (hasNextPage) {
    const afterParam = endCursor ? `, after: "${endCursor}"` : '';
    const query = `query { inventoryTransfers(first: 50${afterParam}) { pageInfo { hasNextPage endCursor } edges { node { id name status dateCreated destination { name } origin { name } note tags lineItems(first: 50) { edges { node { inventoryItem { id sku } pickedForShipmentQuantity processableQuantity shippableQuantity shippedQuantity title totalQuantity } } } } } } }`;
    
    const result = await shopifyGraphQL(query);
    const connection = result.inventoryTransfers;
    
    for (const edge of connection.edges) {
      const dateStr = edge.node.dateCreated;
      if (dateStr && (dateStr.startsWith('2026') || dateStr.startsWith('2025'))) {
         allTransfers.push(edge.node);
      }
    }
    
    hasNextPage = connection.pageInfo.hasNextPage;
    endCursor = connection.pageInfo.endCursor;
    if (hasNextPage) await new Promise(r => setTimeout(r, 500));
  }
  return allTransfers;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transfers = await fetchAllTransfers();
    if (transfers.length === 0) return NextResponse.json({ status: 'success', message: 'No transfers found' });

    const bqOrders: any[] = [];
    const bqItems: any[] = [];

    const knownSuppliers = ['Amazon', 'Aliexpress', 'AGI', 'Masterfone', 'MT Connection', 'Miamitek', 'Walmart', 'Apple', 'Uniqbe', 'Desa', 'BSC Global', 'Titos Corp', 'Lenovo', 'MercadoLIbre', 'Somytimes', 'Meta', 'Newegg', 'Paris CENCOSUD'];

    transfers.forEach(t => {
      let total_q = 0;
      let received_q = 0;
      const items = t.lineItems.edges.map((e: any) => e.node);
      items.forEach((item: any) => {
         const qty = item.totalQuantity || 0;
         const rec = item.shippedQuantity || 0;
         total_q += qty;
         received_q += rec;
         bqItems.push({
           transfer_id: t.id, inventory_item_id: item.inventoryItem?.id || null,
           sku: item.inventoryItem?.sku || null, title: item.title || null,
           total_quantity: qty, received_quantity: rec, synced_at: new Date().toISOString()
         });
      });
      let final_supplier = t.origin?.name || null;
      if (t.tags && t.tags.length > 0) {
        const tagSupplier = t.tags.find((tag: string) => knownSuppliers.some(ks => ks.toLowerCase() === tag.toLowerCase()));
        if (tagSupplier) {
          final_supplier = tagSupplier;
        }
      }

      bqOrders.push({
        id: t.id, transfer_name: t.name, status: t.status, created_at: t.dateCreated,
        expected_arrival_date: null, supplier_name: final_supplier,
        destination_name: t.destination?.name || null, reference_name: t.note || null,
        tags: (t.tags || []).join(', '), total_quantity: total_q, received_quantity: received_q, synced_at: new Date().toISOString()
      });
    });

    const mergeQuery = `
      MERGE \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.shopify_purchase_orders\` T
      USING UNNEST(@orders) S ON T.id = S.id
      WHEN MATCHED THEN UPDATE SET transfer_name=S.transfer_name, status=S.status, expected_arrival_date=S.expected_arrival_date, supplier_name=S.supplier_name, destination_name=S.destination_name, reference_name=S.reference_name, tags=S.tags, total_quantity=S.total_quantity, received_quantity=S.received_quantity, synced_at=TIMESTAMP(S.synced_at)
      WHEN NOT MATCHED THEN INSERT (id, transfer_name, status, created_at, expected_arrival_date, supplier_name, destination_name, reference_name, tags, total_quantity, received_quantity, synced_at) VALUES (S.id, S.transfer_name, S.status, TIMESTAMP(S.created_at), S.expected_arrival_date, S.supplier_name, S.destination_name, S.reference_name, S.tags, S.total_quantity, S.received_quantity, TIMESTAMP(S.synced_at))
    `;
    await bq.createQueryJob({ query: mergeQuery, params: { orders: bqOrders } }).then(res => res[0].promise());

    if (bqItems.length > 0) {
      const transferIds = Array.from(new Set(bqItems.map(i => `'${i.transfer_id}'`))).join(',');
      const delQuery = `DELETE FROM \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.shopify_purchase_order_items\` WHERE transfer_id IN (${transferIds})`;
      await bq.createQueryJob({ query: delQuery }).then(res => res[0].promise());
      const insertQuery = `INSERT INTO \`${process.env.GCP_PROJECT_ID}.${DATASET_ID}.shopify_purchase_order_items\` (transfer_id, inventory_item_id, sku, title, total_quantity, received_quantity, synced_at) SELECT * FROM UNNEST(@items)`;
      await bq.createQueryJob({ query: insertQuery, params: { items: bqItems } }).then(res => res[0].promise());
    }

    return NextResponse.json({ status: 'success', orders_processed: bqOrders.length, items_processed: bqItems.length, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error syncing purchase orders:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
