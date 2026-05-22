require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testTransfer15() {
  const query = `
    query {
      inventoryTransfers(first: 20) {
        edges {
          node {
            name
            origin { name }
            destination { name }
          }
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    const edges = result.inventoryTransfers.edges;
    edges.forEach(e => {
      console.log(e.node.name, "Origin:", e.node.origin?.name, "Destination:", e.node.destination?.name);
    });
  } catch (e) {
    console.error(e.message);
  }
}

testTransfer15();
