from sqlalchemy import Column, Integer, String, Numeric, Boolean, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(64), unique=True, nullable=False, index=True)  # maps to SAP Material Number
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    detailed_description = Column(Text, nullable=True)  # shown on PDP
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500), nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)

    stock_quantity = Column(Integer, default=0, nullable=False)
    # Driven by SAP OData stock feed — when False, "Add to Cart" is disabled on PLP/PDP
    is_in_stock = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)  # admin can soft-disable a product

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    category = relationship("Category", back_populates="products")
