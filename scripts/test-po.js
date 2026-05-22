require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testTransfers() {
  const query = `
    query {
      inventoryTransfers(first: 20) {
        edges {
          node {
            name
            status
            dateCreated
            referenceName
            note
            tags
            receivedQuantity
            totalQuantity
          }
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("Transfers:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching transfers:", error);
  }
}

testTransfers();
