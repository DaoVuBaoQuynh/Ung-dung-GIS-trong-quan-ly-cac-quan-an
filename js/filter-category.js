// ================================
// CÂU 4 - filter-category.js
// Lọc / phân loại: category, price_level, open/closed
// ================================

// 1) Lấy dữ liệu quán: ưu tiên window.restaurants, nếu không có thì fetch JSON
async function getRestaurants() {
  if (Array.isArray(window.restaurants) && window.restaurants.length) return window.restaurants;

  // ĐỔI path này theo project của bạn nếu khác
  const res = await fetch("../data/restaurants.geojson");
  if (!res.ok) throw new Error("Không tải được data/restaurants.geojson");
  return await res.json();
}

// 2) Helpers: parse giờ & check đang mở
function parseHHMM(s) {
  const [h, m] = String(s).split(":").map(Number);
  return { h, m };
}

function isOpenNow(openTime, closeTime, now = new Date()) {
  const nH = now.getHours(), nM = now.getMinutes();
  const { h: oH, m: oM } = parseHHMM(openTime);
  const { h: cH, m: cM } = parseHHMM(closeTime);

  const nowMin = nH * 60 + nM;
  const openMin = oH * 60 + oM;
  const closeMin = cH * 60 + cM;

  // Nếu đóng sau nửa đêm (vd 18:00-02:00)
  if (closeMin < openMin) {
    return nowMin >= openMin || nowMin <= closeMin;
  }
  return nowMin >= openMin && nowMin <= closeMin;
}

// 3) UI filter: tạo DOM bằng JS (không cần HTML)
function ensureFilterUI(categories, prices) {
  if (document.getElementById("filterPanel")) return;

  const panel = document.createElement("div");
  panel.id = "filterPanel";
  panel.style.padding = "10px";
  panel.style.margin = "10px 0";
  panel.style.border = "1px solid #ddd";
  panel.style.borderRadius = "8px";

  panel.innerHTML = `
    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
      <label>Loại hình:
        <select id="fCategory">
          <option value="all">Tất cả</option>
          ${categories.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </label>

      <label>Mức giá:
        <select id="fPrice">
          <option value="all">Tất cả</option>
          ${prices.map(p => `<option value="${p}">${p}</option>`).join("")}
        </select>
      </label>

      <label>Trạng thái:
        <select id="fStatus">
          <option value="all">Tất cả</option>
          <option value="open">Đang mở</option>
          <option value="closed">Đã đóng</option>
        </select>
      </label>

      <button id="btnFilter">Lọc</button>
      <button id="btnReset">Reset</button>

      <span id="filterCount" style="margin-left:auto;"></span>
    </div>
  `;

  // Gắn panel lên trên map
  const mapEl = document.getElementById("map");
  if (!mapEl) throw new Error("Không thấy div#map. Bạn cần có <div id='map'></div> trong HTML.");
  mapEl.parentNode.insertBefore(panel, mapEl);
}

// 4) Marker layer quản lý
let _filterMap = null;
let _markerLayer = null;

function ensureMap() {
  // Nếu bạn đã tạo map ở map.js, bạn có thể gán window.map = map để dùng chung.
  // Ưu tiên dùng window.map nếu có:
  if (window.map) {
    _filterMap = window.map;
    return;
  }

  // Nếu không có, tự tạo map:
  _filterMap = L.map("map").setView([10.776, 106.700], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
  }).addTo(_filterMap);

  // Cho trang khác dùng
  window.map = _filterMap;
}

function renderMarkers(data) {
  if (!_markerLayer) {
    _markerLayer = L.layerGroup().addTo(_filterMap);
  } else {
    _markerLayer.clearLayers();
  }

  data.forEach(r => {
    const open = isOpenNow(r.open_time, r.close_time);
    const popup = `
      <b>${r.name}</b><br>
      Loại: ${r.category}<br>
      Giá: ${r.price_level}<br>
      Trạng thái: ${open ? "Đang mở" : "Đã đóng"}<br>
      Khu vực: ${r.district ?? "(chưa có)"}
    `;
    L.marker([r.lat, r.lng]).bindPopup(popup).addTo(_markerLayer);
  });

  const countEl = document.getElementById("filterCount");
  if (countEl) countEl.textContent = `Kết quả: ${data.length} quán`;
}

// 5) Lọc theo UI
function applyFilter(allRestaurants) {
  const c = document.getElementById("fCategory").value;
  const p = document.getElementById("fPrice").value;
  const s = document.getElementById("fStatus").value;

  const now = new Date();
  const filtered = allRestaurants.filter(r => {
    const okC = (c === "all") || (r.category === c);
    const okP = (p === "all") || (r.price_level === p);
    const open = isOpenNow(r.open_time, r.close_time, now);
    const okS = (s === "all") || (s === "open" ? open : !open);
    return okC && okP && okS;
  });

  renderMarkers(filtered);
}

// 6) Main
(async function mainFilterCategory() {
  try {
    ensureMap();
    const data = await getRestaurants();
    
    // Nếu là GeoJSON, lấy features; nếu là array thì dùng trực tiếp
    const all = data.features ? data.features.map(f => {
      const props = f.properties || {};
      const coords = f.geometry?.coordinates || [0, 0];
      return {
        ...props,
        lng: coords[0],
        lat: coords[1]
      };
    }) : data;

    // tạo danh sách option
    const categories = [...new Set(all.map(r => r.category).filter(Boolean))].sort();
    const prices = [...new Set(all.map(r => r.price_level).filter(Boolean))].sort();

    ensureFilterUI(categories, prices);
    renderMarkers(all);

    document.getElementById("btnFilter").addEventListener("click", () => applyFilter(all));
    document.getElementById("btnReset").addEventListener("click", () => {
      document.getElementById("fCategory").value = "all";
      document.getElementById("fPrice").value = "all";
      document.getElementById("fStatus").value = "all";
      renderMarkers(all);
    });
  } catch (err) {
    console.error(err);
    alert("Lỗi Câu 4 (filter-category): " + err.message);
  }
})();
