const { config } = require('dotenv');
config({ path: './.env' });
console.log("Token exists?", !!process.env.GOOGLE_ADS_REFRESH_TOKEN);
const { GoogleAdsApi } = require('google-ads-api');

async function test() {
  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });
    
    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, ''),
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });
    
    const query = `
      SELECT metrics.impressions, metrics.clicks
      FROM customer
      LIMIT 1
    `;
    const result = await customer.query(query);
    console.log("Success:", result);
  } catch(e) {
    console.error("Error:", e.message);
    if(e.response && e.response.data) {
        console.error(e.response.data);
    }
    if(e.errors) {
        console.error(e.errors);
    }
  }
}
test();
