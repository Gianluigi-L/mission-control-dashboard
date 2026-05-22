require('dotenv').config({ path: __dirname + '/../.env' });
const { BigQuery } = require('@google-cloud/bigquery');
const { shopifyGraphQL } = require('./lib/shopify-graphql');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET_ID = 'raw_layer';
const bq = new BigQuery({ projectId: PROJECT_ID });

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchAllTransfers() {
  let hasNextPage = true;
  let endCursor = null;
  let allTransfers = [];
  
  while (hasNextPage) {
    const afterParam = endCursor ? ', after: "' + endCursor + '"' : '';
    // Extraemos las transferencias y hasta 50 items por transferencia
    const query = "query { inventoryTransfers(first: 50" + afterParam + ") { pageInfo { hasNextPage endCursor } edges { node { id name status dateCreated destination { name } origin { name } note tags lineItems(first: 50) { edges { node { inventoryItem { id sku } pickedForShipmentQuantity processableQuantity shippableQuantity shippedQuantity title totalQuantity } } } } } } }";
    
    console.log("[GraphQL] Fetching batch of transfers...");
    const result = await shopifyGraphQL(query);
    const connection = result.inventoryTransfers;
    
    for (const edge of connection.edges) {
      // Filtrar 2025 en adelante para propósitos de demostración y KPIs
      const dateStr = edge.node.dateCreated;
      if (dateStr && (dateStr.startsWith('2026') || dateStr.startsWith('2025'))) {
         allTransfers.push(edge.node);
      }
    }
    
    hasNextPage = connection.pageInfo.hasNextPage;
    endCursor = connection.pageInfo.endCursor;
    
    if (hasNextPage) await delay(500);
  }
  
  return allTransfers;
}

async function syncToBigQuery() {
  console.log('=== Iniciando Extracción Nativa de Transfers e Items (Shopify -> BQ) ===');
  
  try {
    const transfers = await fetchAllTransfers();
    console.log("  → Se obtuvieron " + transfers.length + " transferencias de 2026.");

    if (transfers.length === 0) {
      console.log('✅ No hay datos de 2026 para sincronizar.');
      return;
    }

    const bqOrders = [];
    const bqItems = [];

    const knownSuppliers = ['Amazon', 'Aliexpress', 'AGI', 'Masterfone', 'MT Connection', 'Miamitek', 'Walmart', 'Apple', 'Uniqbe', 'Desa', 'BSC Global', 'Titos Corp', 'Lenovo', 'MercadoLIbre', 'Somytimes', 'Meta', 'Newegg', 'Paris CENCOSUD'];

    transfers.forEach(t => {
      let total_q = 0;
      let received_q = 0;
      
      const items = t.lineItems.edges.map(e => e.node);
      items.forEach(item => {
         const qty = item.totalQuantity || 0;
         const rec = item.shippedQuantity || 0; // en transfers, shippedQuantity a menudo refleja lo recibido en destino
         total_q += qty;
         received_q += rec;
         
         bqItems.push({
           transfer_id: t.id,
           inventory_item_id: item.inventoryItem?.id || null,
           sku: item.inventoryItem?.sku || null,
           title: item.title || null,
           total_quantity: qty,
           received_quantity: rec
         });
      });

      let final_supplier = t.origin?.name || null;
      if (t.tags && t.tags.length > 0) {
        const tagSupplier = t.tags.find(tag => knownSuppliers.some(ks => ks.toLowerCase() === tag.toLowerCase()));
        if (tagSupplier) {
          final_supplier = tagSupplier;
        }
      }

      bqOrders.push({
        id: t.id,
        transfer_name: t.name,
        status: t.status,
        created_at: t.dateCreated,
        expected_arrival_date: null,
        supplier_name: final_supplier,
        destination_name: t.destination?.name || null,
        reference_name: t.note || null,
        tags: (t.tags || []).join(', '),
        total_quantity: total_q,
        received_quantity: received_q
      });
    });

    // Subir Cabeceras (Orders)
    const targetTableOrders = PROJECT_ID + "." + DATASET_ID + ".shopify_purchase_orders";
    const valuesOrders = bqOrders.map(r => {
      const escape = (val) => val === null || val === undefined ? 'NULL' : '"' + val.toString().replace(/"/g, '\\"') + '"';
      const num = (val) => val === null || val === undefined ? 'NULL' : val;
      return "(" +
        escape(r.id) + ", " + escape(r.transfer_name) + ", " + escape(r.status) + ", " +
        "CAST(" + escape(r.created_at) + " AS TIMESTAMP), " +
        (r.expected_arrival_date ? "CAST(" + escape(r.expected_arrival_date) + " AS TIMESTAMP)" : "NULL") + ", " +
        escape(r.supplier_name) + ", " + escape(r.destination_name) + ", " +
        escape(r.reference_name) + ", " + escape(r.tags) + ", " +
        num(r.total_quantity) + ", " + num(r.received_quantity) + ", CURRENT_TIMESTAMP()" +
      ")";
    });

    const mergeOrders = "MERGE `" + targetTableOrders + "` T USING (" +
      " SELECT * FROM UNNEST([STRUCT<id STRING, transfer_name STRING, status STRING, created_at TIMESTAMP, expected_arrival_date TIMESTAMP, supplier_name STRING, destination_name STRING, reference_name STRING, tags STRING, total_quantity INT64, received_quantity INT64, synced_at TIMESTAMP>" +
      " " + valuesOrders.join(',\n') + " ])" +
      " ) S ON T.id = S.id" +
      " WHEN MATCHED THEN UPDATE SET transfer_name=S.transfer_name, status=S.status, expected_arrival_date=S.expected_arrival_date, supplier_name=S.supplier_name, destination_name=S.destination_name, reference_name=S.reference_name, tags=S.tags, total_quantity=S.total_quantity, received_quantity=S.received_quantity, synced_at=CURRENT_TIMESTAMP()" +
      " WHEN NOT MATCHED THEN INSERT (id, transfer_name, status, created_at, expected_arrival_date, supplier_name, destination_name, reference_name, tags, total_quantity, received_quantity, synced_at) VALUES (S.id, S.transfer_name, S.status, S.created_at, S.expected_arrival_date, S.supplier_name, S.destination_name, S.reference_name, S.tags, S.total_quantity, S.received_quantity, CURRENT_TIMESTAMP());";

    const [job1] = await bq.createQueryJob({ query: mergeOrders });
    await job1.promise();
    console.log("✅ Cabeceras sincronizadas.");

    if (bqItems.length > 0) {
      // Subir Items. Como los items no tienen un ID único claro a veces en la API para UPSERT, haremos Delete + Insert por cada transfer
      const transferIds = Array.from(new Set(bqItems.map(i => '"' + i.transfer_id + '"'))).join(',');
      const targetTableItems = PROJECT_ID + "." + DATASET_ID + ".shopify_purchase_order_items";
      
      const delQuery = "DELETE FROM `" + targetTableItems + "` WHERE transfer_id IN (" + transferIds + ")";
      await bq.createQueryJob({ query: delQuery }).then(res => res[0].promise());

      const valuesItems = bqItems.map(r => {
        const escape = (val) => val === null || val === undefined ? 'NULL' : '"' + val.toString().replace(/"/g, '\\"') + '"';
        const num = (val) => val === null || val === undefined ? 'NULL' : val;
        return "(" + escape(r.transfer_id) + ", " + escape(r.inventory_item_id) + ", " + escape(r.sku) + ", " + escape(r.title) + ", " + num(r.total_quantity) + ", " + num(r.received_quantity) + ", CURRENT_TIMESTAMP())";
      });

      const insertQuery = "INSERT INTO `" + targetTableItems + "` (transfer_id, inventory_item_id, sku, title, total_quantity, received_quantity, synced_at) " +
        "SELECT * FROM UNNEST([STRUCT<transfer_id STRING, inventory_item_id STRING, sku STRING, title STRING, total_quantity INT64, received_quantity INT64, synced_at TIMESTAMP>" +
        " " + valuesItems.join(',\n') + " ])";
      
      await bq.createQueryJob({ query: insertQuery }).then(res => res[0].promise());
      console.log("✅ " + bqItems.length + " Items sincronizados.");
    }

    console.log('🎉 Sincronización completa!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

syncToBigQuery();
