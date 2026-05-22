const { BigQuery } = require('@google-cloud/bigquery');
const bq = new BigQuery({ projectId: 'atomic-box-494614-r5' });
async function run() {
  const [datasets] = await bq.getDatasets();
  for (const dataset of datasets) {
    const [tables] = await dataset.getTables();
    console.log(`Dataset: ${dataset.id}`);
    tables.forEach(t => console.log(`  - ${t.id}`));
  }
}
run().catch(console.error);
