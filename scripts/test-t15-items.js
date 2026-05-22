require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testT15Items() {
  const query = `
    query {
      inventoryTransfers(first: 20) {
        edges {
          node {
            name
            origin { name }
            lineItems(first: 5) {
              edges {
                node {
                  title
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
    const edges = result.inventoryTransfers.edges;
    edges.forEach(e => {
      if (e.node.name === '#T0015') {
        const items = e.node.lineItems.edges;
        items.forEach(i => {
           console.log("Title:", i.node.title, "Vendor:", i.node.inventoryItem?.variant?.product?.vendor);
        });
      }
    });
  } catch (e) {
    console.error(e.message);
  }
}

testT15Items();
