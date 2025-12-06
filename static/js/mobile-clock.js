function updateMobileClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const clockEl = document.getElementById('clock-mobile');
    if(clockEl) clockEl.innerText = timeString;
}
setInterval(updateMobileClock, 1000);
updateMobileClock();
