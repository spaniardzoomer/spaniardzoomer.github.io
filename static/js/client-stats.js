// Client Stats (Runs once on load)
document.addEventListener("DOMContentLoaded", () => {
    // Fetch Browser
    const ua = navigator.userAgent;
    let browser = "Web";
    
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    
    document.getElementById('stat-browser').innerText = browser;

    // Fetch Platform (e.g., "Linux x86_64", "MacIntel", "Win32")
    // Note: 'navigator.platform' is deprecated but widely supported for this specific "nerdy" string.
    // If you want a strictly modern approach, we can check User Agent, but Platform looks cooler.
    const platform = navigator.platform ? navigator.platform.split(' ')[0] : 'Web';
    document.getElementById('stat-os').innerText = platform;
});
