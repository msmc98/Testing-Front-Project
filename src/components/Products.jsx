import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ProductCard from "./ProductCard";
import { addCart } from "../redux/action"; // Ajusta la ruta si tu action está en otro sitio

const Products = () => {
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);

  // Este patrón es típico del proyecto original (evita setState tras unmount)
  const componentMounted = useRef(true);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        // ⚠️ Si tu proyecto ya trae los productos desde su propia API,
        // sustituye esta URL por la fuente real.
        const response = await fetch("https://fakestoreapi.com/products");
        const json = await response.json();
        if (componentMounted.current) {
          setData(json);
          setFilter(json);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (componentMounted.current) {
          setLoading(false);
        }
      }
    };

    getProducts();
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Adaptador para normalizar el “test data” al ProductCard
  const adaptToCardProps = (p) => {
    // Modifica aquí si tu API real trae otros nombres de campos
    // p.name / p.title, p.images[0] / p.image, p.price, p.variants, p.inStock/stock
    const name = p.title || p.name || "Product";
    const image = p.image || (Array.isArray(p.images) ? p.images[0] : undefined);
    const basePrice = Number(p.price) || 0;

    // Si tu test data trae variantes, respétalas. Si no, array vacío.
    const variants =
      Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants.map((v, idx) => ({
            id: v.id ?? String(idx),
            name: v.name ?? v.label ?? `Option ${idx + 1}`,
            priceDiff:
              typeof v.priceDiff === "number"
                ? v.priceDiff
                : typeof v.diff === "number"
                ? v.diff
                : 0,
            inStock:
              typeof v.inStock === "boolean"
                ? v.inStock
                : typeof v.stock === "number"
                ? v.stock > 0
                : true,
          }))
        : [];

    const inStock =
      typeof p.inStock === "boolean"
        ? p.inStock
        : typeof p.stock === "number"
        ? p.stock > 0
        : true;

    return {
      id: p.id,
      name,
      image,
      price: basePrice,
      variants,
      inStock,
    };
  };

  const handleAddToCart = (productPayload) => {
    // productPayload ya incluye variante seleccionada (si existe)
    dispatch(addCart(productPayload));
  };

  const Loading = () => {
    // Skeletons simples (Bootstrap)
    return (
      <>
        {[...Array(8)].map((_, i) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={`skeleton-${i}`}>
            <div className="card h-100 shadow-sm border-0">
              <div className="placeholder-glow" style={{ height: 260 }}>
                <span className="placeholder col-12" style={{ height: 260, display: "block" }} />
              </div>
              <div className="card-body">
                <h6 className="card-title placeholder-glow">
                  <span className="placeholder col-8" />
                </h6>
                <div className="mb-2 placeholder-glow">
                  <span className="placeholder col-6" />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="placeholder col-3" />
                  <span className="btn btn-sm btn-dark disabled placeholder col-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };

  const ShowProducts = () => {
    return (
      <>
        {filter.map((p) => {
          const cardProps = adaptToCardProps(p);
          return (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4" key={p.id}>
              <ProductCard {...cardProps} onAddToCart={handleAddToCart} />
            </div>
          );
        })}
      </>
    );
  };

  // Filtros de ejemplo; ajusta categorías si usas otras
  const filterProduct = (cat) => {
    if (cat === "ALL") {
      setFilter(data);
    } else {
      const updated = data.filter((x) => (x.category || "").toLowerCase() === cat.toLowerCase());
      setFilter(updated);
    }
  };

  return (
    <div className="container my-5">
      <div className="row mb-4">
        <div className="col-12 d-flex flex-wrap gap-2">
          <button className="btn btn-outline-dark btn-sm" onClick={() => filterProduct("ALL")}>
            All
          </button>
          <button className="btn btn-outline-dark btn-sm" onClick={() => filterProduct("men's clothing")}>
            Men's Clothing
          </button>
          <button className="btn btn-outline-dark btn-sm" onClick={() => filterProduct("women's clothing")}>
            Women's Clothing
          </button>
          <button className="btn btn-outline-dark btn-sm" onClick={() => filterProduct("jewelery")}>
            Jewelery
          </button>
          <button className="btn btn-outline-dark btn-sm" onClick={() => filterProduct("electronics")}>
            Electronics
          </button>
        </div>
      </div>

      <div className="row">
        {loading ? <Loading /> : <ShowProducts />}
      </div>
    </div>
  );
};

export default Products;
