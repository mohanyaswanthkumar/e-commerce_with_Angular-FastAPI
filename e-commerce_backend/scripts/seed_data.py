"""
One-off seed script: creates an admin user and a few sample products so you
can log in and exercise the PLP/PDP/checkout flow immediately after setup.

Run with:
    python -m scripts.seed_data
"""
from decimal import Decimal

from app.db.session import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.user import User
from app.models.cart import Cart
from app.models.product import Product, Category


def run():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@example.com").first():
            admin = User(
                first_name="Admin",
                last_name="User",
                email="admin@example.com",
                mobile_number="9999999999",
                hashed_password=hash_password("Admin@12345"),
                role="admin",
            )
            db.add(admin)
            db.flush()
            db.add(Cart(user_id=admin.id))
            print("Created admin user: admin@example.com / Admin@12345")
        else:
            print("Admin user already exists, skipping.")

        if not db.query(Category).filter(Category.slug == "electronics").first():
            category = Category(name="Electronics", slug="electronics")
            db.add(category)
            db.flush()

            sample_products = [
                Product(sku="MAT-1001", name="Wireless Mouse", description="Ergonomic wireless mouse",
                        detailed_description="A comfortable, ergonomic wireless mouse with 2.4GHz connectivity and a 12-month battery life.",
                        price=Decimal("19.99"), stock_quantity=150, is_in_stock=True, category_id=category.id,
                        image_url="https://example.com/images/wireless-mouse.jpg"),
                Product(sku="MAT-1002", name="Mechanical Keyboard", description="RGB mechanical keyboard",
                        detailed_description="A full-size mechanical keyboard with hot-swappable switches and per-key RGB lighting.",
                        price=Decimal("79.99"), stock_quantity=80, is_in_stock=True, category_id=category.id,
                        image_url="https://example.com/images/mechanical-keyboard.jpg"),
                Product(sku="MAT-1003", name="USB-C Hub", description="7-in-1 USB-C hub",
                        detailed_description="7-in-1 USB-C hub with HDMI, 2x USB-A, SD card reader, and 100W pass-through charging.",
                        price=Decimal("34.50"), stock_quantity=0, is_in_stock=False, category_id=category.id,
                        image_url="https://example.com/images/usb-c-hub.jpg"),
            ]
            db.add_all(sample_products)
            print("Created sample category + 3 sample products (one out-of-stock).")
        else:
            print("Sample products already exist, skipping.")

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run()
