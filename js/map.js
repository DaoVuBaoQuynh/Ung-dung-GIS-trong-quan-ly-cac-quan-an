// 1. Khởi tạo bản đồ (CHỈ 1 LẦN)
var map = L.map('map').setView([10.762622, 106.660172], 13);

// 2. Thêm nền bản đồ
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 3. Load dữ liệu quán ăn từ GeoJSON
fetch("data/restaurants.geojson")
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng);
      },
      onEachFeature: function (feature, layer) {
        const p = feature.properties;
        layer.bindPopup(
          `<b>${p.name}</b><br>
           Loại: ${p.type}<br>
           Địa chỉ: ${p.address}`
        );
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error("Lỗi load GeoJSON:", error);
  });
