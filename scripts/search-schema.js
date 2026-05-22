require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function searchSchema() {
  const query = `
    query {
      __schema {
        types {
          name
          description
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    const types = result.__schema.types;
    const poTypes = types.filter(t => t.name.toLowerCase().includes('purchase'));
    console.log("Types with 'purchase':", JSON.stringify(poTypes, null, 2));
  } catch (error) {
    console.error("Error fetching schema:", error);
  }
}

searchSchema();
