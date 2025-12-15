// ================================
// FRONTEND API INTEGRATION (Vanilla JS)
// Compatible with your Inventory Backend API
// ================================

const API_BASE = 'http://localhost:5000/api';

// ================================
// GENERIC FETCH HELPER
// ================================
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'API Error');
    }

    return data;
  } catch (error) {
    alert(error.message);
    throw error;
  }
}

// ================================
// PRODUCTS
// ================================
async function loadProducts() {
  const res = await apiRequest('/products');
  const tbody = document.querySelector('#productsTable tbody');
  tbody.innerHTML = '';

  res.data.forEach(product => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${product.sku}</td>
      <td>${product.name}</td>
      <td>₱${product.price}</td>
      <td>${product.stock}</td>
      <td>${product.category}</td>
      <td>
        <button onclick="editProduct('${product._id}')">Edit</button>
        <button onclick="deleteProduct('${product._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function createProduct(e) {
  e.preventDefault();

  const product = {
    sku: sku.value,
    name: name.value,
    price: Number(price.value),
    stock: Number(stock.value),
    category: category.value,
    description: description.value,
  };

  await apiRequest('/products', 'POST', product);
  e.target.reset();
  loadProducts();
}

async function editProduct(id) {
  const res = await apiRequest(`/products/${id}`);
  const p = res.data;

  sku.value = p.sku;
  name.value = p.name;
  price.value = p.price;
  stock.value = p.stock;
  category.value = p.category;
  description.value = p.description;

  productForm.onsubmit = async (e) => {
    e.preventDefault();
    await apiRequest(`/products/${id}`, 'PUT', {
      sku: sku.value,
      name: name.value,
      price: Number(price.value),
      stock: Number(stock.value),
      category: category.value,
      description: description.value,
    });
    productForm.reset();
    productForm.onsubmit = createProduct;
    loadProducts();
  };
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await apiRequest(`/products/${id}`, 'DELETE');
  loadProducts();
}

// ================================
// SUPPLIERS
// ================================
async function loadSuppliers() {
  const res = await apiRequest('/suppliers');
  const tbody = document.querySelector('#suppliersTable tbody');
  tbody.innerHTML = '';

  res.data.forEach(supplier => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${supplier.name}</td>
      <td>${supplier.contact}</td>
      <td>${supplier.email || ''}</td>
      <td>
        <button onclick="deleteSupplier('${supplier._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function createSupplier(e) {
  e.preventDefault();

  const supplier = {
    name: sName.value,
    contact: sContact.value,
    email: sEmail.value,
    phone: sPhone.value,
    address: sAddress.value,
  };

  await apiRequest('/suppliers', 'POST', supplier);
  e.target.reset();
  loadSuppliers();
}

async function deleteSupplier(id) {
  if (!confirm('Delete supplier?')) return;
  await apiRequest(`/suppliers/${id}`, 'DELETE');
  loadSuppliers();
}

// ================================
// ORDERS
// ================================
async function loadOrders() {
  const res = await apiRequest('/orders');
  const tbody = document.querySelector('#ordersTable tbody');
  tbody.innerHTML = '';

  res.data.forEach(order => {
    const items = order.items.map(i => `${i.productId.name} x${i.quantity}`).join(', ');

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${order._id.slice(-6)}</td>
      <td>${order.supplierId.name}</td>
      <td>${items}</td>
      <td>${order.status}</td>
      <td>₱${order.totalAmount}</td>
      <td>
        <button onclick="deleteOrder('${order._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function createOrder(e) {
  e.preventDefault();

  const items = [];
  document.querySelectorAll('.order-item').forEach(row => {
    items.push({
      productId: row.querySelector('.product').value,
      quantity: Number(row.querySelector('.quantity').value),
    });
  });

  await apiRequest('/orders', 'POST', {
    supplierId: orderSupplier.value,
    items,
    notes: orderNotes.value,
  });

  e.target.reset();
  loadOrders();
}

async function deleteOrder(id) {
  if (!confirm('Delete order?')) return;
  await apiRequest(`/orders/${id}`, 'DELETE');
  loadOrders();
}

// ================================
// INIT
// ================================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadSuppliers();
  loadOrders();

  productForm.onsubmit = createProduct;
  supplierForm.onsubmit = createSupplier;
  orderForm.onsubmit = createOrder;
});