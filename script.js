// DOM Elements
const landingPage = document.getElementById('landing-page');
const playerView = document.getElementById('player-view');
const enterBtn = document.getElementById('enter-btn');
const backToLanding = document.getElementById('back-to-landing');

const trackImg = document.getElementById('track-img-main');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const currentTimeEl = document.getElementById('current-time');
const totalDurationEl = document.getElementById('total-duration');
const playPauseBtn = document.getElementById('play-pause');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const shuffleBtn = document.getElementById('shuffle');
const repeatBtn = document.getElementById('repeat');
const volumeWrapper = document.getElementById('volume-wrapper');
const volumeSlider = document.getElementById('volume-slider');
const playlistBtn = document.getElementById('playlist-btn');
// Outer overlay references retained for backward compatibility but not used
const playlistOverlay = document.getElementById('playlist-overlay');
const closePlaylist = document.getElementById('close-playlist');
const playlistItems = document.getElementById('playlist-items');
// New inner playlist elements
const innerPlaylist = document.getElementById('inner-playlist');
const innerPlaylistItems = document.getElementById('inner-playlist-items');
const closeInnerPlaylist = document.getElementById('close-inner-playlist');
const linearProgressWrapper = document.getElementById('linear-progress-wrapper');
const linearProgressBar = document.getElementById('linear-progress-bar');
const vinylWrapper = document.getElementById('vinyl-wrapper');
const progressCircle = document.getElementById('progress-circle');
const tiltCard = document.getElementById('tilt-card');
const dynamicBg = document.getElementById('dynamic-bg');
const visualizer = document.getElementById('visualizer');

// Playlist Data
const songs = [
    {
        title: "The Hills",
        artist: "The Weeknd",
        img: "the hills.jpg",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        color: "#ffffff"
    },
    {
        title: "Starboy",
        artist: "The Weeknd",
        img: "starboy.jpg",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        color: "#f8f9fa"
    },
    {
        title: "After Dark",
        artist: "Mr.Kitty",
        img: "after dark.jpg",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        color: "#f4f4f4"
    },
    {
        title: "Way Down We Go",
        artist: "KALEO",
        img: "kaleo.jpg",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        color: "#ffffff"
    },
    {
        title: "Midnight City",
        artist: "M83",
        img: "art1.png", // Kept default since an image wasn't provided for this one
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        color: "#f8f9fa"
    }
];

let isPlaying = false;
let songIndex = 0;
let isShuffle = false;
let isRepeat = false;
const audio = new Audio();

// Navigation Logic
enterBtn.addEventListener('click', () => {
    landingPage.classList.remove('active');
    setTimeout(() => {
        playerView.classList.add('active');
    }, 600);
});

backToLanding.addEventListener('click', () => {
    playerView.classList.remove('active');
    setTimeout(() => {
        landingPage.classList.add('active');
        if (isPlaying) pauseSong();
    }, 600);
});

// Circular Progress Setup
const radius = progressCircle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// Initialize
function loadSong(song) {
    trackTitle.innerText = song.title;
    trackArtist.innerText = song.artist;
    trackImg.src = song.img;
    audio.src = song.src;

    // Minimal Background shift (Neutral)
    dynamicBg.style.background = song.color;
    updatePlaylistActiveState();
}

function updatePlaylistActiveState() {
    const items = innerPlaylistItems.querySelectorAll('li');
    items.forEach((item, index) => {
        if (index === songIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function playSong() {
    isPlaying = true;
    playIcon.className = 'fas fa-pause';
    vinylWrapper.classList.add('playing');
    visualizer.classList.add('playing');
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    playIcon.className = 'fas fa-play';
    vinylWrapper.classList.remove('playing');
    visualizer.classList.remove('playing');
    audio.pause();
}

function prevSong() {
    songIndex--;
    if (songIndex < 0) songIndex = songs.length - 1;
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

function nextSong() {
    if (isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * songs.length);
        } while (newIndex === songIndex);
        songIndex = newIndex;
    } else {
        songIndex++;
        if (songIndex > songs.length - 1) songIndex = 0;
    }
    loadSong(songs[songIndex]);
    if (isPlaying) playSong();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    if (isNaN(duration)) return;

    const progressPercent = (currentTime / duration) * 100;
    setProgress(progressPercent);
    if (linearProgressBar) {
        linearProgressBar.style.width = `${progressPercent}%`;
    }

    const formatTime = (time) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    currentTimeEl.innerText = formatTime(currentTime);
    totalDurationEl.innerText = formatTime(duration);
}

// Minimal Tilt (Divided by 80 for extreme subtlety) 
tiltCard.addEventListener('mousemove', (e) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 80;
    const rotateY = (centerX - x) / 80;

    tiltCard.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
});

tiltCard.addEventListener('mouseleave', () => {
    tiltCard.style.transform = `perspective(2000px) rotateX(0deg) rotateY(0deg)`;
});

// Volume Interaction
volumeWrapper.addEventListener('click', (e) => {
    const width = volumeWrapper.clientWidth;
    const clickX = e.offsetX;
    const volumePercent = (clickX / width);
    audio.volume = volumePercent;
    volumeSlider.style.width = `${volumePercent * 100}%`;
});

// Playlist Population
function populatePlaylist() {
    if (playlistItems) playlistItems.innerHTML = ''; // Keep old one clear just in case
    innerPlaylistItems.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%">
                <div>
                    <h4 style="margin:0; font-size:0.9rem">${song.title}</h4>
                    <p style="margin:0; opacity:0.5; font-size:0.75rem; letter-spacing:1px">${song.artist}</p>
                </div>
                <span style="font-size:0.6rem; opacity:0.3">03:45</span>
            </div>
        `;
        li.addEventListener('click', () => {
            songIndex = index;
            loadSong(songs[songIndex]);
            playSong();
            innerPlaylist.classList.remove('active');
        });
        innerPlaylistItems.appendChild(li);
    });
}

// Global Event Listeners
playPauseBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => (isRepeat ? playSong() : nextSong()));

shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('active', isRepeat);
});

playlistBtn.addEventListener('click', () => innerPlaylist.classList.add('active'));
closeInnerPlaylist.addEventListener('click', () => innerPlaylist.classList.remove('active'));
// Keep old overlay buttons harmless
playlistOverlay && playlistOverlay.classList.remove('active');
closePlaylist && closePlaylist.addEventListener('click', () => playlistOverlay && playlistOverlay.classList.remove('active'));
// Linear progress bar seeking
linearProgressWrapper.addEventListener('click', (e) => {
    const width = linearProgressWrapper.offsetWidth;
    const clickX = e.offsetX;
    const percent = clickX / width;
    if (!isNaN(audio.duration)) {
        audio.currentTime = percent * audio.duration;
    }
});
// Initialization
loadSong(songs[songIndex]);
populatePlaylist();
console.log("Aetheris: Pure Sound Initialized");
