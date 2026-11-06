document.addEventListener('DOMContentLoaded', () => {
    const switches = document.querySelectorAll('.theme-switch');
    const root = document.documentElement;

    // The switch is "on" in dark mode; CSS moves the knob from the theme attribute.
    const sync = () => {
        const isDark = root.getAttribute('data-theme') !== 'light';
        switches.forEach(btn => btn.setAttribute('aria-checked', String(isDark)));
    };

    sync();

    switches.forEach(btn => {
        btn.addEventListener('click', () => {
            const newTheme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            sync();
        });
    });
});
