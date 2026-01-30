// ================================
// CÂU 5 - statistics.js
// Thống kê GIS theo khu vực (district): bảng + biểu đồ
// ================================

async function getRestaurants() {
  if (Array.isArray(window.restaurants) && window.restaurants.length) return window.restaurants;

  const res = await fetch("data/restaurants.json");
  if (!res.ok) throw new Error("Không tải được data/restaurants.json");
  return await res.json();
}

// Load Chart.js nếu trang chưa có
function loadChartJS() {
  return new Promise((resolve, reject) => {
    if (window.Chart) return resolve();

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Không load được Chart.js CDN"));
    document.head.appendChild(script);
  });
}

function ensureStatsUI() {
  if (document.getElementById("statsPanel")) return;

  const panel = document.createElement("div");
  panel.id = "statsPanel";
  panel.style.padding = "10px";
  panel.style.margin = "10px 0";
  panel.style.border = "1px solid #ddd";
  panel.style.borderRadius = "8px";

  panel.innerHTML = `
    <h3 style="margin: 0 0 10px 0;">Câu 5 - Thống kê GIS</h3>
    <div id="topDistrict" style="margin-bottom:10px;"></div>
    <div style="display:flex; gap:20px; flex-wrap:wrap;">
      <div style="flex:1; min-width:280px;">
        <b>Bảng thống kê theo khu vực</b>
        <div id="statsTableWrap" style="margin-top:8px;"></div>
      </div>
      <div style="flex:1; min-width:280px;">
        <b>Biểu đồ</b>
        <canvas id="statsChart" height="180"></canvas>
      </div>
    </div>
  `;

  // Gắn panel lên trên map nếu có, không thì gắn cuối body
  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.parentNode.insertBefore(panel, mapEl.nextSibling);
  else document.body.appendChild(panel);
}

function computeStats(restaurants) {
  const counts = new Map();
  restaurants.forEach(r => {
    const d = (r.district ?? "Không rõ").trim?.() ?? "Không rõ";
    counts.set(d, (counts.get(d) || 0) + 1);
  });

  const rows = Array.from(counts.entries())
    .map(([district, count]) => ({ district, count }))
    .sort((a, b) => b.count - a.count);

  const top = rows[0] || null;
  return { rows, top };
}

function renderTable(rows) {
  const wrap = document.getElementById("statsTableWrap");
  if (!wrap) return;

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  table.innerHTML = `
    <thead>
      <tr>
        <th style="border-bottom:1px solid #ccc; text-align:left; padding:6px;">Khu vực</th>
        <th style="border-bottom:1px solid #ccc; text-align:right; padding:6px;">Số quán</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(r => `
        <tr>
          <td style="border-bottom:1px solid #eee; padding:6px;">${r.district}</td>
          <td style="border-bottom:1px solid #eee; padding:6px; text-align:right;">${r.count}</td>
        </tr>
      `).join("")}
    </tbody>
  `;

  wrap.innerHTML = "";
  wrap.appendChild(table);
}

let _chart = null;
function renderChart(rows) {
  const ctx = document.getElementById("statsChart");
  if (!ctx) return;

  const labels = rows.map(r => r.district);
  const data = rows.map(r => r.count);

  if (_chart) _chart.destroy();

  _chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{ label: "Số lượng quán", data }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

(async function mainStatistics() {
  try {
    const restaurants = await getRestaurants();
    ensureStatsUI();

    const { rows, top } = computeStats(restaurants);

    const topEl = document.getElementById("topDistrict");
    if (topEl) {
      topEl.innerHTML = top
        ? `Khu vực nhiều quán nhất: <b>${top.district}</b> (${top.count} quán)`
        : "Chưa có dữ liệu để thống kê.";
    }

    renderTable(rows);

    await loadChartJS();
    renderChart(rows);
  } catch (err) {
    console.error(err);
    alert("Lỗi Câu 5 (statistics): " + err.message);
  }
})();
