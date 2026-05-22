require('dotenv').config({ path: __dirname + '/.env' });
const { GoogleAdsApi } = require('google-ads-api');

async function test() {
  const developerToken  = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const clientId        = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret    = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken    = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const customerId      = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
  
  const api = new GoogleAdsApi({ client_id: clientId, client_secret: clientSecret, developer_token: developerToken });
  const customer = api.Customer({ customer_id: customerId, refresh_token: refreshToken });

  try {
    const response = await customer.keywordPlanIdeas.generateKeywordIdeas({
      customer_id: customerId,
      language: 'languageConstants/1003',
      geo_target_constants: ['geoTargetConstants/2152'],
      include_adult_keywords: false,
      keyword_seed: { keywords: ['iphone 15 pro max'] },
    });
    console.log("Success:", response);
  } catch(e) {
    console.error("Full error:");
    console.error(JSON.stringify(e, null, 2));
    if (e.response && e.response.data) {
        console.error("Data:", JSON.stringify(e.response.data, null, 2));
    }
  }
}
test();
