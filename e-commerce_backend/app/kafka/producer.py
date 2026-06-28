"""
Kafka producer wrapper for inter-microservice events.

Even though this codebase is currently a modular monolith, every cross-domain
side effect (order placed, stock updated, payment processed) is published as
a Kafka event here. This makes splitting any module into its own microservice
later a matter of moving the consumer, not rewriting the event contract.

If KAFKA_ENABLED=false (e.g. local dev without a Kafka broker), publish()
becomes a no-op logger call so the rest of the app still works.
"""
import json
from typing import Optional

from app.core.config import settings
from app.core.logging_config import logger

try:
    from confluent_kafka import Producer
except ImportError:  # allows local dev without the kafka client installed
    Producer = None


class KafkaEventProducer:
    def __init__(self):
        self._producer: Optional["Producer"] = None
        if settings.KAFKA_ENABLED and Producer is not None:
            self._producer = Producer({
                "bootstrap.servers": settings.KAFKA_BOOTSTRAP_SERVERS,
                "client.id": settings.KAFKA_CLIENT_ID,
                "acks": "all",            # wait for full replication — don't lose order/payment events
                "retries": 5,
                "linger.ms": 20,
            })

    @staticmethod
    def _delivery_callback(err, msg):
        if err is not None:
            logger.error("kafka.producer | Delivery failed for topic={} : {}", msg.topic(), err)
        else:
            logger.debug("kafka.producer | Delivered to {} [partition {}]", msg.topic(), msg.partition())

    def publish(self, topic: str, key: str, value: dict):
        if self._producer is None:
            logger.info("kafka.producer | (disabled) would publish to {}: key={} value={}", topic, key, value)
            return
        try:
            self._producer.produce(
                topic=topic,
                key=key.encode("utf-8"),
                value=json.dumps(value, default=str).encode("utf-8"),
                callback=self._delivery_callback,
            )
            self._producer.poll(0)  # trigger delivery callbacks without blocking
        except BufferError:
            logger.warning("kafka.producer | Local queue full, flushing and retrying once")
            self._producer.flush(5)
            self._producer.produce(topic=topic, key=key.encode("utf-8"), value=json.dumps(value, default=str).encode("utf-8"))

    def flush(self, timeout: float = 10.0):
        if self._producer is not None:
            self._producer.flush(timeout)


kafka_producer = KafkaEventProducer()
