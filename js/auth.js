// ====== TÀI KHOẢN ADMIN (demo) ======
const ADMIN_ACCOUNT = {
    username: "admin",
    password: "123456"
};

// ====== ĐĂNG NHẬP ======
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (
        username === ADMIN_ACCOUNT.username &&
        password === ADMIN_ACCOUNT.password
    ) {
        localStorage.setItem("isAdmin", "true");
        alert("Đăng nhập admin thành công!");
        location.reload();
    } else {
        alert("Sai tài khoản hoặc mật khẩu!");
    }
}

// ====== ĐĂNG XUẤT ======
function logout() {
    localStorage.removeItem("isAdmin");
    alert("Đã đăng xuất!");
    location.reload();
}

// ====== KIỂM TRA ADMIN ======
function isAdmin() {
    return localStorage.getItem("isAdmin") === "true";
}
