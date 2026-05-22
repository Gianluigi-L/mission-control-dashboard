require('dotenv').config({ path: __dirname + '/../.env' });

async function testRESTPurchaseOrders() {
  const token = process.env.SHOPIFY_API_TOKEN;
  const domain = process.env.SHOPIFY_DOMAIN;
  
  const urls = [
    "https://" + domain + "/admin/api/2024-01/purchase_orders.json",
    "https://" + domain + "/admin/purchase_orders.json"
  ];
  
  for (const url of urls) {
    try {
      console.log("Fetching " + url + "...");
      const res = await fetch(url, {
        headers: {
          'X-Shopify-Access-Token': token
        }
      });
      const text = await res.text();
      console.log("Status: " + res.status);
      console.log("Response: " + text.substring(0, 200));
    } catch (e) {
      console.error(e.message);
    }
  }
}

testRESTPurchaseOrders();
