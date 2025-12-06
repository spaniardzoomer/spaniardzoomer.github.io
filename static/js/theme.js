document.addEventListener('DOMContentLoaded', () => {
    // Select ALL theme toggle buttons (Desktop & Mobile)
    const toggleBtns = document.querySelectorAll('.theme-toggle');
    const root = document.documentElement;

    // Function to update ALL icons
    const updateIcons = () => {
        const isLight = root.getAttribute('data-theme') === 'light';
        toggleBtns.forEach(btn => {
            const icon = btn.querySelector('i');
            if(icon) icon.className = isLight ? 'ph ph-moon-stars' : 'ph ph-sun-dim';
        });
    };

    // Initialize
    updateIcons();

    // Attach Click Event to EACH button
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = root.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcons();
        });
    });
});
