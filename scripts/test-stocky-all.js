require('dotenv').config({ path: __dirname + '/../.env' });

async function testStockyAll() {
  const apiKey = "76c43a1e4bc7d9b09b06b9b5e4fae3bb";
  const shop = process.env.SHOPIFY_DOMAIN;
  
  try {
    const res = await fetch("https://stocky.shopifyapps.com/api/v2/purchase_orders.json", {
      headers: { 
        'Store-Name': shop,
        'Authorization': 'API KEY=' + apiKey
      }
    });
    const json = await res.json();
    const pos = json.purchase_orders || [];
    console.log("Total POs in Stocky:", pos.length);
    pos.forEach(po => {
      console.log("- PO" + po.number + " | Created: " + po.created_at + " | Supplier: " + po.supplier_name);
    });
  } catch (e) {
    console.error(e.message);
  }
}

testStockyAll();
