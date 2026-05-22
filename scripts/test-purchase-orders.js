require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testPurchaseOrders() {
  const query = `
    query {
      purchaseOrders(first: 5) {
        edges {
          node {
            id
            name
            status
            vendor {
              name
            }
            destination {
              name
            }
          }
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("Purchase Orders:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
  }
}

testPurchaseOrders();
