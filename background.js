chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "explainText",
        title: "Explain this text",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        id: "checkFact",
        title: "Fact-check this text",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!info.selectionText) return;

    const type = info.menuItemId;

    try {
        const response = await fetch("https://dobby-fact-checker-browser-extension.web3artisan.online/api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, text: info.selectionText })
        });

        let data;
        try {
            data = await response.json();
        } catch {
            data = { error: "Invalid JSON from server" };
        }

        // Гарантируем, что контент-скрипт подключён
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });

        chrome.tabs.sendMessage(tab.id, {
            action: "showResult",
            content: data
        });
    } catch (err) {
        chrome.tabs.sendMessage(tab.id, {
            action: "showResult",
            content: { error: err.message }
        });
    }
});
