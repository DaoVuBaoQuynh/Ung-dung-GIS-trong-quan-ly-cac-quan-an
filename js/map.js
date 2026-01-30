var restaurantLayer;   // layer chứa tất cả quán ăn
/******** 1. KHỞI TẠO BẢN ĐỒ ********/
var map = L.map('map').setView([10.762622, 106.660172], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

/******** 2. ICON QUÁN ĂN ********/
var restaurantIcon = L.icon({
  iconUrl: 'icons/restaurant.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

/******** 3. LOAD GEOJSON ********/
fetch("data/restaurants.geojson")
  .then(res => res.json())
  .then(data => {
    restaurantLayer = L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: restaurantIcon });
      },
      onEachFeature: function (feature, layer) {
        const p = feature.properties;
        layer.bindPopup(`
          <b>${p.name}</b><br>
          Loại: ${p.type}<br>
          Địa chỉ: ${p.address}
        `);
      }
    }).addTo(map);
  });

/******** 4. THÊM / XOÁ QUÁN ********/
map.on('click', function (e) {
  const name = prompt("Tên quán:");
  if (!name) return;

  const type = prompt("Loại quán:");
  const address = prompt("Địa chỉ:");
  const note = prompt("Ghi chú:");

  const marker = L.marker(e.latlng, { icon: restaurantIcon }).addTo(map);

  marker.bindPopup(`
    <b>${name}</b><br>
    Loại: ${type}<br>
    Địa chỉ: ${address}<br>
    Ghi chú: ${note}
  `).openPopup();

  marker.on('contextmenu', function () {
    map.removeLayer(marker);
  });
});
function searchByName() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  restaurantLayer.eachLayer(function (layer) {
    const name = layer.feature.properties.name.toLowerCase();

    if (name.includes(keyword)) {
      layer.addTo(map);
      layer.openPopup();
    } else {
      map.removeLayer(layer);
    }
  });
}
var searchCenter;
var searchCircle;
map.on("dblclick", function (e) {
  searchCenter = e.latlng;

  if (searchCircle) {
    map.removeLayer(searchCircle);
  }

  searchCircle = L.circle(searchCenter, {
    radius: 500, // 500m
    color: "red",
    fillOpacity: 0.1
  }).addTo(map);
});
function searchByDistance() {
  if (!searchCenter) {
    alert("Double click bản đồ để chọn vị trí tìm");
    return;
  }

  restaurantLayer.eachLayer(function (layer) {
    const distance = searchCenter.distanceTo(layer.getLatLng());

    if (distance <= 500) {
      layer.addTo(map);
    } else {
      map.removeLayer(layer);
    }
  });
}