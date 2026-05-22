require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function checkSchema() {
  const query = `
    query {
      __type(name: "InventoryTransfer") {
        name
        fields {
          name
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("Schema:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

checkSchema();
