require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function checkSchema() {
  const query = `
    query {
      __type(name: "InventoryTransfer") {
        fields {
          name
          description
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    console.log("InventoryTransfer fields:", JSON.stringify(result.__type.fields, null, 2));
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

checkSchema();
