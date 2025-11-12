const API_URL = "http://localhost:5000";
let currentUser = null;

// DOM elements
const authSection = document.getElementById("authSection");
const marketplaceSection = document.getElementById("marketplaceSection");
const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const authTitle = document.getElementById("authTitle");
const authBtn = document.getElementById("authBtn");
const toggleAuth = document.getElementById("toggleAuth");
const authForm = document.getElementById("authForm");
const userName = document.getElementById("userName");
const productContainer = document.getElementById("productContainer");
const logoutBtn = document.getElementById("logoutBtn");
const addProductForm = document.getElementById("addProductForm");
const addProductBtn = document.getElementById("addProductBtn");
const viewProductsBtn = document.getElementById("viewProductsBtn");

let isLogin = true;

console.log("✅ app.js loaded successfully!");

// Toggle login/signup mode
toggleAuth.addEventListener("click", () => {
  isLogin = !isLogin;
  fullname.classList.toggle("hidden", isLogin);
  authTitle.textContent = isLogin ? "Login" : "Sign Up";
  authBtn.textContent = isLogin ? "Login" : "Create Account";
  toggleAuth.innerHTML = isLogin
    ? "Don’t have an account? <span>Sign Up</span>"
    : "Already have an account? <span>Login</span>";
});

// Handle login/signup
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("🔹 Login/Signup button clicked!");

  const name = fullname.value.trim();
  const mail = email.value.trim();
  const pass = password.value.trim();

  if (!mail || !pass) {
    alert("Please fill all required fields!");
    return;
  }

  if (!isLogin) {
    // Signup
    const res = await fetch(`${API_URL}/add-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FullName: name, Email: mail, PasswordHash: pass }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    if (data.message) toggleAuth.click();
  } else {
    // Login
    try {
      const res = await fetch(`${API_URL}/users`);
      const users = await res.json();

      const found = users.find(
        (u) => u.Email === mail && u.PasswordHash === pass
      );

      if (found) {
        currentUser = found;
        showMarketplace();
      } else {
        alert("Invalid credentials!");
      }
    } catch (err) {
      alert("Server connection failed!");
      console.error(err);
    }
  }
});

// Show marketplace
function showMarketplace() {
  authSection.classList.add("hidden");
  marketplaceSection.classList.remove("hidden");
  userName.textContent = currentUser.FullName;
  loadProducts();
}

// Logout
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  marketplaceSection.classList.add("hidden");
  authSection.classList.remove("hidden");
  email.value = "";
  password.value = "";
});

// Switch between tabs
addProductBtn.addEventListener("click", () => {
  productContainer.classList.add("hidden");
  addProductForm.classList.remove("hidden");
  addProductBtn.classList.add("active");
  viewProductsBtn.classList.remove("active");
});

viewProductsBtn.addEventListener("click", () => {
  addProductForm.classList.add("hidden");
  productContainer.classList.remove("hidden");
  viewProductsBtn.classList.add("active");
  addProductBtn.classList.remove("active");
  loadProducts();
});

// Load available products
async function loadProducts() {
  productContainer.innerHTML = "<p>Loading...</p>";
  const res = await fetch(`${API_URL}/listings`);
  const products = await res.json();

  if (!products.length) {
    productContainer.innerHTML = "<p>No items available yet.</p>";
    return;
  }

  productContainer.innerHTML = "";
  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${p.Title}</h3>
      <p>${p.Description}</p>
      <p><strong>Seller:</strong> ${p.SellerName}</p>
      <p class="price">₹${p.Price}</p>
      <button onclick="buyItem(${p.ListingId}, ${p.Price}, ${p.SellerId})">Buy Now</button>
    `;
    productContainer.appendChild(card);
  });
}

// Add new product
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const price = document.getElementById("price").value;
  const itemCondition = document.getElementById("itemCondition").value;

  const res = await fetch(`${API_URL}/add-listing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sellerId: currentUser.UserId,
      title,
      description,
      price,
      itemCondition,
    }),
  });

  const data = await res.json();
  alert(data.message || data.error);
  addProductForm.reset();
  viewProductsBtn.click();
});

// Buy item
window.buyItem = async (listingId, amount, sellerId) => {
  if (!currentUser) return alert("Please login first!");

  const res = await fetch(`${API_URL}/purchase`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId,
      buyerId: currentUser.UserId,
      amount,
      paymentMethod: "UPI",
    }),
  });

  const result = await res.json();
  alert(result.message || result.error);
  loadProducts();
};
