"""
Kafka consumer that listens on `stock.updated` and applies stock changes to
the local Product table. This is what makes the PLP "Add to Cart" button
disable itself when SAP reports an item out-of-stock: SAP -> (OData polling
job or SAP-side outbound event) -> Kafka `stock.updated` -> this consumer ->
MySQL `products.is_in_stock` -> next PLP fetch reflects it.

Run this as a separate process/worker:
    python -m app.kafka.consumer
so it doesn't block the FastAPI request/response cycle.
"""
import json

from app.core.config import settings
from app.core.logging_config import logger
from app.db.session import SessionLocal
from app.models.product import Product

try:
    from confluent_kafka import Consumer
except ImportError:
    Consumer = None


def handle_stock_updated(db, payload: dict):
    sku = payload.get("sku")
    is_in_stock = payload.get("is_in_stock")
    quantity = payload.get("quantity", 0)

    if sku is None or is_in_stock is None:
        logger.warning("kafka.consumer | Malformed stock.updated payload: {}", payload)
        return

    product = db.query(Product).filter(Product.sku == sku).first()
    if product is None:
        logger.warning("kafka.consumer | stock.updated for unknown SKU={}", sku)
        return

    product.is_in_stock = bool(is_in_stock)
    product.stock_quantity = int(quantity)
    db.commit()
    logger.info("kafka.consumer | Updated stock for SKU={} is_in_stock={} qty={}", sku, is_in_stock, quantity)


def run_consumer_loop():
    if Consumer is None:
        logger.error("kafka.consumer | confluent_kafka not installed; consumer cannot start")
        return

    consumer = Consumer({
        "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
        "group.id": settings.KAFKA_GROUP_ID,
        "auto.offset.reset": "earliest",
        "enable.auto.commit": False,
    })
    consumer.subscribe([settings.KAFKA_TOPIC_STOCK_UPDATED])
    logger.info("kafka.consumer | Subscribed to topic={}", settings.KAFKA_TOPIC_STOCK_UPDATED)

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                logger.error("kafka.consumer | Error: {}", msg.error())
                continue

            db = SessionLocal()
            try:
                payload = json.loads(msg.value().decode("utf-8"))
                handle_stock_updated(db, payload)
                consumer.commit(msg)
            except Exception as exc:
                db.rollback()
                logger.exception("kafka.consumer | Failed to process message: {}", exc)
                # Intentionally NOT committing offset -> message will be reprocessed.
                # Production setups should route repeated failures to a dead-letter topic.
            finally:
                db.close()
    finally:
        consumer.close()


if __name__ == "__main__":
    run_consumer_loop()
