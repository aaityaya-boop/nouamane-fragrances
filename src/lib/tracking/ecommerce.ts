export const pushToDataLayer = (event: string, data: any = {}) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  }
};

export const trackPageView = (url: string) => {
  pushToDataLayer('page_view', { page_path: url });
};

export const trackViewItem = (item: any) => {
  pushToDataLayer('view_item', {
    ecommerce: {
      currency: "MAD",
      value: item.price,
      items: [{
        item_id: item.id || item.sku,
        item_name: item.name,
        affiliation: "NAY Parfum",
        price: item.price,
        item_brand: item.brandLabel || item.brand,
        item_category: item.category,
        quantity: 1
      }]
    }
  });
};

export const trackViewItemList = (items: any[], listName: string = "Category List") => {
  pushToDataLayer('view_item_list', {
    ecommerce: {
      item_list_name: listName,
      items: items.map((item, index) => ({
        item_id: item.id || item.sku,
        item_name: item.name,
        affiliation: "NAY Parfum",
        price: item.price,
        item_brand: item.brandLabel || item.brand,
        item_category: item.category,
        index: index + 1
      }))
    }
  });
};

export const trackSearch = (searchTerm: string) => {
  pushToDataLayer('search', { search_term: searchTerm });
};

export const trackAddToCart = (item: any, quantity: number = 1) => {
  pushToDataLayer('add_to_cart', {
    ecommerce: {
      currency: "MAD",
      value: item.price * quantity,
      items: [{
        item_id: item.id || item.sku,
        item_name: item.name,
        affiliation: "NAY Parfum",
        price: item.price,
        item_brand: item.brandLabel || item.brand,
        item_category: item.category,
        quantity: quantity
      }]
    }
  });
};

export const trackRemoveFromCart = (item: any, quantity: number = 1) => {
  pushToDataLayer('remove_from_cart', {
    ecommerce: {
      currency: "MAD",
      value: item.price * quantity,
      items: [{
        item_id: item.id || item.sku,
        item_name: item.name,
        affiliation: "NAY Parfum",
        price: item.price,
        item_brand: item.brandLabel || item.brand,
        item_category: item.category,
        quantity: quantity
      }]
    }
  });
};

export const trackBeginCheckout = (items: any[], totalValue: number) => {
  pushToDataLayer('begin_checkout', {
    ecommerce: {
      currency: "MAD",
      value: totalValue,
      items: items.map(item => ({
        item_id: item.id || item.sku,
        item_name: item.name,
        affiliation: "NAY Parfum",
        price: item.price,
        quantity: item.quantity
      }))
    }
  });
};

export const trackPurchase = (transactionId: string, items: any[], totalValue: number, shipping: number = 0, tax: number = 0) => {
  // Prevent duplicate tracking in localStorage
  const storageKey = `tracked_purchase_${transactionId}`;
  if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
    return; // Already tracked this transaction
  }

  pushToDataLayer('purchase', {
    ecommerce: {
      transaction_id: transactionId,
      affiliation: "NAY Parfum",
      value: totalValue,
      tax: tax,
      shipping: shipping,
      currency: "MAD",
      items: items.map(item => ({
        item_id: item.id || item.sku,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    }
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(storageKey, "true");
  }
};
