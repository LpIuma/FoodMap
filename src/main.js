import './styles/index.css';
import categories from './data/categories.json';
import restaurants from './data/restaurants.json';

// ========== Config ==========
// 在这里填入你的高德地图 Web服务 API Key
const AMAP_KEY = 'a5d955462f96490f08f3b16d8344370e';

// ========== State ==========
const state = {
  restaurants: [...restaurants],
  categories: [...categories],
  filtered: [...restaurants],
  selectedCategory: null,
  selectedPrice: 'all',
  minRating: 0,
  searchQuery: '',
  map: null,
  markers: null,
  markerMap: {},
  sidebarOpen: window.innerWidth > 900,
  pickingLocation: false,
};

// ========== Helpers ==========
function avgRating(r) {
  const { taste, environment, service } = r.rating;
  return ((taste + environment + service) / 3).toFixed(1);
}

function stars(n, max = 5) {
  const full = Math.floor(n);
  const half = n - full >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(max - full - half);
}

function getCategoryById(id) {
  return state.categories.find(c => c.id === id);
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

// ========== Map ==========
function initMap() {
  const map = L.map('map', { zoomControl: false }).setView([43.88, 125.32], 13);

  // Dark tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  state.map = map;
  state.markers = L.markerClusterGroup({
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
  });
  map.addLayer(state.markers);

  // Click to pick location
  map.on('click', (e) => {
    if (state.pickingLocation) {
      document.getElementById('f-lat').value = e.latlng.lat.toFixed(6);
      document.getElementById('f-lng').value = e.latlng.lng.toFixed(6);
      state.pickingLocation = false;
      map.getContainer().style.cursor = '';
      toast('坐标已选取', 'success');
    }
  });

  renderMarkers();
}

function createMarkerIcon(category) {
  const cat = category || { icon: '📍', color: '#FF6B35' };
  return L.divIcon({
    className: 'custom-marker-wrapper',
    html: `<div class="custom-marker" style="border-color:${cat.color}"><span class="marker-inner">${cat.icon}</span></div>`,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -44],
  });
}

function renderMarkers() {
  state.markers.clearLayers();
  state.markerMap = {};

  state.filtered.forEach(r => {
    const cat = getCategoryById(r.category_id);
    const marker = L.marker([r.latitude, r.longitude], { icon: createMarkerIcon(cat) });

    const avg = avgRating(r);
    marker.bindPopup(`
      <div class="popup-inner">
        <div class="popup-name">${r.name}</div>
        <div class="popup-cat">${cat ? cat.icon + ' ' + cat.name : ''}</div>
        <div class="popup-rating">
          <span>⭐ ${avg}</span>
          <span>💰 ¥${r.avg_price}/人</span>
        </div>
        <div class="popup-addr">📍 ${r.address}</div>
        <button class="popup-btn" onclick="window.__showDetail(${r.id})">查看详情</button>
      </div>
    `, { className: 'map-popup', maxWidth: 280 });

    state.markers.addLayer(marker);
    state.markerMap[r.id] = marker;
  });
}

// ========== Sidebar ==========
function renderCategories() {
  const container = document.getElementById('category-filters');
  container.innerHTML = `
    <button class="category-btn ${!state.selectedCategory ? 'active' : ''}" data-cat="all">
      <span class="cat-icon">🍽️</span>全部
    </button>
    ${state.categories.map(c => `
      <button class="category-btn ${state.selectedCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
        <span class="cat-icon">${c.icon}</span>${c.name}
      </button>
    `).join('')}
  `;

  container.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      state.selectedCategory = cat === 'all' ? null : Number(cat);
      applyFilters();
      renderCategories();
    });
  });
}

function renderRestaurantList() {
  const list = document.getElementById('restaurant-list');
  const count = document.getElementById('results-count');
  count.textContent = `${state.filtered.length} 家餐厅`;

  if (state.filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-muted);">
      <div style="font-size:40px;margin-bottom:8px;">🔍</div>
      <p>没有找到符合条件的餐厅</p></div>`;
    return;
  }

  list.innerHTML = state.filtered.map((r, i) => {
    const cat = getCategoryById(r.category_id);
    const avg = avgRating(r);
    const catColor = cat ? cat.color : '#E8A838';
    return `
      <div class="rest-card" data-id="${r.id}" style="animation-delay:${i * 0.04}s;">
        <div class="rest-card-img" style="box-shadow:inset 0 0 0 2px ${catColor}30;">${cat ? cat.icon : '🍽️'}</div>
        <div class="rest-card-info">
          <div class="rest-card-name">${r.name}</div>
          <div class="rest-card-cat" style="color:${catColor}">${cat ? cat.name : ''}</div>
          <div class="rest-card-addr">${r.address}</div>
          <div class="rest-card-meta">
            <span class="rest-card-rating">⭐ ${avg}</span>
            <span class="rest-card-price">¥${r.avg_price}/人</span>
          </div>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.rest-card').forEach(card => {
    card.addEventListener('click', () => showDetail(Number(card.dataset.id)));
  });
}

// ========== Filters ==========
function applyFilters() {
  let result = [...state.restaurants];

  // Category
  if (state.selectedCategory) {
    result = result.filter(r => r.category_id === state.selectedCategory);
  }

  // Price
  if (state.selectedPrice !== 'all') {
    const [min, max] = state.selectedPrice.includes('+')
      ? [parseInt(state.selectedPrice), Infinity]
      : state.selectedPrice.split('-').map(Number);
    result = result.filter(r => r.avg_price >= min && r.avg_price <= max);
  }

  // Rating
  if (state.minRating > 0) {
    result = result.filter(r => parseFloat(avgRating(r)) >= state.minRating);
  }

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.recommended_dishes.some(d => d.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  }

  state.filtered = result;
  renderRestaurantList();
  renderMarkers();
}

// ========== Detail Panel ==========
function showDetail(id) {
  const r = state.restaurants.find(x => x.id === id);
  if (!r) return;

  const cat = getCategoryById(r.category_id);
  const panel = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');

  content.innerHTML = `
    <div class="detail-cover" style="display:flex;align-items:center;justify-content:center;font-size:72px;background:linear-gradient(160deg,${cat ? cat.color : '#E8A838'}25, #2C2418 70%);">
      ${cat ? cat.icon : '🍽️'}
    </div>
    <div class="detail-body">
      <h1 class="detail-name">${r.name}</h1>
      <span class="detail-cat-badge">${cat ? cat.icon + ' ' + cat.name : ''}</span>

      <div class="detail-ratings">
        <div class="detail-rating-item">
          <div class="detail-rating-label">口味</div>
          <div class="detail-rating-score">${r.rating.taste}</div>
        </div>
        <div class="detail-rating-item">
          <div class="detail-rating-label">环境</div>
          <div class="detail-rating-score">${r.rating.environment}</div>
        </div>
        <div class="detail-rating-item">
          <div class="detail-rating-label">服务</div>
          <div class="detail-rating-score">${r.rating.service}</div>
        </div>
        <div class="detail-rating-item">
          <div class="detail-rating-label">综合</div>
          <div class="detail-rating-score">${avgRating(r)}</div>
        </div>
      </div>

      <div class="detail-info-list">
        <div class="detail-info-row">
          <span class="detail-info-icon">📍</span>
          <span class="detail-info-text">${r.address}</span>
        </div>
        ${r.phone ? `<div class="detail-info-row"><span class="detail-info-icon">📞</span><span class="detail-info-text">${r.phone}</span></div>` : ''}
        ${r.business_hours ? `<div class="detail-info-row"><span class="detail-info-icon">🕐</span><span class="detail-info-text">${r.business_hours}</span></div>` : ''}
        <div class="detail-info-row">
          <span class="detail-info-icon">💰</span>
          <span class="detail-info-text">人均 ¥${r.avg_price}</span>
        </div>
      </div>

      ${r.recommended_dishes.length ? `
        <h3 class="detail-section-title">🏷️ 推荐菜品</h3>
        <div class="detail-dishes">
          ${r.recommended_dishes.map(d => `<span class="dish-tag">${d}</span>`).join('')}
        </div>` : ''}

      ${r.description ? `
        <h3 class="detail-section-title">📝 简介</h3>
        <div class="detail-desc">${r.description}</div>` : ''}

      <div style="margin-top:24px;display:flex;justify-content:flex-end;">
        <button class="btn" style="background:#ff4d4f;color:white;border:none;" onclick="window.__deleteRestaurant(${r.id})">删除此餐厅</button>
      </div>
    </div>
  `;

  panel.classList.remove('hidden');

  // Pan map to restaurant
  if (state.map) {
    state.map.flyTo([r.latitude, r.longitude], 16, { duration: 0.8 });
    const marker = state.markerMap[r.id];
    if (marker) setTimeout(() => marker.openPopup(), 900);
  }
}

window.__showDetail = showDetail;

window.__deleteRestaurant = (id) => {
  if (!confirm('确定要删除此餐厅吗？')) return;
  state.restaurants = state.restaurants.filter(r => r.id !== id);
  applyFilters();
  document.getElementById('detail-panel').classList.add('hidden');
  
  fetch('/api/save', {
    method: 'POST',
    body: JSON.stringify(state.restaurants)
  }).then(res => res.json()).then(data => {
    if (data.success) toast('已删除', 'success');
    else toast('删除失败', 'error');
  }).catch(() => toast('删除失败', 'error'));
};

// ========== Star Rating Widget ==========
function initStarRatings() {
  document.querySelectorAll('.star-rating').forEach(container => {
    container.innerHTML = '';
    container._value = 0;
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = 'star';
      star.textContent = '★';
      star.dataset.value = i;
      star.addEventListener('click', () => {
        container._value = i;
        container.querySelectorAll('.star').forEach((s, idx) => {
          s.classList.toggle('filled', idx < i);
        });
      });
      star.addEventListener('mouseenter', () => {
        container.querySelectorAll('.star').forEach((s, idx) => {
          s.classList.toggle('filled', idx < i);
        });
      });
      container.appendChild(star);
    }
    container.addEventListener('mouseleave', () => {
      container.querySelectorAll('.star').forEach((s, idx) => {
        s.classList.toggle('filled', idx < container._value);
      });
    });
  });
}

// ========== Amap POI Search ==========
const AMAP_CATEGORY_MAP = {
  '中餐厅': 1, '东北菜': 1, '家常菜': 1, '饺子馆': 1, '炖菜': 1,
  '烧烤': 2, '烤肉': 2, '烤串': 2,
  '火锅': 3, '麻辣烫': 3,
  '韩国料理': 4, '韩国菜': 4, '朝鲜菜': 4,
  '日本料理': 5, '寿司': 5, '日本菜': 5, '拉面': 5,
  '西餐': 6, '西式快餐': 6, '牛排': 6, '披萨': 6,
  '小吃快餐': 7, '面点': 7, '粥店': 7, '包子': 7, '糕饼店': 7,
  '咖啡厅': 8, '甜品店': 8, '茶餐厅': 8, '冷饮店': 8, '面包甜点': 8,
  '面馆': 9, '粉面馆': 9, '拉面馆': 9,
};

function matchCategory(amapType) {
  if (!amapType) return null;
  for (const [keyword, catId] of Object.entries(AMAP_CATEGORY_MAP)) {
    if (amapType.includes(keyword)) return catId;
  }
  return null;
}

async function searchAmapPOI(keyword) {
  if (AMAP_KEY === 'YOUR_AMAP_KEY_HERE') {
    toast('请先配置高德地图 API Key（在 main.js 顶部）', 'error');
    return [];
  }
  const url = `https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(keyword)}&city=长春&citylimit=true&types=050000&offset=8&extensions=all`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === '1' && data.pois) return data.pois;
    if (data.info) toast(`高德API: ${data.info}`, 'error');
    return [];
  } catch (e) {
    toast('网络请求失败', 'error');
    return [];
  }
}

function autoFillField(id, value) {
  const el = document.getElementById(id);
  if (el && value) {
    el.value = value;
    el.classList.add('auto-filled');
    setTimeout(() => el.classList.remove('auto-filled'), 600);
  }
}

function fillFormFromPOI(poi) {
  const [lng, lat] = (poi.location || '').split(',');
  autoFillField('f-name', poi.name || '');
  autoFillField('f-address', poi.address || '');
  autoFillField('f-lat', lat || '');
  autoFillField('f-lng', lng || '');
  autoFillField('f-phone', poi.tel || '');

  // Business hours from extensions
  if (poi.biz_ext && poi.biz_ext.open_time) {
    autoFillField('f-hours', poi.biz_ext.open_time);
  }
  // Average price
  if (poi.biz_ext && poi.biz_ext.cost) {
    autoFillField('f-price', poi.biz_ext.cost);
  }

  // Auto-match category
  const catId = matchCategory(poi.type || '');
  if (catId) {
    const select = document.getElementById('f-category');
    select.value = catId;
    select.classList.add('auto-filled');
    setTimeout(() => select.classList.remove('auto-filled'), 600);
  }

  // Hide results
  document.getElementById('poi-results').classList.add('hidden');
  toast('✅ 信息已自动填入，可手动修改', 'success');
}

function initPOISearch() {
  const input = document.getElementById('poi-search');
  const resultsEl = document.getElementById('poi-results');
  const spinner = document.getElementById('poi-spinner');
  if (!input) return;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) {
      resultsEl.classList.add('hidden');
      return;
    }
    timer = setTimeout(async () => {
      spinner.classList.remove('hidden');
      const pois = await searchAmapPOI(q);
      spinner.classList.add('hidden');

      if (pois.length === 0) {
        resultsEl.innerHTML = '<div class="poi-no-result">未找到相关餐厅</div>';
        resultsEl.classList.remove('hidden');
        return;
      }

      resultsEl.innerHTML = pois.map((p, i) => `
        <div class="poi-result-item" data-idx="${i}">
          <div class="poi-result-name">${p.name}</div>
          <div class="poi-result-addr">📍 ${p.address || p.cityname + p.adname}</div>
          <div class="poi-result-meta">${p.type ? p.type.split(';')[0] : ''}${p.biz_ext && p.biz_ext.cost ? ' · ¥' + p.biz_ext.cost + '/人' : ''}${p.tel ? ' · ' + p.tel : ''}</div>
        </div>
      `).join('');
      resultsEl.classList.remove('hidden');

      resultsEl.querySelectorAll('.poi-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = Number(item.dataset.idx);
          fillFormFromPOI(pois[idx]);
        });
      });
    }, 500);
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.poi-search-group')) {
      resultsEl.classList.add('hidden');
    }
  });
}

// ========== Form (Add Restaurant) ==========
function renderCategorySelect() {
  const select = document.getElementById('f-category');
  if (!select) return;
  select.innerHTML = '<option value="">选择分类...</option>' +
    state.categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
}

function initAddForm() {
  renderCategorySelect();

  document.getElementById('restaurant-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('f-name').value.trim();
    const catId = Number(document.getElementById('f-category').value);
    const address = document.getElementById('f-address').value.trim();

    if (!name || !catId || !address) {
      toast('请填写必填项', 'error');
      return;
    }

    const newR = {
      id: Date.now(),
      name,
      slug: name.replace(/\s+/g, '-'),
      category_id: catId,
      address,
      district: '',
      latitude: parseFloat(document.getElementById('f-lat').value) || 43.88,
      longitude: parseFloat(document.getElementById('f-lng').value) || 125.32,
      phone: document.getElementById('f-phone').value,
      avg_price: parseInt(document.getElementById('f-price').value) || 0,
      rating: {
        taste: document.querySelector('[data-field="taste"]')?._value || 0,
        environment: document.querySelector('[data-field="environment"]')?._value || 0,
        service: document.querySelector('[data-field="service"]')?._value || 0,
      },
      recommended_dishes: document.getElementById('f-dishes').value.split(/[,，]/).map(s => s.trim()).filter(Boolean),
      business_hours: document.getElementById('f-hours').value,
      description: document.getElementById('f-desc').value,
      cover_image: '', images: [], status: 'pending',
    };

    state.restaurants.push(newR);
    applyFilters();
    closeModal();
    e.target.reset();

    fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify(state.restaurants)
    }).then(res => res.json()).then(data => {
      if (data.success) toast('餐馆已保存到本地', 'success');
      else toast('保存失败', 'error');
    }).catch(() => toast('保存失败', 'error'));
  });
}

function openModal() {
  document.getElementById('add-modal').classList.remove('hidden');
  initStarRatings();
}

function closeModal() {
  document.getElementById('add-modal').classList.add('hidden');
}

// ========== Event Bindings ==========
function bindEvents() {
  // Sidebar toggle
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 900) {
      sb.classList.toggle('open');
    } else {
      sb.classList.toggle('collapsed');
      // Adjust grid
      const app = document.getElementById('app');
      if (sb.classList.contains('collapsed')) {
        app.style.gridTemplateColumns = '1fr';
        app.style.gridTemplateAreas = '"header" "map"';
      } else {
        app.style.gridTemplateColumns = 'var(--sidebar-w) 1fr';
        app.style.gridTemplateAreas = '"header header" "sidebar map"';
      }
      setTimeout(() => state.map?.invalidateSize(), 300);
    }
  });

  // Search
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchClear.classList.toggle('hidden', !searchInput.value);
    searchTimer = setTimeout(() => {
      state.searchQuery = searchInput.value.trim();
      applyFilters();
    }, 300);
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    state.searchQuery = '';
    applyFilters();
  });

  // Price filters
  document.getElementById('price-filters').addEventListener('click', (e) => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    document.querySelectorAll('#price-filters .filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    state.selectedPrice = chip.dataset.price;
    applyFilters();
  });

  // Rating slider
  const ratingRange = document.getElementById('rating-range');
  const ratingValue = document.getElementById('rating-value');
  ratingRange.addEventListener('input', () => {
    const v = parseFloat(ratingRange.value);
    state.minRating = v;
    ratingValue.textContent = v === 0 ? '不限' : `${v}+`;
    const pct = (v / 5) * 100;
    ratingRange.style.background = `linear-gradient(90deg, var(--primary) ${pct}%, var(--bg-card) ${pct}%)`;
    applyFilters();
  });

  // Detail close
  document.getElementById('detail-close').addEventListener('click', () => {
    document.getElementById('detail-panel').classList.add('hidden');
  });

  // Add restaurant
  document.getElementById('add-restaurant-btn').addEventListener('click', openModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('form-cancel').addEventListener('click', closeModal);
  document.getElementById('add-modal').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal();
  });

  // Push to GitHub
  document.getElementById('push-github-btn')?.addEventListener('click', () => {
    const btn = document.getElementById('push-github-btn');
    const originalHtml = btn.innerHTML;
    btn.innerHTML = '推送中...';
    btn.disabled = true;
    
    fetch('/api/push', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) toast('已推送到 GitHub!', 'success');
        else toast('推送失败: ' + (data.error || '未知错误'), 'error');
      })
      .catch(e => toast('推送请求失败', 'error'))
      .finally(() => {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
      });
  });

  // Location picking hint
  document.querySelector('.form-hint')?.addEventListener('click', () => {
    state.pickingLocation = true;
    state.map.getContainer().style.cursor = 'crosshair';
    closeModal();
    toast('点击地图选取坐标位置', 'info');
  });

  // Locate me
  document.getElementById('locate-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
      toast('浏览器不支持定位', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
        toast('已定位到您的位置', 'success');
      },
      () => toast('定位失败，请检查权限', 'error')
    );
  });

  // Category Management
  document.getElementById('manage-categories-btn').addEventListener('click', openCategoryModal);
  document.getElementById('cat-modal-close').addEventListener('click', closeCategoryModal);
  document.getElementById('cat-modal-cancel').addEventListener('click', closeCategoryModal);
  document.getElementById('add-category-row-btn').addEventListener('click', addCategoryRow);
  document.getElementById('cat-modal-save').addEventListener('click', saveCategories);
}

// ========== Category Management ==========
function openCategoryModal() {
  renderCategoryEditList();
  document.getElementById('category-modal').classList.remove('hidden');
}

function closeCategoryModal() {
  document.getElementById('category-modal').classList.add('hidden');
}

function renderCategoryEditList() {
  const list = document.getElementById('category-edit-list');
  list.innerHTML = state.categories.map((c, i) => `
    <div class="cat-edit-row" data-index="${i}" style="display:flex;gap:8px;align-items:center;">
      <input type="text" class="cat-edit-icon" value="${c.icon}" placeholder="图标" style="width:50px;text-align:center;">
      <input type="text" class="cat-edit-name" value="${c.name}" placeholder="名称" style="flex:1;">
      <input type="color" class="cat-edit-color" value="${c.color}" style="width:40px;height:38px;padding:2px;cursor:pointer;">
      <button class="icon-btn" onclick="window.__removeCategoryRow(${i})" style="width:38px;height:38px;color:var(--danger);border-color:var(--danger)30;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');
}

window.__removeCategoryRow = (index) => {
  const rows = document.querySelectorAll('.cat-edit-row');
  if (rows.length <= 1) {
    toast('至少需要保留一个分类', 'error');
    return;
  }
  rows[index].remove();
  // Refresh indices
  document.querySelectorAll('.cat-edit-row').forEach((row, i) => {
    row.dataset.index = i;
    row.querySelector('button').setAttribute('onclick', `window.__removeCategoryRow(${i})`);
  });
};

function addCategoryRow() {
  const list = document.getElementById('category-edit-list');
  const index = document.querySelectorAll('.cat-edit-row').length;
  const div = document.createElement('div');
  div.className = 'cat-edit-row';
  div.dataset.index = index;
  div.style.display = 'flex';
  div.style.gap = '8px';
  div.style.alignItems = 'center';
  div.innerHTML = `
    <input type="text" class="cat-edit-icon" value="📍" placeholder="图标" style="width:50px;text-align:center;">
    <input type="text" class="cat-edit-name" value="" placeholder="新分类" style="flex:1;">
    <input type="color" class="cat-edit-color" value="#E8A838" style="width:40px;height:38px;padding:2px;cursor:pointer;">
    <button class="icon-btn" onclick="window.__removeCategoryRow(${index})" style="width:38px;height:38px;color:var(--danger);border-color:var(--danger)30;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;
  list.appendChild(div);
  div.querySelector('.cat-edit-name').focus();
}

async function saveCategories() {
  const rows = document.querySelectorAll('.cat-edit-row');
  const newCategories = Array.from(rows).map((row, i) => ({
    id: state.categories[i]?.id || Date.now() + i,
    name: row.querySelector('.cat-edit-name').value.trim(),
    slug: row.querySelector('.cat-edit-name').value.trim().toLowerCase().replace(/\s+/g, '-'),
    icon: row.querySelector('.cat-edit-icon').value.trim(),
    color: row.querySelector('.cat-edit-color').value
  }));

  if (newCategories.some(c => !c.name)) {
    toast('分类名称不能为空', 'error');
    return;
  }

  const btn = document.getElementById('cat-modal-save');
  btn.disabled = true;
  btn.textContent = '保存中...';

  try {
    const res = await fetch('/api/save-categories', {
      method: 'POST',
      body: JSON.stringify(newCategories)
    });
    const data = await res.json();
    if (data.success) {
      state.categories = newCategories;
      renderCategories();
      renderCategorySelect();
      renderRestaurantList();
      renderMarkers();
      closeCategoryModal();
      toast('分类修改成功', 'success');
    } else {
      toast('保存失败: ' + data.error, 'error');
    }
  } catch (e) {
    toast('网络请求失败', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '保存修改';
  }
}

// ========== Init ==========
function init() {
  initMap();
  renderCategories();
  renderRestaurantList();
  initAddForm();
  initPOISearch();
  bindEvents();

  // Mobile: sidebar defaults closed
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

document.addEventListener('DOMContentLoaded', init);
