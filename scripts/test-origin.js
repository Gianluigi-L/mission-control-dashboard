require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testOrigin() {
  const query = `
    query {
      inventoryTransfers(first: 3) {
        edges {
          node {
            origin {
              __typename
            }
          }
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("Origin Types:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching origin types:", error);
  }
}

testOrigin();
