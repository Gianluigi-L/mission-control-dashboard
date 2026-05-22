require('dotenv').config({ path: __dirname + '/../.env' });
const { shopifyGraphQL } = require('./lib/shopify-graphql');

async function checkPO() {
  const query = `
    query {
      __schema {
        types {
          name
        }
      }
    }
  `;
  try {
    const result = await shopifyGraphQL(query);
    const types = result.__schema.types;
    const poTypes = types.filter(t => t.name.toLowerCase().includes('purchaseorder') || t.name.toLowerCase().includes('purchase'));
    console.log("PO Types in Schema:", poTypes.map(t => t.name));
  } catch (e) {
    console.error(e.message);
  }
}

checkPO();
