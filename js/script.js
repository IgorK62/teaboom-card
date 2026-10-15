/**
 * «Ананасовый улун» — логика верхней части карточки товара.
 *
 * При переключении фасовки обновляются (по ТЗ):
 *   цена, старая цена, артикул и выбранное состояние плитки.
 * Дополнительно: бейдж скидки, микроданные Schema.org (Offer)
 * и короткий отклик кнопки «В корзину». Vanilla JS, без зависимостей.
 */
(() => {
  'use strict';

  const card = document.querySelector('.product');
  if (!card) return;

  const els = {
    sku: document.getElementById('product-sku'),
    current: document.getElementById('price-current'),
    old: document.getElementById('price-old'),
    oldValue: document.querySelector('#price-old .price__value'),
    discount: document.getElementById('product-discount'),
    priceRow: document.getElementById('product-price'),
    schemaPrice: document.getElementById('schema-price'),
  };

  /**
   * 1432   → «1 432 ₽»
   * 326.4  → «326,40 ₽»
   * Копейки показываются только при их наличии; разделители —
   * неразрывные пробелы, чтобы цена не разрывалась переносом.
   */
  const formatPrice = (value) => {
    const hasCents = Math.round(value * 100) % 100 !== 0;
    const [int, cents] = value.toFixed(hasCents ? 2 : 0).split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    return `${grouped}${cents ? ',' + cents : ''}\u00A0₽`;
  };

  /** Перезапуск CSS-анимации на элементе */
  const replayAnimation = (el, className) => {
    el.classList.remove(className);
    void el.offsetWidth; // принудительный reflow
    el.classList.add(className);
  };

  /** Рендер выбранной фасовки */
  const renderPack = () => {
    const input = card.querySelector('.pack__input:checked');
    if (!input) return;

    const price = parseFloat(input.dataset.price);
    const oldPrice = parseFloat(input.dataset.old);
    const hasDiscount = !Number.isNaN(oldPrice) && oldPrice > price;

    els.current.textContent = formatPrice(price);
    els.sku.textContent = input.value;
    els.schemaPrice.setAttribute('content', String(price)); // микроданные Offer

    els.old.hidden = !hasDiscount;
    els.discount.hidden = !hasDiscount;
    if (hasDiscount) {
      els.oldValue.textContent = formatPrice(oldPrice);
      els.discount.textContent = `−${Math.round((1 - price / oldPrice) * 100)}%`;
    }

    replayAnimation(els.priceRow, 'is-updated');
  };

  card.querySelectorAll('.pack__input').forEach((input) => {
    input.addEventListener('change', renderPack);
  });

  /**
   * «В корзину»: визуальный отклик без реальной корзины —
   * по условию задания подключать её не требуется.
   */
  const cartButton = document.getElementById('add-to-cart');
  const cartLabel = cartButton.querySelector('.button__label');
  const defaultLabel = cartLabel.textContent;
  let addedTimer;

  cartButton.addEventListener('click', () => {
    clearTimeout(addedTimer);
    cartButton.classList.add('button--added');
    cartLabel.textContent = 'Добавлено ✓';
    addedTimer = setTimeout(() => {
      cartButton.classList.remove('button--added');
      cartLabel.textContent = defaultLabel;
    }, 1600);
  });

  renderPack();
})();
