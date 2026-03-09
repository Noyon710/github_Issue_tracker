const API_ALL = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const API_SINGLE = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";

let issues = [];
let currentIssues = [];
let currentFilter = "all";

const currentPage = window.location.pathname.split("/").pop();

if (currentPage === "dashboard.html") {
  protectDashboard();
  loadIssues();
}

function login(event) {
  event.preventDefault();

  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) {
    alert("Enter username and password");
    return;
  }

  if (username === "admin" && password === "admin123") {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid username or password");
  }
}

function protectDashboard() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    window.location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}

function showLoader(show) {
  const loader = document.getElementById("loader");
  if (!loader) return;

  if (show) {
    loader.classList.remove("hidden");
  } else {
    loader.classList.add("hidden");
  }
}

function formatDate(dateString) {
  if (!dateString) return "1/15/2024";

  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  return date.toLocaleDateString("en-US");
}

function setActiveTab(type) {
  const tabs = ["all", "open", "closed"];

  tabs.forEach((tab) => {
    const btn = document.getElementById(`tab-${tab}`);
    if (!btn) return;

    if (tab === type) {
      btn.classList.remove("bg-white", "text-slate-600");
      btn.classList.add("bg-indigo-600", "text-white");
    } else {
      btn.classList.remove("bg-indigo-600", "text-white");
      btn.classList.add("bg-white", "text-slate-600");
    }
  });
}

function updateCounts(displayData = issues) {
  const open = issues.filter((issue) => issue.status === "open").length;
  const closed = issues.filter((issue) => issue.status === "closed").length;

  const visibleCount = document.getElementById("visibleCount");
  const openCount = document.getElementById("openCount");
  const closedCount = document.getElementById("closedCount");

  if (visibleCount) visibleCount.innerText = displayData.length;
  if (openCount) openCount.innerText = open;
  if (closedCount) closedCount.innerText = closed;
}

function getPriorityStyle(priority) {
  const value = (priority || "LOW").toUpperCase();

  if (value === "HIGH") {
    return {
      text: "HIGH",
      className: "bg-red-50 text-red-500"
    };
  }

  if (value === "MEDIUM") {
    return {
      text: "MEDIUM",
      className: "bg-yellow-100 text-yellow-600"
    };
  }

  return {
    text: "LOW",
    className: "bg-slate-100 text-slate-400"
  };
}

function getStatusMarkup(status) {
  if (status === "closed") {
    return `
      <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-500 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="8" stroke-width="2"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4"></path>
        </svg>
      </div>
    `;
  }

  return `
    <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="8" stroke-width="2" stroke-dasharray="3 2"></circle>
      </svg>
    </div>
  `;
}

function renderIssues(data) {
  const container = document.getElementById("issuesContainer");
  const emptyState = document.getElementById("emptyState");

  if (!container) return;

  container.innerHTML = "";

  if (!data.length) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  data.forEach((issue) => {
    const status = issue.status || "open";
    const title = issue.title || "Untitled Issue";
    const description = issue.description || "No description available.";
    const author = issue.author || "john_doe";
    const priority = getPriorityStyle(issue.priority);
    const borderColor = status === "closed" ? "border-violet-500" : "border-emerald-500";
    const statusIcon = getStatusMarkup(status);

    const card = document.createElement("div");
    card.className = `bg-white rounded-[14px] card-shadow border-t-[3px] ${borderColor} p-3.5 sm:p-4 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition flex flex-col min-h-[210px]`;

    card.innerHTML = `
      <div class="flex justify-between items-start gap-2 mb-3">
        ${statusIcon}

        <span class="text-[10px] font-semibold px-3 py-1 rounded-full ${priority.className}">
          ${priority.text}
        </span>
      </div>

      <h3 class="text-[14px] sm:text-[15px] font-bold leading-[1.35] text-slate-800 mb-2 line-clamp-2">
        ${title}
      </h3>

      <p class="text-slate-400 text-[11px] sm:text-[12px] leading-5 mb-3 line-clamp-3">
        ${description}
      </p>

      <div class="flex flex-wrap gap-2 mb-4">
        <span class="text-[9px] sm:text-[10px] px-2 py-1 rounded-full bg-red-50 text-red-400 border border-red-200">
          BUG
        </span>

        <span class="text-[9px] sm:text-[10px] px-2 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
          HELP WANTED
        </span>
      </div>

      <div class="mt-auto text-slate-400 text-[10px] sm:text-[11px] leading-5 pt-3 border-t border-slate-100">
        <div>#${issue.id} by ${author}</div>
        <div>${formatDate(issue.created_at)}</div>
      </div>
    `;

    card.addEventListener("click", () => openIssue(issue.id));
    container.appendChild(card);
  });
}

async function loadIssues() {
  try {
    showLoader(true);

    const response = await fetch(API_ALL);
    const data = await response.json();

    issues = data.data || [];
    currentIssues = [...issues];

    setActiveTab("all");
    updateCounts(currentIssues);
    renderIssues(currentIssues);
  } catch (error) {
    const container = document.getElementById("issuesContainer");
    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center bg-red-50 text-red-500 border border-red-200 rounded-2xl p-6">
          Failed to load issues.
        </div>
      `;
    }
  } finally {
    showLoader(false);
  }
}

function filterIssues(type) {
  currentFilter = type;
  setActiveTab(type);

  if (type === "all") {
    currentIssues = [...issues];
  } else {
    currentIssues = issues.filter((issue) => issue.status === type);
  }

  const searchInput = document.getElementById("search");
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (searchText) {
    const filtered = currentIssues.filter((issue) =>
      (issue.title || "").toLowerCase().includes(searchText)
    );
    updateCounts(filtered);
    renderIssues(filtered);
  } else {
    updateCounts(currentIssues);
    renderIssues(currentIssues);
  }
}

function searchIssues() {
  const searchInput = document.getElementById("search");
  const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";

  if (!searchText) {
    updateCounts(currentIssues);
    renderIssues(currentIssues);
    return;
  }

  const filtered = currentIssues.filter((issue) =>
    (issue.title || "").toLowerCase().includes(searchText)
  );

  updateCounts(filtered);
  renderIssues(filtered);
}

async function openIssue(id) {
  try {
    const response = await fetch(`${API_SINGLE}${id}`);
    const data = await response.json();
    const issue = data.data;

    const modal = document.getElementById("modal");
    const issueDetails = document.getElementById("issueDetails");

    if (!modal || !issueDetails) return;

    const status = issue.status || "open";
    const priority = getPriorityStyle(issue.priority);

    const statusBadge =
      status === "closed"
        ? `<span class="inline-flex items-center rounded-full bg-violet-500 text-white text-sm font-medium px-4 py-2">Closed</span>`
        : `<span class="inline-flex items-center rounded-full bg-emerald-500 text-white text-sm font-medium px-4 py-2">Opened</span>`;

    issueDetails.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl sm:text-3xl lg:text-[40px] font-bold text-slate-800 leading-tight mb-4">
            ${issue.title}
          </h2>

          <div class="flex flex-wrap items-center gap-3 text-slate-500 text-sm sm:text-base">
            ${statusBadge}
            <span>•</span>
            <span>Opened by ${issue.author || "Fahim Ahmed"}</span>
            <span>•</span>
            <span>${formatDate(issue.created_at)}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <span class="text-sm px-4 py-2 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
            BUG
          </span>
          <span class="text-sm px-4 py-2 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200 font-medium">
            HELP WANTED
          </span>
        </div>

        <p class="text-slate-500 text-base sm:text-lg leading-8 max-w-4xl">
          ${issue.description || "No description available."}
        </p>

        <div class="border-2 border-sky-500 rounded-md p-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="border border-sky-400 border-dashed rounded p-4">
              <p class="text-base text-slate-500 mb-2">Assignee:</p>
              <p class="text-xl sm:text-2xl font-bold text-slate-800">
                ${issue.author || "Fahim Ahmed"}
              </p>
            </div>

            <div class="border border-sky-400 border-dashed rounded p-4">
              <p class="text-base text-slate-500 mb-3">Priority:</p>
              <span class="px-5 py-2 rounded-full text-sm font-semibold inline-block ${priority.className}">
                ${priority.text}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            onclick="closeModal()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white text-base sm:text-lg font-semibold px-6 py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  } catch (error) {
    alert("Failed to load issue details");
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function openNewIssue() {
  const title = prompt("Enter issue title:");
  if (!title) {
    alert("Title is required!");
    return;
  }

  const description = prompt("Enter issue description:") || "";
  const author = prompt("Enter author name:") || "anonymous";
  const statusInput = prompt("Enter state (open/closed):", "open") || "open";
  const priorityInput = prompt("Enter priority (HIGH, MEDIUM, LOW):", "LOW") || "LOW";

  const status = statusInput.toLowerCase() === "closed" ? "closed" : "open";
  const priority = priorityInput.toUpperCase();

  const newIssue = {
    id: issues.length ? Math.max(...issues.map((item) => item.id)) + 1 : 1,
    title,
    description,
    author,
    status,
    priority,
    created_at: new Date().toISOString()
  };

  issues.unshift(newIssue);
  filterIssues(currentFilter);
}

const modal = document.getElementById("modal");
if (modal) {
  modal.addEventListener("click", function (e) {
    if (e.target.id === "modal") {
      closeModal();
    }
  });
}