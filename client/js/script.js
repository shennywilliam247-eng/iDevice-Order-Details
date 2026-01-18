import { createEdgeSpark } from "./edgespark-client.js";

// Initialize Client
const client = createEdgeSpark({
  baseUrl: ""
});

// Language Dictionary
const translations = {
  en: {
    nav_language: "Language",
    nav_support: "Support",
    nav_admin: "Admin",
    nav_order: "Your Order",
    hero_eyebrow: "Education Store",
    hero_title: "Education Pricing & Student Discounts.",
    hero_desc: "Save on Mac and iPad for your studies. Plus get AppleCare+ at a discount. Available for current and newly accepted university students and their parents, as well as faculty, staff, and homeschool teachers of all grade levels.",
    track_title: "Track your order.",
    track_desc: "Check order status, track package delivery, or view your order history.",
    track_link: "Go to your order",
    shop_title: "Shop for University.",
    footer_tax: "Prices are inclusive of tax where applicable. *Quantity limits apply. Visit the Sales & Refund Policy for full terms and conditions.",
    footer_copy: "© 2025 Shiraz Apple Store. All rights reserved. Shah Alam, Selangor.",
    signin_title: "Sign in to track.",
    signin_desc: "View your order details, status, and delivery timeline.",
    signin_btn: "Sign In",
    profile_title: "My Profile",
    profile_fav: "Favourites",
    profile_orders: "Orders",
    profile_account: "Account",
    profile_signin: "Sign in"
  },
  ms: {
    nav_language: "Bahasa",
    nav_support: "Sokongan",
    nav_admin: "Admin",
    nav_order: "Pesanan Anda",
    hero_eyebrow: "Kedai Pendidikan",
    hero_title: "Harga Pendidikan & Diskaun Pelajar.",
    hero_desc: "Jimat pada Mac dan iPad untuk pengajian anda. Serta dapatkan AppleCare+ dengan diskaun. Tersedia untuk pelajar universiti semasa dan yang baru diterima serta ibu bapa mereka, juga fakulti, kakitangan, dan guru homeschool semua peringkat.",
    track_title: "Jejak pesanan anda.",
    track_desc: "Semak status pesanan, jejak penghantaran pakej, atau lihat sejarah pesanan anda.",
    track_link: "Pergi ke pesanan anda",
    shop_title: "Beli untuk Universiti.",
    footer_tax: "Harga termasuk cukai jika berkenaan. *Had kuantiti dikenakan. Lawati Polisi Jualan & Bayaran Balik untuk terma dan syarat penuh.",
    footer_copy: "© 2025 Shiraz Apple Store. Hak cipta terpelihara. Shah Alam, Selangor.",
    signin_title: "Log masuk untuk menjejak.",
    signin_desc: "Lihat butiran pesanan, status, dan garis masa penghantaran anda.",
    signin_btn: "Log Masuk",
    profile_title: "Profil Saya",
    profile_fav: "Kegemaran",
    profile_orders: "Pesanan",
    profile_account: "Akaun",
    profile_signin: "Log masuk"
  }
};

let currentLang = 'en';

// ============================================
// Page Initialization
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  const path = window.location.pathname;
  const isTracking = path.includes('/tracking');
  const isAdmin = path.includes('/admin');
  const isHome = !isTracking && !isAdmin;
  
  // Initialize Language
  const savedLang = localStorage.getItem('shiraz_lang') || 'en';
  changeLanguage(savedLang);

  // Mobile Menu Listener (Robustness)
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.toggleMobileMenu();
    });
  }

  if (isHome) {
    await loadDevices();
  } else if (isTracking) {
    initTrackingPage();
  }
});

// ============================================
// Language Handling
// ============================================
window.changeLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem('shiraz_lang', lang);
  
  const elements = document.querySelectorAll('[data-lang-key]');
  elements.forEach(el => {
    const key = el.getAttribute('data-lang-key');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update dropdown text if exists
  const langBtn = document.getElementById('langBtn');
  if (langBtn) {
    langBtn.textContent = lang === 'en' ? 'English' : 'Bahasa Melayu';
  }
}

window.toggleLangMenu = function() {
  document.getElementById('langMenu').classList.toggle('show');
}

window.toggleMobileMenu = function() {
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.classList.toggle('mobile-open');
    console.log('Mobile menu toggled:', nav.classList.contains('mobile-open'));
  }
}

// Close dropdown when clicking outside
window.onclick = function(event) {
  if (!event.target.matches('.lang-btn')) {
    const dropdowns = document.getElementsByClassName("lang-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// ============================================
// Devices - Landing Page
// ============================================
async function loadDevices() {
  const grid = document.getElementById('devicesGrid');
  const loading = document.getElementById('devicesLoading');
  
  if (!grid) return;

  try {
    const res = await client.api.fetch('/api/public/devices');
    const data = await res.json();
    
    if (loading) loading.remove();
    
    if (!data.data || data.data.length === 0) {
      grid.innerHTML = `
        <div style="text-align: center; width: 100%; grid-column: 1/-1; padding: 40px; color: var(--text-secondary);">
          <i class="fas fa-mobile-alt" style="font-size: 24px; margin-bottom: 10px;"></i>
          <p>No devices available</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = data.data.map((device, index) => `
      <div class="device-card animate-fade-up" style="animation-delay: ${index * 0.1}s">
        <div class="device-image">
          ${device.imageUrl 
            ? `<img src="${device.imageUrl}" alt="${device.name}">`
            : `<i class="fas fa-mobile-alt" style="font-size: 48px; color: var(--text-secondary);"></i>`
          }
        </div>
        <div class="device-content" style="width: 100%;">
          <div class="device-model">Device Model</div>
          <h3 class="device-name">${device.name}</h3>
          <p class="device-description">${device.description}</p>
          <div style="margin-top: 16px;">
            <span class="spec-tag">Color: ${device.color}</span>
            <span class="spec-tag">Storage: ${device.storage}</span>
            ${device.price ? `<span class="spec-tag">Price: ${device.price}</span>` : ''}
            <span class="spec-tag">Qty: ${device.quantity || '1'}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load devices:', error);
    if (loading) loading.remove();
    grid.innerHTML = `
      <div style="text-align: center; width: 100%; grid-column: 1/-1; padding: 40px; color: var(--text-secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 24px; margin-bottom: 10px;"></i>
        <p>Failed to load devices</p>
      </div>
    `;
  }
}

// ============================================
// Tracking Page
// ============================================
function initTrackingPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackNum = urlParams.get('track');
  
  if (trackNum) {
    const input = document.getElementById('trackingInput');
    if (input) input.value = trackNum;
  }
}

let trackingInterval;

window.trackOrder = async function(email, number) {
  const signInSection = document.getElementById('signInSection');
  const trackingSection = document.getElementById('trackingSection');
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const resultsState = document.getElementById('resultsState');
  const btn = document.getElementById('trackBtn');
  
  // Show loading UI
  signInSection.classList.add('hidden');
  trackingSection.classList.remove('hidden');
  loadingState.classList.remove('hidden');
  errorState.classList.add('hidden');
  resultsState.classList.add('hidden');
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Signing In...';
  }

  // Clear existing interval
  if (trackingInterval) clearInterval(trackingInterval);

  // Initial fetch
  await fetchAndDisplay(email, number, true);

  // Start polling
  trackingInterval = setInterval(() => {
    fetchAndDisplay(email, number, false);
  }, 30000);
}

async function fetchAndDisplay(email, number, showLoading) {
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const btn = document.getElementById('trackBtn');

  try {
    const res = await client.api.fetch('/api/public/order-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, reference: number })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Order not found');
    }
    
    const data = await res.json();
    displayTrackingResults(data);
    
  } catch (error) {
    console.error('Tracking error:', error);
    if (showLoading) {
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      document.getElementById('errorMessage').textContent = error.message;
      
      // Allow going back to sign in
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
      }
    }
  }
}

function displayTrackingResults(data) {
  const loadingState = document.getElementById('loadingState');
  const resultsState = document.getElementById('resultsState');
  
  loadingState.classList.add('hidden');
  resultsState.classList.remove('hidden');
  
  const order = data.order;
  const device = order.device;
  
  // Order info
  document.getElementById('orderNumber').textContent = order.orderNumber;
  
  const statusEl = document.getElementById('orderStatus');
  statusEl.textContent = order.status.charAt(0).toUpperCase() + order.status.slice(1);
  
  document.getElementById('deviceName').textContent = device ? device.name : 'Unknown Device';
  document.getElementById('customerName').textContent = order.customerName;
  document.getElementById('shippingAddress').textContent = order.shippingAddress;
  document.getElementById('specifications').textContent = 
    `${order.color || 'N/A'} | ${order.storage || 'N/A'} | Qty: ${order.quantity}`;
  
  // Timeline
  const timeline = document.getElementById('timeline');
  const noEvents = document.getElementById('noEvents');
  
  if (!data.timeline || data.timeline.length === 0) {
    timeline.innerHTML = '';
    noEvents?.classList.remove('hidden');
  } else {
    noEvents?.classList.add('hidden');
    timeline.innerHTML = data.timeline.map((event, idx) => `
      <div style="position: relative; padding-bottom: 30px;">
        <div style="position: absolute; left: -26px; top: 4px; width: 12px; height: 12px; border-radius: 50%; background: ${idx === 0 ? 'var(--primary-color)' : 'var(--border-color)'}; border: 2px solid var(--bg-primary);"></div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">${formatDate(event.date)}</div>
        <div style="font-weight: 600; margin-bottom: 4px;">${event.location}</div>
        <div style="font-size: 14px; color: var(--text-primary);">${event.description}</div>
      </div>
    `).join('');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Export for global access
window.loadDevices = loadDevices;
window.initTrackingPage = initTrackingPage;
