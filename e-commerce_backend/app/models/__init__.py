"""
Import every model here so that Base.metadata.create_all() (and Alembic's
autogenerate) discovers all tables, even though routers only import the
specific model module they need.
"""
from app.db.session import Base  # noqa: F401

from app.models.user import User  # noqa: F401
from app.models.address import Address  # noqa: F401
from app.models.payment import CreditCard, PaymentPreference  # noqa: F401
from app.models.product import Product, Category  # noqa: F401
from app.models.wishlist import WishlistItem  # noqa: F401
from app.models.cart import Cart, CartItem  # noqa: F401
from app.models.order import Order, OrderItem, FavouriteOrder  # noqa: F401
