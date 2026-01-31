let routingControl = null;
let userLocation = null;
map.locate({ setView: true, maxZoom: 15 });

map.on("locationfound", function (e) {
  userLocation = e.latlng;

  L.marker(userLocation)
    .addTo(map)
    .bindPopup("📍 Vị trí của bạn")
    .openPopup();
});

map.on("locationerror", function () {
  alert("Không lấy được vị trí hiện tại!");
});
function routeToRestaurant(latlng) {
  if (!userLocation) {
    alert("Chưa xác định vị trí người dùng!");
    return;
  }

  if (routingControl) {
    map.removeControl(routingControl);
  }

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(userLocation.lat, userLocation.lng),
      L.latLng(latlng.lat, latlng.lng),
    ],
    routeWhileDragging: false,
    language: "vi",
    show: true,
  }).addTo(map);
}
layer.bindPopup(`
  <b>${p.name}</b><br>
  Loại: ${p.type}<br>
  Địa chỉ: ${p.address}<br>
  <button onclick="routeToRestaurant({lat:${latlng.lat}, lng:${latlng.lng}})">
    🚗 Chỉ đường
  </button>
`);