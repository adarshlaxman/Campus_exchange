// =======================================================
// CAMPUS EXCHANGE (PROJECT COMPONENT EDITION)
// Final Frontend Logic — by Adarsh L (PES2UG23CS025)
// Includes Admin Dashboard + Feedback + Purchase Validation
// =======================================================

const API_URL = "http://localhost:5000";
let currentUser = null;

// ---------------- DOM Elements ----------------
const authSection = document.getElementById("authSection");
const marketplaceSection = document.getElementById("marketplaceSection");
const dashboardSection = document.getElementById("dashboardSection");

const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const authTitle = document.getElementById("authTitle");
const authForm = document.getElementById("authForm");
const toggleAuth = document.getElementById("toggleAuth");
const authBtn = document.getElementById("authBtn");

const userName = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const closeDashboardBtn = document.getElementById("closeDashboardBtn");

const viewProductsBtn = document.getElementById("viewProductsBtn");
const addProductBtn = document.getElementById("addProductBtn");
const productContainer = document.getElementById("productContainer");
const addProductForm = document.getElementById("addProductForm");

const feedbackModal = document.getElementById("feedbackModal");
const feedbackProduct = document.getElementById("feedbackProduct");
const feedbackRating = document.getElementById("feedbackRating");
const feedbackComments = document.getElementById("feedbackComments");
const submitFeedbackBtn = document.getElementById("submitFeedbackBtn");
const cancelFeedbackBtn = document.getElementById("cancelFeedbackBtn");

const feedbackList = document.getElementById("feedbackList");

let isLogin = true;
let pendingListingForFeedback = null;

// =======================================================
// 🔐 AUTH SECTION
// =======================================================
toggleAuth.addEventListener("click", () => {
  isLogin = !isLogin;
  fullname.classList.toggle("hidden", isLogin);
  authTitle.textContent = isLogin ? "Login" : "Sign Up";
  authBtn.textContent = isLogin ? "Login" : "Create Account";
  toggleAuth.innerHTML = isLogin
    ? 'Don’t have an account? <span>Sign Up</span>'
    : 'Already have an account? <span>Login</span>';
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const mail = email.value.trim();
  const pass = password.value.trim();
  const name = fullname.value.trim();

  if (!mail || !pass) return alert("Please fill all fields");

  // SIGN UP
  if (!isLogin) {
    const res = await fetch(`${API_URL}/add-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FullName: name, Email: mail, PasswordHash: pass }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      toggleAuth.click();
    } else alert(data.error || "Signup failed");
    return;
  }

  // LOGIN
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: mail, Password: pass }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Login failed");
    currentUser = data.user;
    localStorage.setItem("user", JSON.stringify(currentUser));

    // Redirect admin → admin.html
    if (currentUser.Role === "admin") {
      window.location.href = "admin.html";
      return;
    }

    showMarketplace();
  } catch (err) {
    alert("Server error during login");
  }
});

function showMarketplace() {
  authSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");
  marketplaceSection.classList.remove("hidden");
  userName.textContent = currentUser.FullName || "User";
  dashboardBtn.style.display = "inline-block";

  // If admin → add Admin Panel button
  if (currentUser.Role === "admin") {
    const adminBtn = document.createElement("button");
    adminBtn.textContent = "🧑‍💼 Admin Panel";
    adminBtn.className = "btn-secondary";
    adminBtn.id = "adminBtn";
    adminBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });
    document.querySelector(".header-buttons").appendChild(adminBtn);
  }

  loadComponents();
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  location.reload();
});

// =======================================================
// 🧱 COMPONENTS
// =======================================================
viewProductsBtn.addEventListener("click", () => {
  addProductForm.classList.add("hidden");
  productContainer.classList.remove("hidden");
  viewProductsBtn.classList.add("active");
  addProductBtn.classList.remove("active");
  loadComponents();
});

addProductBtn.addEventListener("click", () => {
  productContainer.classList.add("hidden");
  addProductForm.classList.remove("hidden");
  addProductBtn.classList.add("active");
  viewProductsBtn.classList.remove("active");
});

addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return alert("Login first");

  const title = document.getElementById("title").value.trim();
  const projectName = document.getElementById("projectName").value.trim();
  const type = document.getElementById("type").value.trim();
  const price = Number(document.getElementById("price").value);
  const description = document.getElementById("description").value.trim();

  if (!title || !projectName || !type || !price)
    return alert("Please fill all fields");

  try {
    const res = await fetch(`${API_URL}/add-listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sellerId: currentUser.UserId,
        title,
        projectName,
        type,
        price,
        description,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      addProductForm.reset();
      viewProductsBtn.click();
    } else alert(data.error);
  } catch {
    alert("Server error");
  }
});

// =======================================================
// 💰 BUY COMPONENT
// =======================================================
async function loadComponents() {
  productContainer.innerHTML = "<p>Loading components...</p>";
  try {
    const res = await fetch(`${API_URL}/listings`);
    const items = await res.json();
    if (!items.length) {
      productContainer.innerHTML = "<p>No components available.</p>";
      return;
    }
    productContainer.innerHTML = "";
    items.forEach(it => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${escapeHtml(it.Title)}</h3>
        <p>${escapeHtml(it.Description || "")}</p>
        <p><b>Seller:</b> ${escapeHtml(it.SellerName)}</p>
        <p class="price">₹${it.Price}</p>
        ${
          currentUser?.UserId === it.SellerId
            ? `<span class="badge-own">Your item</span>`
            : `<button class="btn-primary buy-btn" data-id="${it.ListingId}" data-seller="${it.SellerId}">Buy</button>`
        }
      `;
      productContainer.appendChild(card);
    });

    document.querySelectorAll(".buy-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.dataset.id);
        const sid = Number(btn.dataset.seller);
        await buyComponent(id, sid);
      });
    });
  } catch (err) {
    productContainer.innerHTML = "<p>Error loading components</p>";
  }
}

async function buyComponent(listingId, sellerId) {
  if (sellerId === currentUser.UserId) return alert("You can’t buy your own item.");
  const amount = Number(prompt("Enter amount to pay:"));
  if (!amount) return;

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
  const data = await res.json();
  if (!res.ok) return alert(data.error);
  alert(data.message);
  pendingListingForFeedback = { listingId };
  openFeedbackModal(listingId);
  loadComponents();
}

// =======================================================
// ⭐ FEEDBACK
// =======================================================
function openFeedbackModal(componentId) {
  feedbackModal.classList.add("show");
  feedbackProduct.textContent = `Component ID: ${componentId}`;
  feedbackRating.value = "";
  feedbackComments.value = "";
}

cancelFeedbackBtn.onclick = () => feedbackModal.classList.remove("show");

submitFeedbackBtn.addEventListener("click", async () => {
  const rating = Number(feedbackRating.value);
  const comments = feedbackComments.value.trim();
  if (!rating) return alert("Enter rating 1–5");

  const res = await fetch(`${API_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      buyerId: currentUser.UserId,
      componentId: pendingListingForFeedback.listingId,
      rating,
      comments,
    }),
  });
  const data = await res.json();
  if (!res.ok) alert(data.error);
  else alert(data.message);
  feedbackModal.classList.remove("show");
  pendingListingForFeedback = null;
});

// =======================================================
// 📊 SELLER DASHBOARD
// =======================================================
dashboardBtn.addEventListener("click", async () => {
  marketplaceSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  feedbackList.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`${API_URL}/feedback/seller/${currentUser.UserId}`);
    const data = await res.json();
    if (!data.length) return (feedbackList.innerHTML = "<p>No feedback yet.</p>");
    feedbackList.innerHTML = "";
    data.forEach(f => {
      const div = document.createElement("div");
      div.className = "feedback-item";
      div.innerHTML = `
        <h4>${escapeHtml(f.ComponentName)}</h4>
        <p><b>Buyer:</b> ${escapeHtml(f.BuyerName)}</p>
        <p>⭐ ${f.Rating}/5</p>
        <p>${escapeHtml(f.Comments)}</p>
      `;
      feedbackList.appendChild(div);
    });
  } catch {
    feedbackList.innerHTML = "<p>Error loading feedback</p>";
  }
});

closeDashboardBtn.onclick = () => {
  dashboardSection.classList.add("hidden");
  marketplaceSection.classList.remove("hidden");
};

// =======================================================
// ⚙️ HELPERS
// =======================================================
function escapeHtml(s) {
  return s ? s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])) : "";
}

// =======================================================
// 🚀 INIT
// =======================================================
(() => {
  marketplaceSection.classList.add("hidden");
  dashboardSection.classList.add("hidden");
  feedbackModal.classList.remove("show");

  // Auto-redirect logged-in admin
  const savedUser = JSON.parse(localStorage.getItem("user"));
  if (savedUser && savedUser.Role === "admin") {
    window.location.href = "admin.html";
  }
})();
