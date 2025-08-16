async function initOverlay() {
    if (!document.getElementById("dobby-checker-ai-overlay-container")) {
        const html = await fetch(chrome.runtime.getURL("overlay.html")).then(r => r.text());
        document.body.insertAdjacentHTML("beforeend", html);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("overlay.css");
        document.head.appendChild(link);
    }
}

function showResult(data) {
    const overlay = document.getElementById("dobby-checker-ai-overlay-container");
    if (!overlay) return;

    const errorEl = document.getElementById("dobby-checker-ai-error");
    const probEl = document.getElementById("dobby-checker-ai-probability");
    const reasonEl = document.getElementById("dobby-checker-ai-reason");
    const sourcesEl = document.getElementById("dobby-checker-ai-sources");
    const explanationEl = document.getElementById("dobby-checker-ai-explanation");

    [errorEl, probEl, reasonEl, sourcesEl, explanationEl].forEach(el => el.style.display = "none");

    if (data.error) {
        errorEl.textContent = data.error;
        errorEl.style.display = "block";
    } else {
        if (data.probability !== undefined) {
            probEl.querySelector("span").textContent = data.probability + "%";
            probEl.style.display = "block";
        }
        if (data.reason) {
            reasonEl.querySelector("span").textContent = data.reason;
            reasonEl.style.display = "block";
        }
        if (Array.isArray(data.sources) && data.sources.length) {
            const ul = sourcesEl.querySelector("ul");
            ul.innerHTML = "";
            data.sources.forEach(src => {
                const li = document.createElement("li");
                li.textContent = src;
                ul.appendChild(li);
            });
            sourcesEl.style.display = "block";
        }
        if (data.explanation) {
            explanationEl.querySelector("span").textContent = data.explanation;
            explanationEl.style.display = "block";
        }
    }

    overlay.classList.add("show");
}

chrome.runtime.onMessage.addListener(async (message) => {
    if (message.action === "showResult") {
        await initOverlay();
        showResult(message.content);
    }
});

document.addEventListener("click", (e) => {
    if (e.target.id === "dobby-checker-ai-close") {
        document.getElementById("dobby-checker-ai-overlay-container").classList.remove("show");
    }
});
