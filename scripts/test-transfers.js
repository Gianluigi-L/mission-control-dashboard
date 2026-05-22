require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testSample() {
  const query = `
    query {
      inventoryTransfers(first: 3) {
        edges {
          node {
            name
            status
            dateCreated
            origin {
              ... on InventoryTransferLocationOrigin {
                location { name }
              }
              ... on InventoryTransferSupplierOrigin {
                supplier { name }
              }
            }
            destination {
              ... on InventoryTransferLocationDestination {
                location { name }
              }
            }
            receivedQuantity
            totalQuantity
          }
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("Sample:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching sample:", error);
  }
}

testSample();
