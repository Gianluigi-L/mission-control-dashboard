-- 1. Tabla Principal de Cabeceras (Transfers)
DROP TABLE IF EXISTS `raw_layer.shopify_purchase_orders`;

CREATE TABLE IF NOT EXISTS `raw_layer.shopify_purchase_orders` (
  id STRING NOT NULL,
  transfer_name STRING,
  status STRING,
  created_at TIMESTAMP,
  expected_arrival_date TIMESTAMP,
  supplier_name STRING,
  destination_name STRING,
  reference_name STRING,
  tags STRING,
  total_quantity INT64,
  received_quantity INT64,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY status, supplier_name;

-- 2. Tabla de Detalles (Items)
DROP TABLE IF EXISTS `raw_layer.shopify_purchase_order_items`;

CREATE TABLE IF NOT EXISTS `raw_layer.shopify_purchase_order_items` (
  transfer_id STRING NOT NULL,
  inventory_item_id STRING,
  sku STRING,
  title STRING,
  total_quantity INT64,
  received_quantity INT64,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(synced_at)
CLUSTER BY transfer_id, sku;
