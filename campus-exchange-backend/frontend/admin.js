// =======================================================
// 🧑‍💼 CAMPUS EXCHANGE ADMIN PANEL
// Built by Adarsh L (PES2UG23CS025)
// Final Polished Version — Refunds, Resets, Tables
// =======================================================

const API_URL = "http://localhost:5000";

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const usersTable = document.getElementById("usersTable");
const availableTable = document.getElementById("availableTable");
const overviewTable = document.getElementById("overviewTable");

// -------------------------------------------------------
// LOGOUT FUNCTION
// -------------------------------------------------------
logoutBtn.onclick = () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
};

// -------------------------------------------------------
// REFRESH DATA
// -------------------------------------------------------
refreshBtn.onclick = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  loadAllData();
};

// -------------------------------------------------------
// LOAD ALL DATA (Users, Components, Transactions)
// -------------------------------------------------------
async function loadAllData() {
  usersTable.innerHTML = "<tr><td>Loading users...</td></tr>";
  availableTable.innerHTML = "<tr><td>Loading available components...</td></tr>";
  overviewTable.innerHTML = "<tr><td>Loading transactions...</td></tr>";

  try {
    const [usersRes, availableRes, overviewRes] = await Promise.all([
      fetch(`${API_URL}/admin/users`),
      fetch(`${API_URL}/admin/available-items`),
      fetch(`${API_URL}/admin/overview`)
    ]);

    const [users, available, overview] = await Promise.all([
      usersRes.json(),
      availableRes.json(),
      overviewRes.json()
    ]);

    renderUsers(users);
    renderAvailable(available);
    renderOverview(overview);
  } catch (err) {
    console.error("Error loading admin data:", err);
    alert("⚠️ Failed to load admin data. Please check the backend connection.");
  }
}

// -------------------------------------------------------
// USERS TABLE
// -------------------------------------------------------
function renderUsers(data) {
  if (!data.length) return (usersTable.innerHTML = "<tr><td>No users found.</td></tr>");
  let html = `
    <tr>
      <th>ID</th><th>Name</th><th>Department</th><th>Role</th>
    </tr>`;
  data.forEach(u => {
    html += `
      <tr>
        <td>${u.UserId}</td>
        <td>${escapeHtml(u.UserName)}</td>
        <td>${escapeHtml(u.Department)}</td>
        <td>${escapeHtml(u.Role)}</td>
      </tr>`;
  });
  usersTable.innerHTML = html;
}

// -------------------------------------------------------
// AVAILABLE COMPONENTS TABLE
// -------------------------------------------------------
function renderAvailable(data) {
  if (!data.length) return (availableTable.innerHTML = "<tr><td>No available components found.</td></tr>");
  let html = `
    <tr>
      <th>ID</th><th>Name</th><th>Type</th><th>Price</th>
      <th>Project</th><th>Seller</th><th>Action</th>
    </tr>`;
  data.forEach(a => {
    html += `
      <tr>
        <td>${a.ComponentId}</td>
        <td>${escapeHtml(a.ComponentName)}</td>
        <td>${escapeHtml(a.Type)}</td>
        <td>₹${a.Price}</td>
        <td>${escapeHtml(a.ProjectTitle)}</td>
        <td>${escapeHtml(a.SellerName)}</td>
        <td>
          <button class="btn-secondary small resetBtn" data-id="${a.ComponentId}">
            ♻ Reset
          </button>
        </td>
      </tr>`;
  });
  availableTable.innerHTML = html;

  document.querySelectorAll(".resetBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      btn.disabled = true;
      btn.textContent = "⏳ Resetting...";
      await handleReset(id);
      btn.textContent = "♻ Reset";
      btn.disabled = false;
    });
  });
}

// -------------------------------------------------------
// TRANSACTIONS & FEEDBACK TABLE
// -------------------------------------------------------
function renderOverview(data) {
  if (!data.length) return (overviewTable.innerHTML = "<tr><td>No transactions yet.</td></tr>");
  let html = `
    <tr>
      <th>ID</th><th>Component</th><th>Project</th>
      <th>Seller</th><th>Buyer</th><th>Status</th>
      <th>Amount</th><th>Payment</th><th>Date</th>
      <th>Rating</th><th>Feedback</th><th>Action</th>
    </tr>`;
  data.forEach(o => {
    html += `
      <tr>
        <td>${o.ComponentId}</td>
        <td>${escapeHtml(o.ComponentName)}</td>
        <td>${escapeHtml(o.ProjectTitle)}</td>
        <td>${escapeHtml(o.SellerName)}</td>
        <td>${escapeHtml(o.BuyerName)}</td>
        <td>${escapeHtml(o.ComponentStatus)}</td>
        <td>₹${o.Amount || "-"}</td>
        <td>${escapeHtml(o.PaymentMethod || "-")}</td>
        <td>${formatDate(o.TransactionDate)}</td>
        <td>${o.Rating || "-"}</td>
        <td>${escapeHtml(o.Comments || "-")}</td>
        <td>
          ${
            o.ComponentStatus === "Sold"
              ? `<button class="btn-primary small refundBtn" data-id="${o.ComponentId}">
                   💸 Refund
                 </button>`
              : `<span style="color:gray;">–</span>`
          }
        </td>
      </tr>`;
  });
  overviewTable.innerHTML = html;

  document.querySelectorAll(".refundBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);
      btn.disabled = true;
      btn.textContent = "⏳ Processing...";
      await handleRefund(id);
      btn.textContent = "💸 Refund";
      btn.disabled = false;
    });
  });
}

// -------------------------------------------------------
// REFUND COMPONENT TRANSACTION
// -------------------------------------------------------
async function handleRefund(componentId) {
  if (!confirm("Are you sure you want to refund this transaction?")) return;
  try {
    const res = await fetch(`${API_URL}/admin/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ componentId })
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadAllData();
  } catch (err) {
    console.error("Refund error:", err);
    alert("⚠️ Refund failed. Please try again.");
  }
}

// -------------------------------------------------------
// RESET COMPONENT STATUS
// -------------------------------------------------------
async function handleReset(componentId) {
  if (!confirm("Reset this component to Available?")) return;
  try {
    const res = await fetch(`${API_URL}/admin/reset-component`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ componentId })
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadAllData();
  } catch (err) {
    console.error("Reset error:", err);
    alert("⚠️ Reset failed. Please try again.");
  }
}

// -------------------------------------------------------
// DATE FORMATTER
// -------------------------------------------------------
function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// -------------------------------------------------------
// UTIL - SAFE HTML
// -------------------------------------------------------
function escapeHtml(str) {
  return str
    ? str.toString().replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
    : "";
}

// -------------------------------------------------------
// INIT
// -------------------------------------------------------
window.addEventListener("load", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.Role !== "admin") {
    alert("❌ Access denied. Redirecting...");
    return (window.location.href = "index.html");
  }
  loadAllData();
});
