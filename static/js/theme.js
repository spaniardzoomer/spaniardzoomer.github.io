// 1. Theme Logic
const toggleBtn = document.getElementById('theme-toggle');
const icon = toggleBtn.querySelector('i');
const root = document.documentElement;

// Function to update icon based on current theme
const updateIcon = () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    icon.className = isLight ? 'ph ph-moon-stars' : 'ph ph-sun-dim';
};

// Initialize icon on load
updateIcon();

toggleBtn.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateIcon();
});
