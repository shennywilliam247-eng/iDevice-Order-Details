import { createEdgeSpark } from "./edgespark-client.js";

// Initialize Client
const client = createEdgeSpark({
  baseUrl: "https://staging--lujlgtmiqfc8uzc6ury0.youbase.cloud"
});

// State
let devicesCache = [];
let ordersCache = [];
let usersCache = [];
let assetsCache = [];

// ============================================
// Auth & Initialization
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
});

async function checkAuth() {
  const authContainer = document.getElementById('authContainer');
  const adminPanel = document.getElementById('adminPanel');
  
  try {
    const session = await client.auth.getSession();
    
    if (session.data?.user) {
      // User is logged in
      
      // Sync user to DB and check role
      const res = await client.api.fetch('/api/users/sync', { method: 'POST' });
      const data = await res.json();
      
      if (data.user?.role !== 'admin') {
        // Not admin
        authContainer.innerHTML = `
          <div class="auth-container" style="text-align: center;">
            <h2 style="color: #dc2626; margin-bottom: 16px;">Access Denied</h2>
            <p style="margin-bottom: 24px;">You do not have permission to access the admin panel.</p>
            <button onclick="handleLogout()" class="btn btn-primary">Sign Out</button>
            <br><br>
            <a href="/" class="btn btn-secondary">Go Home</a>
          </div>
        `;
        authContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        return;
      }

      authContainer.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      
      await initAdmin();
    } else {
      // Show login
      authContainer.classList.remove('hidden');
      adminPanel.classList.add('hidden');
      await client.auth.renderAuthUI(authContainer, {
        redirectTo: window.location.href
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    authContainer.innerHTML = '<div class="alert alert-error">Authentication error. Please refresh the page.</div>';
  }
}

async function initAdmin() {
  await Promise.all([
    loadDevicesForAdmin(),
    loadOrders(),
    loadUsers(),
    loadAssets()
  ]);
  updateDashboard();
}

// ============================================
// Logout
// ============================================
window.handleLogout = async function() {
  try {
    await client.auth.signOut();
    window.location.reload();
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============================================
// Section Navigation
// ============================================
window.showSection = function(section) {
  // Hide all sections
  document.querySelectorAll('[id$="Section"]').forEach(el => el.classList.add('hidden'));
  
  // Show target section
  const targetSection = document.getElementById(`${section}Section`);
  if (targetSection) targetSection.classList.remove('hidden');
  
  // Update nav links
  document.querySelectorAll('.admin-nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === section);
  });
}

window.toggleAdminSidebar = function() {
  document.getElementById('adminSidebar').classList.toggle('mobile-open');
}

// ============================================
// Devices Management
// ============================================
async function loadDevicesForAdmin() {
  try {
    const res = await client.api.fetch('/api/devices');
    const data = await res.json();
    devicesCache = data.data || [];
    
    renderDevicesTable();
    populateDeviceSelect();
  } catch (error) {
    console.error('Failed to load devices:', error);
  }
}

function renderDevicesTable() {
  const tbody = document.getElementById('devicesTableBody');
  
  if (!devicesCache.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No devices found</td></tr>';
    return;
  }
  
  tbody.innerHTML = devicesCache.map(device => `
    <tr>
      <td>${device.model}</td>
      <td>${device.name}</td>
      <td>${device.color}</td>
      <td>${device.storage}</td>
      <td>${device.price}</td>
      <td>
        <button class="btn-icon" onclick="editDevice(${device.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function populateDeviceSelect() {
  const select = document.getElementById('orderDevice');
  if (!select) return;
  
  select.innerHTML = devicesCache.map(device => 
    `<option value="${device.id}">${device.name}</option>`
  ).join('');
}

window.showDeviceModal = function(id = null) {
  document.getElementById('deviceModalTitle').textContent = id ? 'Edit Device' : 'Add Device';
  document.getElementById('deviceId').value = id || '';
  
  if (id) {
    const device = devicesCache.find(d => d.id === id);
    if (device) {
      document.getElementById('deviceModel').value = device.model;
      document.getElementById('deviceName').value = device.name;
      document.getElementById('deviceDescription').value = device.description;
      document.getElementById('deviceColor').value = device.color;
      document.getElementById('deviceStorage').value = device.storage;
      document.getElementById('devicePrice').value = device.price;
      document.getElementById('deviceImageUrl').value = device.imageUrl || '';
    }
  } else {
    document.getElementById('deviceForm').reset();
    document.getElementById('deviceColor').value = 'On admin activation';
    document.getElementById('deviceStorage').value = 'On admin activation';
    document.getElementById('devicePrice').value = 'Sponsored';
  }
  
  openModal('deviceModal');
}

window.editDevice = function(id) {
  showDeviceModal(id);
}

window.saveDevice = async function() {
  const id = document.getElementById('deviceId').value;
  const data = {
    model: document.getElementById('deviceModel').value,
    name: document.getElementById('deviceName').value,
    description: document.getElementById('deviceDescription').value,
    color: document.getElementById('deviceColor').value,
    storage: document.getElementById('deviceStorage').value,
    price: document.getElementById('devicePrice').value,
    imageUrl: document.getElementById('deviceImageUrl').value
  };
  
  try {
    const url = id ? `/api/devices/${id}` : '/api/devices';
    const method = id ? 'PUT' : 'POST';
    
    const res = await client.api.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error('Failed to save device');
    
    closeModal('deviceModal');
    await loadDevicesForAdmin();
  } catch (error) {
    console.error('Save device error:', error);
    alert('Failed to save device');
  }
}

// ============================================
// Orders Management
// ============================================
async function loadOrders() {
  try {
    const res = await client.api.fetch('/api/orders');
    const data = await res.json();
    ordersCache = data.data || [];
    
    renderOrdersTable();
    updateDashboard();
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('ordersTableBody');
  
  if (!ordersCache.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>';
    return;
  }
  
  tbody.innerHTML = ordersCache.map(order => {
    const device = devicesCache.find(d => d.id === order.deviceId);
    return `
      <tr>
        <td><strong>${order.orderNumber}</strong></td>
        <td>${order.customerName}</td>
        <td>${device ? device.name : 'Unknown'}</td>
        <td><span class="tracking-status status-${order.status}">${order.status}</span></td>
        <td>${formatDate(order.createdAt)}</td>
        <td>
          <button class="btn-icon" onclick="editOrder(${order.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon" onclick="showEventModal(${order.id})" title="Add Event">
            <i class="fas fa-plus-circle"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateDashboard() {
  document.getElementById('totalOrders').textContent = ordersCache.length;
  document.getElementById('pendingOrders').textContent = ordersCache.filter(o => o.status === 'pending').length;
  document.getElementById('shippedOrders').textContent = ordersCache.filter(o => o.status === 'shipped').length;
  document.getElementById('deliveredOrders').textContent = ordersCache.filter(o => o.status === 'delivered').length;
}

window.showOrderModal = function(id = null) {
  document.getElementById('orderModalTitle').textContent = id ? 'Edit Order' : 'New Order';
  document.getElementById('orderId').value = id || '';
  
  if (id) {
    const order = ordersCache.find(o => o.id === id);
    if (order) {
      document.getElementById('orderDevice').value = order.deviceId;
      document.getElementById('orderCustomerName').value = order.customerName;
      document.getElementById('orderCustomerEmail').value = order.customerEmail || '';
      document.getElementById('orderCustomerPhone').value = order.customerPhone || '';
      document.getElementById('orderShippingAddress').value = order.shippingAddress;
      document.getElementById('orderColor').value = order.color || '';
      document.getElementById('orderStorage').value = order.storage || '';
      document.getElementById('orderTrackingNumber').value = order.trackingNumber || '';
      document.getElementById('orderStatus').value = order.status;
      document.getElementById('orderNotes').value = order.notes || '';
      
      // New Fields
      document.getElementById('orderNumber').value = order.orderNumber || '';
      document.getElementById('orderWaybill').value = order.waybill || '';
      document.getElementById('orderPackageDimensions').value = order.packageDimensions || '';
      document.getElementById('orderSenderInfo').value = order.senderInfo || '';
      document.getElementById('orderReceiverInfo').value = order.receiverInfo || '';
    }
  } else {
    document.getElementById('orderForm').reset();
  }
  
  openModal('orderModal');
}

window.editOrder = function(id) {
  showOrderModal(id);
}

window.saveOrder = async function() {
  const id = document.getElementById('orderId').value;
  const deviceIdVal = document.getElementById('orderDevice').value;
  const deviceId = deviceIdVal ? parseInt(deviceIdVal) : null;
  
  if (!deviceId) {
    alert('Please select a device');
    return;
  }

  const data = {
    deviceId: deviceId,
    customerName: document.getElementById('orderCustomerName').value,
    customerEmail: document.getElementById('orderCustomerEmail').value,
    customerPhone: document.getElementById('orderCustomerPhone').value,
    shippingAddress: document.getElementById('orderShippingAddress').value,
    color: document.getElementById('orderColor').value,
    storage: document.getElementById('orderStorage').value,
    trackingNumber: document.getElementById('orderTrackingNumber').value,
    status: document.getElementById('orderStatus').value,
    notes: document.getElementById('orderNotes').value,
    
    // New Fields
    orderNumber: document.getElementById('orderNumber').value,
    waybill: document.getElementById('orderWaybill').value,
    packageDimensions: document.getElementById('orderPackageDimensions').value,
    senderInfo: document.getElementById('orderSenderInfo').value,
    receiverInfo: document.getElementById('orderReceiverInfo').value
  };
  
  try {
    const url = id ? `/api/orders/${id}` : '/api/orders';
    const method = id ? 'PUT' : 'POST';
    
    const res = await client.api.fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error('Failed to save order');
    
    closeModal('orderModal');
    await loadOrders();
  } catch (error) {
    console.error('Save order error:', error);
    alert('Failed to save order');
  }
}

// ============================================
// Tracking Events
// ============================================
window.showEventModal = function(orderId) {
  document.getElementById('eventOrderId').value = orderId;
  document.getElementById('eventForm').reset();
  document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
  openModal('eventModal');
}

window.saveEvent = async function() {
  const orderId = document.getElementById('eventOrderId').value;
  const data = {
    date: document.getElementById('eventDate').value,
    location: document.getElementById('eventLocation').value,
    description: document.getElementById('eventDescription').value,
    updateStatus: document.getElementById('eventUpdateStatus').value || null
  };
  
  try {
    const res = await client.api.fetch(`/api/orders/${orderId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error('Failed to add event');
    
    closeModal('eventModal');
    await loadOrders();
    alert('Tracking event added successfully');
  } catch (error) {
    console.error('Save event error:', error);
    alert('Failed to add event');
  }
}

// ============================================
// User Management
// ============================================
async function loadUsers() {
  try {
    const res = await client.api.fetch('/api/users');
    const data = await res.json();
    usersCache = data.data || [];
    renderUsersTable();
  } catch (error) {
    console.error('Failed to load users:', error);
  }
}

function renderUsersTable() {
  const tbody = document.getElementById('usersTableBody');
  if (!usersCache.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No users found</td></tr>';
    return;
  }
  
  tbody.innerHTML = usersCache.map(user => `
    <tr>
      <td>${user.name || 'N/A'}</td>
      <td>${user.email}</td>
      <td>
        <select onchange="updateRole(${user.id}, this.value)" class="form-select" style="width: auto; padding: 4px 8px;">
          <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
          <option value="database_admin" ${user.role === 'database_admin' ? 'selected' : ''}>Database Admin</option>
        </select>
      </td>
      <td>
        <button class="btn-sm btn-primary" onclick="showLinkOrderModal(${user.id})">Link Order</button>
      </td>
    </tr>
  `).join('');
}

window.updateRole = async function(id, role) {
  try {
    await client.api.fetch(`/api/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    // alert('Role updated');
  } catch (error) {
    console.error('Update role error:', error);
    alert('Failed to update role');
  }
}

window.showLinkOrderModal = function(userId) {
  document.getElementById('linkUserId').value = userId;
  document.getElementById('linkOrderForm').reset();
  openModal('linkOrderModal');
}

window.saveLinkOrder = async function() {
  const userId = document.getElementById('linkUserId').value;
  const orderIdentifier = document.getElementById('linkOrderIdentifier').value;
  
  try {
    const res = await client.api.fetch('/api/users/link-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, orderIdentifier })
    });
    
    if (!res.ok) throw new Error('Failed to link order');
    
    closeModal('linkOrderModal');
    alert('Order linked successfully');
  } catch (error) {
    console.error('Link order error:', error);
    alert('Failed to link order. Check if order exists.');
  }
}

// ============================================
// Asset Management
// ============================================
async function loadAssets() {
  try {
    const res = await client.api.fetch('/api/assets');
    const data = await res.json();
    assetsCache = data.data || [];
    renderAssetsGrid();
  } catch (error) {
    console.error('Failed to load assets:', error);
  }
}

function renderAssetsGrid() {
  const grid = document.getElementById('assetsGrid');
  if (!assetsCache.length) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No assets uploaded</div>';
    return;
  }
  
  grid.innerHTML = assetsCache.map(asset => `
    <div class="device-card" style="padding: 10px; position: relative;">
      <div style="height: 100px; display: flex; align-items: center; justify-content: center; background: #f5f5f7; border-radius: 8px; margin-bottom: 10px; overflow: hidden;">
        ${asset.mimeType?.startsWith('image/') 
          ? `<img src="${asset.downloadUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`
          : `<i class="fas fa-file" style="font-size: 32px; color: var(--text-secondary);"></i>`
        }
      </div>
      <div style="font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${asset.filename}</div>
      <div style="font-size: 10px; color: var(--text-secondary);">${formatBytes(asset.size)}</div>
      <div style="margin-top: 8px; display: flex; gap: 5px;">
        <button class="btn-sm" onclick="copyToClipboard('${asset.downloadUrl}')" title="Copy URL" style="flex: 1;"><i class="fas fa-link"></i></button>
        <button class="btn-sm" onclick="deleteAsset(${asset.id})" title="Delete" style="flex: 1; color: #d32f2f;"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

window.handleFileUpload = async function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    // Show loading
    const btn = event.target.parentElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    const res = await client.api.fetch('/api/assets/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    
    await loadAssets();
    btn.innerHTML = originalText;
  } catch (error) {
    console.error('Upload error:', error);
    alert('Failed to upload file');
    event.target.parentElement.innerHTML = '<i class="fas fa-upload"></i> Upload File <input type="file" id="fileInput" style="display: none;" onchange="handleFileUpload(event)">';
  }
}

window.deleteAsset = async function(id) {
  if (!confirm('Are you sure you want to delete this asset?')) return;
  
  try {
    await client.api.fetch(`/api/assets/${id}`, { method: 'DELETE' });
    await loadAssets();
  } catch (error) {
    console.error('Delete asset error:', error);
    alert('Failed to delete asset');
  }
}

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('URL copied to clipboard');
  });
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// ============================================
// Modal Helpers
// ============================================
window.openModal = function(id) {
  document.getElementById(id).classList.add('active');
}

window.closeModal = function(id) {
  document.getElementById(id).classList.remove('active');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('active');
    }
  });
});

// ============================================
// Utilities
// ============================================
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
