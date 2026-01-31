// Danh sách quán ăn (demo)
let restaurants = JSON.parse(localStorage.getItem("restaurants")) || [];

// ====== HIỂN THỊ DANH SÁCH ======
function renderRestaurants() {
    const list = document.getElementById("restaurant-list");
    list.innerHTML = "";

    restaurants.forEach((r, index) => {
        list.innerHTML += `
            <li>
                ${r.name} - ${r.address}
                ${isAdmin() ? `
                    <button onclick="editRestaurant(${index})">Sửa</button>
                    <button onclick="deleteRestaurant(${index})">Xóa</button>
                ` : ""}
            </li>
        `;
    });
}

// ====== THÊM QUÁN ======
function addRestaurant() {
    if (!isAdmin()) {
        alert("Chỉ admin mới được thêm!");
        return;
    }

    const name = document.getElementById("res-name").value;
    const address = document.getElementById("res-address").value;

    restaurants.push({ name, address });
    localStorage.setItem("restaurants", JSON.stringify(restaurants));
    renderRestaurants();
}

// ====== SỬA QUÁN ======
function editRestaurant(index) {
    if (!isAdmin()) return;

    const newName = prompt("Tên mới:", restaurants[index].name);
    const newAddress = prompt("Địa chỉ mới:", restaurants[index].address);

    restaurants[index] = { name: newName, address: newAddress };
    localStorage.setItem("restaurants", JSON.stringify(restaurants));
    renderRestaurants();
}

// ====== XÓA QUÁN ======
function deleteRestaurant(index) {
    if (!isAdmin()) return;

    if (confirm("Xóa quán này?")) {
        restaurants.splice(index, 1);
        localStorage.setItem("restaurants", JSON.stringify(restaurants));
        renderRestaurants();
    }
}

document.addEventListener("DOMContentLoaded", renderRestaurants);
