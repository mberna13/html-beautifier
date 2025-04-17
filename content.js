console.log('[Formatter CS] ✅ content.js loaded in', window.location.href);

let cmInstance = null;

// 1. Handle right-click Format HTML message
chrome.runtime.onMessage.addListener((msg) => {
    console.log('[Formatter CS] 📩 onMessage fired:', msg);

    if (msg !== 'format-html') return;

    const ta = document.querySelector('textarea.fr-code');
    if (!cmInstance && ta) {
        console.log('[Formatter CS] 🛠️ Reinjection triggered');
        injectCodeMirror(ta);
    }

    if (!cmInstance) {
        console.warn('[Formatter CS] ⚠️ No CodeMirror instance available');
        showToast('Froala Code View is not active — please click into the editor and enable it again.');
        return;
    }

    console.log('[Formatter CS] 🎯 Formatting triggered');

    triggerFormat(cmInstance);
});

// 2. Beautify formatting logic
function triggerFormat(cm) {
    const raw = cm.getValue();
    console.log('[Formatter CS] ✍ Raw:', raw);

    const healed = new DOMParser()
        .parseFromString(`<div>${raw}</div>`, 'text/html')
        .body.firstElementChild?.innerHTML || raw;

    const pretty = html_beautify(healed, { indent_size: 2 });
    console.log('[Formatter CS] 🎨 Beautified:', pretty);

    if (pretty !== raw) {
        cm.setValue(pretty);
        showToast('✅ HTML formatted!');
    } else {
        showToast('Nothing changed — HTML may already be clean.');
    }
}

// 3. CodeMirror injection into Froala's <textarea class="fr-code">
function injectCodeMirror(ta) {
    if (!ta || ta._cmInjected) return;

    // Delay just a bit to let Froala stabilize layout
    setTimeout(() => {
        if (!ta || ta._cmInjected) return;
        ta._cmInjected = true;

        console.log('[Formatter CS] ✨ Injecting CodeMirror into', ta);

        const wrapper = document.createElement('div');
        ta.parentNode.insertBefore(wrapper, ta);
        ta.style.display = 'none';

        const cm = CodeMirror(wrapper, {
            value: ta.value,
            mode: 'xml',
            htmlMode: true,
            lineNumbers: true,
            autoCloseTags: true,
            matchTags: { bothTags: true }
        });

        cm.on('blur', () => {
            ta.value = cm.getValue();
        });

        cm.addKeyMap({ 'Ctrl-Shift-F': 'formatHTML' });

        CodeMirror.commands.formatHTML = function(cm) {
            triggerFormat(cm);
        };

        cmInstance = cm;
        console.log('[Formatter CS] ✅ CodeMirror initialized');
    }, 100); // ← delay lets Froala render textarea properly
}

// 4. Retry to detect Froala Code View (textarea.fr-code) for 5 seconds
function tryInjectCodeMirror() {
    const ta = document.querySelector('textarea.fr-code');

    if (ta && !cmInstance) {
        injectCodeMirror(ta);
    }
}

const observer = new MutationObserver(() => {
    const ta = document.querySelector('textarea.fr-code');
    if (ta && !cmInstance) {
        console.log('[Formatter CS] 👀 Detected textarea.fr-code via MutationObserver');
        injectCodeMirror(ta);
        observer.disconnect();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Also try immediately once on load
tryInjectCodeMirror();


// 5. Non-blocking toast-style message for UX
function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.top = '10px';
    toast.style.right = '10px';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '6px';
    toast.style.zIndex = '99999';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
