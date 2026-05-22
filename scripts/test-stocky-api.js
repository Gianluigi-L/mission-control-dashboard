require('dotenv').config({ path: __dirname + '/../.env' });

async function testStocky() {
  const apiKey = "76c43a1e4bc7d9b09b06b9b5e4fae3bb";
  const shop = process.env.SHOPIFY_DOMAIN;
  
  try {
    console.log("Testing Stocky API with Store-Name and Authorization...");
    const res = await fetch("https://stocky.shopifyapps.com/api/v2/purchase_orders.json?limit=5", {
      headers: { 
        'Store-Name': shop,
        'Authorization': 'API KEY=' + apiKey
      }
    });
    const text = await res.text();
    console.log("Status: " + res.status);
    console.log("Response: ", text.substring(0, 1000));
  } catch (e) {
    console.error(e.message);
  }
}

testStocky();
