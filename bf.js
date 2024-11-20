const addToCartVoucher = () => {
  document.addEventListener("ShoptetCartAddCartItem", () => {
    const url = new URL(window.location);
    url.searchParams.set("coupon", "narozeniny");

    // Refresh
    window.location.replace(url);
  });
};

// Definujte slevový kód, slevu a kategorii, pro kterou platí
const discountCode = {
  code: "BF25",
  discount: 25, // discount in %
  categories: ["in-komplexni-pece", "Narodeniny", "Narozeniny"], // Změňte na skutečný název kategorie
  categoryExcluded: "poukazy",
};

// Overeni, zda je produkt jiz v kosiku
function isProductInCart(productCode) {
  const cartList = getShoptetDataLayer().cart;

  return cartList && cartList.filter(r => parseInt(r.code) === parseInt(productCode))
}

// PRODUCT DETAIL
// Ověření, zda je produkt v dané kategorii
function isProductInCategory(productCode) {
  const productsList = getShoptetProductsList();
  const pid = Object.keys(productsList).find(
    (key) => productsList[key].base_id === parseInt(productCode)
  );

  return (
    productsList[pid].category_path.some((r) =>
      discountCode.categories.includes(r)
    ) || discountCode.categories.includes(productsList[pid].content_category)
  );
}

// Vypočítá cenu se slevou
function calculateDiscountedPrice(price, discount) {
  return (price * (1 - discount / 100)).toFixed(2);
}

// Vykreslí cenu se slevovým kódem, pokud produkt je ve správné kategorii
function displayDiscountedPriceDetail() {
  if (document.querySelector(".type-detail")) {
    const currencyChar = getShoptetDataLayer().currency === "EUR" ? "€" : " ";
    // if (productPrice && isProductInCategory(getShoptetDataLayer().product.id)) {
    if (
      !getShoptetDataLayer()
        .product.currentCategory.toLowerCase()
        .includes(discountCode.categoryExcluded) &&
      !getShoptetDataLayer()
        .product.defaultCategory.toLowerCase()
        .includes(discountCode.categoryExcluded)
    ) {
      let productPrice;
      if (
        getShoptetDataLayer().product &&
        getShoptetDataLayer().product.priceWithVat
      ) {
        productPrice =
          getShoptetDataLayer().product &&
          getShoptetDataLayer().product.priceWithVat;
      } else if (getShoptetDataLayer().product.hasVariants) {
        const variantElement = document.querySelector(
          ".price-final .price-final-holder:not(.no-display)"
        );

        if (variantElement.querySelector("span.nowrap")) {
          productPrice = parseInt(
            variantElement
              .querySelector("span.nowrap")
              .innerText.replace(currencyChar, "")
          );
        } else {
          productPrice = parseInt(
            variantElement.innerText.replace(currencyChar, "")
          );
        }
      }

      if (
        document.querySelector(
          ".price-final .price-final-holder .calculated-price"
        )
      ) {
        productPrice = parseInt(
          document
            .querySelector(".price-final .price-final-holder .calculated-price")
            .innerText.replace(currencyChar, "")
        );
      }

      if (productPrice) {
        const discountedPrice = calculateDiscountedPrice(
          productPrice,
          discountCode.discount
        );
        const getCurrency = getShoptetDataLayer().currency;
        const currency = getCurrency === "CZK" ? "Kč" : getCurrency;

        const container = document.createElement("div");
        container.classList.add("discounted-price-container");

        const discountInfo = document.createElement("p");
        discountInfo.innerHTML = `Cena s kódem <span class="discount-code">${discountCode.code}</span>: <span class="discount-price">${discountedPrice} ${currency}</span>`;
        container.appendChild(discountInfo);

        // Přidat slevovou cenu pod hlavní cenu produktu
        const priceContainer = document.querySelector(".p-final-price-wrapper");
        if (priceContainer) {
          if (
            getShoptetDataLayer().product.hasVariants ||
            document.querySelector(
              ".price-final .price-final-holder .calculated-price"
            )
          ) {
            if (
              document.querySelector(
                ".p-detail-inner .discounted-price-container"
              )
            ) {
              document.querySelector(
                ".p-detail-inner .discounted-price-container .discount-price"
              ).innerText = `${discountedPrice} ${currency}`;
            } else {
              priceContainer.appendChild(container);
            }
          } else {
            if (
              !document.querySelector(
                ".p-detail-inner .discounted-price-container"
              )
            ) {
              priceContainer.appendChild(container);
            }
          }
        }
        addToCartVoucher();
      }
    }
  }
}

function getProductInfo(id) {
  const productsList = getShoptetProductsList();
  const pid = Object.keys(productsList).find(
    (key) => productsList[key].base_id === parseInt(id)
  );
  return pid;
}

// Homepage
function homepageDiscountProducts() {
  if (
    document.querySelector(".in-index") ||
    document.querySelector(".type-category") ||
    document.querySelector(".in-vyhledavani")
  ) {
    if (
      document.querySelector(".products") &&
      document.querySelectorAll(".product")
    ) {
      document.querySelectorAll(".products").forEach((products) => {
        products.querySelectorAll(".product").forEach((product) => {
          const productGuid = product.getAttribute("data-micro-product-id");

          const productId = getProductInfo(productGuid);

          const productDetail = getShoptetProductsList()[parseInt(productId)];
          if (!product.querySelector(".discounted-price-container")) {
            if (
              productDetail && !productDetail.category_path.some((r) =>
                r.toLowerCase().includes(discountCode.categoryExcluded)
              )
            ) {
              if (
                productDetail.content_category && !productDetail.content_category
                  .toLowerCase()
                  .includes(discountCode.categoryExcluded)
              ) {
                
                const productInCart = isProductInCart(productDetail.base_id)[0];
                let discountedPrice;
                if (productInCart && productInCart.priceWithVat) {
                  discountedPrice = calculateDiscountedPrice(productInCart.priceWithVat, discountCode.discount);
                } else {
                  discountedPrice = calculateDiscountedPrice(
                    productDetail.value,
                    discountCode.discount
                  );
                }
                
                const getCurrency = getShoptetDataLayer().currency;
                const currency = getCurrency === "CZK" ? "Kč" : getCurrency;

                const container = document.createElement("div");
                container.classList.add("discounted-price-container");

                const discountInfo = document.createElement("p");
                discountInfo.innerHTML = `Cena s kódem <span class="discount-code">${discountCode.code}</span>: <span class="discount-price">${discountedPrice} ${currency}</span>`;
                container.appendChild(discountInfo);

                // Přidat slevovou cenu pod hlavní cenu produktu
                const priceContainer = product.querySelector(".inner");
                if (priceContainer) {
                  priceContainer.appendChild(container);
                }
                addToCartVoucher();
              }
            }
          }
        });
      });
    }
  }
}

// Automaticky použije slevový kód po přidání do košíku
function applyDiscountCodeInCart() {
  const cartDiscountInput = document.querySelector("#discountCouponCode"); // Přizpůsobte dle šablony
  const applyButton = document
    .querySelector(".discount-coupon")
    .querySelector("button[type='submit']"); // Přizpůsobte dle šablony
  if (cartDiscountInput && applyButton) {
    cartDiscountInput.value = discountCode.code;
    applyButton.click();
  }
}

// Spuštění skriptu po načtení stránky
document.addEventListener("DOMContentLoaded", () => {
  if (
    getShoptetDataLayer().customer &&
    getShoptetDataLayer().customer.priceListId != 3
  ) {
    displayDiscountedPriceDetail();
    // homepageDiscountProducts();
  }
});

document.addEventListener(
  "shoptet.stockAvailabilities.attachEventListeners",
  () => {
    if (
      getShoptetDataLayer().customer &&
      getShoptetDataLayer().customer.priceListId != 3
    ) {
      homepageDiscountProducts();
    }
  }
);

document.addEventListener("ShoptetSplitVariantParameterChange", () => {
  if (
    getShoptetDataLayer().customer &&
    getShoptetDataLayer().customer.priceListId != 3
  ) {
    displayDiscountedPriceDetail();
  }
});

document.addEventListener("shoptet.quantityDiscounts.onVariantChange", () => {
  if (
    getShoptetDataLayer().customer &&
    getShoptetDataLayer().customer.priceListId != 3
  ) {
    displayDiscountedPriceDetail();
  }
});

document.addEventListener("ShoptetSurchargesPriceUpdated", () => {
  if (
    getShoptetDataLayer().customer &&
    getShoptetDataLayer().customer.priceListId != 3
  ) {
    displayDiscountedPriceDetail();
  }
});
