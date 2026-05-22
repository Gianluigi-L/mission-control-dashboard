require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function testT15() {
  const query = `
    query {
      inventoryTransfers(first: 20) {
        edges {
          node {
            name
            status
            dateCreated
            destination { name }
            origin { name }
            note
            tags
            referenceName
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
        console.log("Full Transfer:", JSON.stringify(e.node, null, 2));
      }
    });
  } catch (e) {
    console.error(e.message);
  }
}

testT15();
