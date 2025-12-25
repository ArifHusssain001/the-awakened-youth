// Theme toggle script: toggles between light and dark modes and persists choice in localStorage
(function() {
    const THEME_KEY = 'aw_theme';
    const toggleId = 'themeToggle';

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }

        const btn = document.getElementById(toggleId);
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        if (btn) btn.setAttribute('aria-pressed', theme === 'dark');
    }

    function toggleTheme() {
        const current = localStorage.getItem(THEME_KEY) || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_KEY, next);
        applyTheme(next);
    }

    document.addEventListener('DOMContentLoaded', function() {
        // apply saved theme
        const saved = localStorage.getItem(THEME_KEY) || 'light';
        applyTheme(saved);

        // attach handler
        const btn = document.getElementById(toggleId);
        if (btn) btn.addEventListener('click', toggleTheme);
    });
})();
