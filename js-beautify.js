// js-beautify.js
// Minimal HTML beautifier loader

(function(global) {
    function html_beautify(source_text, options) {
        options = options || {};
        const indent_size = options.indent_size || 2;
        const lines = source_text.split('\n');
        let result = '';
        let indent = '';

        for (let line of lines) {
            line = line.trim();

            if (line.startsWith('</')) {
                indent = indent.slice(0, -indent_size);
            }

            result += indent + line + '\n';

            if (
                line.startsWith('<') &&
                !line.startsWith('</') &&
                !line.endsWith('/>') &&
                !line.includes('</')
            ) {
                indent += ' '.repeat(indent_size);
            }
        }

        return result;
    }

    // Expose globally
    global.html_beautify = html_beautify;

})(typeof window !== 'undefined' ? window : global);
