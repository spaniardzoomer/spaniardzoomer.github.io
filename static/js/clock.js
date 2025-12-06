function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();

    // Options to format it like: "Tue 25 Nov 17:45"
    // You can tweak these options to change the format
    const options = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    };

    clockElement.textContent = now.toLocaleTimeString('en-GB', options);
}

// Run immediately so there is no delay on load
updateClock();
