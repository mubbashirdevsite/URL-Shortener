/* ==========================================
   File: script.js
   Project: URL Shortener
   Author: M Mubbashir Idrees
========================================== */

// ===============================
// Select Elements
// ===============================

const longUrlInput = document.getElementById("longUrl");
const shortUrlInput = document.getElementById("shortUrl");

const shortenBtn = document.getElementById("shortenBtn");
const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");
const clearBtn = document.getElementById("clearBtn");
const clearHistoryBtn = document.getElementById("clearHistory");

const loader = document.getElementById("loader");
const message = document.getElementById("message");
const historyList = document.getElementById("historyList");

// ===============================
// Load History
// ===============================

let history = JSON.parse(localStorage.getItem("urlHistory")) || [];

renderHistory();

// ===============================
// URL Validation
// ===============================

function isValidURL(url) {

    try {

        new URL(url);
        return true;

    } catch {

        return false;

    }

}

// ===============================
// Show Notification
// ===============================

function showMessage(text, type = "success") {

    message.textContent = text;

    switch (type) {

        case "success":
            message.style.color = "#4ade80";
            break;

        case "error":
            message.style.color = "#f87171";
            break;

        default:
            message.style.color = "#fde68a";

    }

}

// ===============================
// Generate Short URL
// ===============================

async function shortenURL() {

    const longURL = longUrlInput.value.trim();

    if (!longURL) {

        showMessage("Please enter a URL.", "error");
        return;

    }

    if (!isValidURL(longURL)) {

        showMessage("Please enter a valid URL.", "error");
        return;

    }

    loader.classList.remove("hidden");
    shortUrlInput.value = "";

    try {

        // TinyURL Public API
        const response = await fetch(
            `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longURL)}`
        );

        if (!response.ok) {
            throw new Error("Failed to shorten URL.");
        }

        const shortURL = await response.text();

        shortUrlInput.value = shortURL;

        loader.classList.add("hidden");

        showMessage("URL shortened successfully!");

        saveHistory(longURL, shortURL);

    } catch (error) {

        loader.classList.add("hidden");

        showMessage(error.message, "error");

    }

}

// ===============================
// Save History
// ===============================

function saveHistory(original, shortened) {

    history.unshift({

        original,
        shortened

    });

    // Keep latest 10 items
    history = history.slice(0, 10);

    localStorage.setItem(
        "urlHistory",
        JSON.stringify(history)
    );

    renderHistory();

}

// ===============================
// Render History
// ===============================

function renderHistory() {

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML =
            "<li>No history available.</li>";

        return;

    }

    history.forEach((item, index) => {

        const li = document.createElement("li");

        li.innerHTML = `

            <div class="history-link">

                <a href="${item.shortened}"
                   target="_blank">

                   ${item.shortened}

                </a>

            </div>

            <button
                class="delete-btn"
                data-index="${index}">

                Delete

            </button>

        `;

        historyList.appendChild(li);

    });

}

// ===============================
// Delete One Item
// ===============================

historyList.addEventListener("click", (e) => {

    if (!e.target.classList.contains("delete-btn")) return;

    const index = e.target.dataset.index;

    history.splice(index, 1);

    localStorage.setItem(
        "urlHistory",
        JSON.stringify(history)
    );

    renderHistory();

});

// ===============================
// Clear History
// ===============================

clearHistoryBtn.addEventListener("click", () => {

    history = [];

    localStorage.removeItem("urlHistory");

    renderHistory();

    showMessage("History cleared.");

});

// ===============================
// Copy URL
// ===============================

copyBtn.addEventListener("click", async () => {

    if (!shortUrlInput.value) {

        showMessage("Nothing to copy.", "error");

        return;

    }

    await navigator.clipboard.writeText(shortUrlInput.value);

    showMessage("Short URL copied!");

});

// ===============================
// Open URL
// ===============================

openBtn.addEventListener("click", () => {

    if (!shortUrlInput.value) {

        showMessage("Generate a URL first.", "error");

        return;

    }

    window.open(shortUrlInput.value, "_blank");

});

// ===============================
// Clear Form
// ===============================

clearBtn.addEventListener("click", () => {

    longUrlInput.value = "";
    shortUrlInput.value = "";
    message.textContent = "";

});

// ===============================
// Enter Key Support
// ===============================

longUrlInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        shortenURL();

    }

});

// ===============================
// Button Event
// ===============================

shortenBtn.addEventListener("click", shortenURL);