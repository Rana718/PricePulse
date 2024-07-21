chrome.action.onClicked.addListener((tab) => {
    if (tab.url.includes("amazon.in")) {
        chrome.storage.local.set({ amazonURL: tab.url });
    } else {
        chrome.storage.local.set({ amazonURL: "Not an Amazon URL." });
    }
  });
  