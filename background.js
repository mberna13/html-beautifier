chrome.runtime.onInstalled.addListener(() => {
    console.log('[Formatter SW] onInstalled');
    chrome.contextMenus.create({
        id: 'format-html',
        title: 'Format HTML',
        contexts: ['all']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== 'format-html' || !tab?.id) return;

    chrome.webNavigation.getAllFrames({ tabId: tab.id }, (frames) => {
        frames.forEach((frame) => {
            setTimeout(() => {
                chrome.tabs.sendMessage(tab.id, 'format-html', { frameId: frame.frameId })
                    .then(() => {
                        console.log(`[Formatter SW] ✅ Sent to frame ${frame.frameId}`);
                    })
                    .catch((err) => {
                        if (err?.message?.includes("Receiving end does not exist")) return;
                        console.warn(`[Formatter SW] ❌ Frame ${frame.frameId} failed`, err.message);
                    });
            }, 100); // ← delay helps Froala stabilize in code view
        });
    });
});

