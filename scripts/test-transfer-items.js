require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testTransfers() {
  const query = `
    query {
      inventoryTransfers(first: 2) {
        edges {
          node {
            name
            status
            dateCreated
            destination {
              name
            }
            origin {
              name
            }
            lineItems(first: 5) {
              edges {
                node {
                  quantity
                  receivedQuantity
                  inventoryItem {
                    id
                    sku
                  }
                }
              }
            }
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
