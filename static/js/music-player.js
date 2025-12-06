document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('music-player');
    const iconElement = document.getElementById('music-icon').firstElementChild; // the <i>
    const audio = new Audio('https://stream.zeno.fm/0r0xa792kwzuv');
    let isPlaying = false;

    // Helper to change icon cleanly
    const setIcon = (name, weight = '') => {
        iconElement.className = 'ph';                    // reset
        iconElement.classList.add(`ph-${name}`);
        if (weight) iconElement.classList.add(`ph-${weight}`);
    };

    player.addEventListener('click', () => {
        if (!isPlaying) {
            // First click: Start playing
            audio.play().then(() => {
                isPlaying = true;
                setIcon('speaker-simple-high', 'fill');   // Playing + sound on
                player.classList.remove('muted');
            }).catch(err => {
                console.log("Play failed (user didn't interact yet or blocked):", err);
            });
        } else {
            // Already playing → toggle mute
            audio.muted = !audio.muted;

            if (audio.muted) {
                setIcon('speaker-simple-slash', 'fill');         // Muted
                player.classList.add('muted');
            } else {
                setIcon('speaker-simple-high', 'fill');      // Sound back on
                player.classList.remove('muted');
            }
        }
    });

    // Optional: Auto-restore unmuted icon when stream actually starts making sound
    audio.addEventListener('playing', () => {
        if (isPlaying && !audio.muted) {
            setIcon('speaker-simple-high', 'fill');
        }
    });
});
