CodeMirror.findMatchingTag = function(cm, pos, range) {
    const maxLine = cm.lastLine();
    range = range || { from: 0, to: maxLine };

    const iter = cm.getSearchCursor(/<\/?[\w-]+/gi, CodeMirror.Pos(range.from, 0));

    let stack = [];
    let match = null;

    while (iter.findNext()) {
        const text = iter.match?.[0]; // 👈 safely access match
        if (!text) continue;
        const isOpen = text.charAt(1) !== '/';
        const tag = text.replace(/^<\/?|\/?>$/g, '');

        if (isOpen) {
            stack.push({ tag, pos: iter.from() });
        } else {
            while (stack.length) {
                const top = stack.pop();
                if (top.tag === tag) {
                    match = {
                        open: isOpen ? iter.from() : top.pos,
                        close: isOpen ? top.pos : iter.from(),
                        tag
                    };
                    break;
                }
            }
        }

        if (match && (
            CodeMirror.cmpPos(match.open, pos) <= 0 &&
            CodeMirror.cmpPos(match.close, pos) >= 0
        )) {
            return match;
        }
    }

    return null;
};
