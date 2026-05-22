require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testDraftOrders() {
  const query = `
    query {
      draftOrders(first: 5, query: "created_at:>2025-12-31") {
        edges {
          node {
            name
            createdAt
            poNumber
          }
        }
      }
      orders(first: 5, query: "created_at:>2025-12-31") {
        edges {
          node {
            name
            createdAt
            poNumber
          }
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("DraftOrders:", JSON.stringify(result.draftOrders, null, 2));
    console.log("Orders:", JSON.stringify(result.orders, null, 2));
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
}

testDraftOrders();
