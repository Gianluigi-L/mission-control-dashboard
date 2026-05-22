require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testSupplier() {
  const query = `
    query {
      inventoryTransfers(first: 3) {
        edges {
          node {
            name
            origin { name }
            destination { name }
            lineItems(first: 1) {
              edges {
                node {
                  inventoryItem {
                    id
                    sku
                    variant {
                      product {
                        vendor
                      }
                    }
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
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}

testSupplier();
