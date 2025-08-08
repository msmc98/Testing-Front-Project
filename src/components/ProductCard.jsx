import React, { useMemo, useState } from "react";

const ProductCard = ({
  id,
  name,
  image,
  price,
  variants = [],              // [{ id, name, priceDiff, inStock }, ...]  (según “test data”)
  inStock = true,             // o stock > 0
  onAddToCart,                // (productWithVariant) => void
}) => {
  const hasVariants = variants && variants.length > 0;

  // Variante seleccionada por defecto: la primera disponible o null
  const firstAvailable = useMemo(
    () => (hasVariants ? variants.find(v => v.inStock !== false) || variants[0] : null),
    [variants, hasVariants]
  );
  const [selectedVariantId, setSelectedVariantId] = useState(firstAvailable?.id || null);

  const selectedVariant = useMemo(
    () => (hasVariants ? variants.find(v => v.id === selectedVariantId) : null),
    [hasVariants, variants, selectedVariantId]
  );

  // Precio mostrado (precio base + posible diferencia de la variante)
  const displayPrice = useMemo(() => {
    const diff = selectedVariant?.priceDiff || 0;
    return Number(price) + Number(diff);
  }, [price, selectedVariant]);

  const available =
    inStock !== false &&
    (hasVariants ? !!selectedVariant && selectedVariant.inStock !== false : true);

  const handleAdd = () => {
    if (!available) return;
    const payload = {
      id,
      name,
      image,
      price: displayPrice,
      basePrice: price,
      selectedVariant: hasVariants
        ? { id: selectedVariant.id, name: selectedVariant.name, priceDiff: selectedVariant.priceDiff || 0 }
        : null,
      qty: 1,
    };
    onAddToCart?.(payload);
  };

  return (
    <div className="card h-100 shadow-sm border-0">
      <img src={image} alt={name} className="card-img-top p-3" style={{ objectFit: "contain", height: 260 }} />

      <div className="card-body d-flex flex-column">
        <h6 className="card-title mb-2 text-truncate" title={name}>{name}</h6>

        {hasVariants ? (
          <div className="mb-2">
            <label className="form-label d-block mb-1">Options</label>
            <select
              className="form-select form-select-sm"
              value={selectedVariantId || ""}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            >
              {variants.map(v => (
                <option key={v.id} value={v.id} disabled={v.inStock === false}>
                  {v.name}{v.priceDiff ? ` (+${v.priceDiff.toFixed?.(2) ?? v.priceDiff})` : ""} {v.inStock === false ? " — Out of stock" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="badge bg-light text-dark align-self-start mb-2">One size</span>
        )}

        <div className="mt-auto d-flex align-items-center justify-content-between">
          <div className="fw-bold fs-6">${displayPrice?.toFixed ? displayPrice.toFixed(2) : displayPrice}</div>

          <button
            type="button"
            className={`btn btn-sm ${available ? "btn-dark" : "btn-secondary"}`}
            disabled={!available}
            onClick={handleAdd}
            aria-disabled={!available}
          >
            {available ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
