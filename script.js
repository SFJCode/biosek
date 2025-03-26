const dbName = "ProfileDB";
const storeName = "profileData";
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath: 'key' });
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = function(event) {
            console.error('Ошибка инициализации IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

function saveToDB(key, value) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ key, value });

        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function(event) {
            console.error(`Ошибка сохранения данных в IndexedDB (${key}):`, event.target.error);
            reject(event.target.error);
        };
    });
}

function loadFromDB(key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = function(event) {
            if (event.target.result) {
                resolve(event.target.result.value);
            } else {
                resolve(null);
            }
        };

        request.onerror = function(event) {
            console.error(`Ошибка загрузки данных из IndexedDB (${key}):`, event.target.error);
            reject(event.target.error);
        };
    });
}

const audioManager = {
    audio: new Audio(),
    isPlaying: false,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    trackName: '-',
    init() {
        this.audio.preload = 'metadata';
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
            document.getElementById('duration').textContent = this.formatTime(this.duration);
        });
        this.audio.addEventListener('timeupdate', () => {
            this.currentTime = this.audio.currentTime;
            document.getElementById('currentTime').textContent = this.formatTime(this.currentTime);
            const progressPercent = (this.currentTime / this.duration) * 100;
            document.getElementById('progressBar').value = progressPercent;
        });
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        });
        this.audio.addEventListener('error', () => {
            console.error('Ошибка воспроизведения аудиофайла');
            alert('Не удалось воспроизвести аудиофайл. Попробуйте загрузить другой файл.');
            this.reset();
        });

        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', () => {
                this.audio.volume = volumeSlider.value / 100;
                if (this.audio.volume === 0) {
                    this.isMuted = true;
                    document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-mute"></i>';
                } else {
                    this.isMuted = false;
                    document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
                }
            });
        }
    },
    play() {
        this.audio.play().then(() => {
            this.isPlaying = true;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        }).catch(error => {
            console.error('Ошибка воспроизведения:', error);
            alert('Не удалось воспроизвести аудиофайл. Попробуйте другой файл.');
            this.reset();
        });
    },
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    },
    toggleMute() {
        if (this.isMuted) {
            this.audio.volume = document.getElementById('volumeSlider').value / 100;
            this.isMuted = false;
            document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            this.audio.volume = 0;
            this.isMuted = true;
            document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    },
    setSource(src) {
        this.audio.src = src;
        this.audio.load();
    },
    setTime(time) {
        this.audio.currentTime = time;
        this.currentTime = time;
    },
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    reset() {
        this.audio.src = '';
        this.isPlaying = false;
        this.isMuted = false;
        this.currentTime = 0;
        this.duration = 0;
        this.trackName = '-';
        document.getElementById('trackName').textContent = this.trackName;
        document.getElementById('currentTime').textContent = '00:00';
        document.getElementById('duration').textContent = '00:00';
        document.getElementById('progressBar').value = 0;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
        document.getElementById('volumeSlider').value = 100;
    }
};

function initMediaPlayer() {
    audioManager.init();

    const playPauseBtn = document.getElementById('playPauseBtn');
    const skipBackwardBtn = document.getElementById('skipBackwardBtn');
    const skipForwardBtn = document.getElementById('skipForwardBtn');
    const progressBar = document.getElementById('progressBar');
    const muteBtn = document.getElementById('muteBtn');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audioManager.isPlaying) {
                audioManager.pause();
            } else {
                audioManager.play();
            }
        });
    }

    if (skipBackwardBtn) {
        skipBackwardBtn.addEventListener('click', () => {
            const newTime = Math.max(0, audioManager.currentTime - 10);
            audioManager.setTime(newTime);
        });
    }

    if (skipForwardBtn) {
        skipForwardBtn.addEventListener('click', () => {
            const newTime = Math.min(audioManager.duration, audioManager.currentTime + 10);
            audioManager.setTime(newTime);
        });
    }

    if (progressBar) {
        progressBar.addEventListener('input', () => {
            const newTime = (progressBar.value / 100) * audioManager.duration;
            audioManager.setTime(newTime);
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            audioManager.toggleMute();
        });
    }

    loadFromDB('profileData').then(profileData => {
        if (profileData && profileData.audio) {
            const audioURL = URL.createObjectURL(profileData.audio);
            audioManager.setSource(audioURL);
            audioManager.trackName = profileData.audioName || '-';
            document.getElementById('trackName').textContent = audioManager.trackName;
        }
    }).catch(error => {
        console.error('Ошибка загрузки аудиофайла из IndexedDB:', error);
    });
}

function updateProfile() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    const avatarInput = document.getElementById('avatarInput');
    const backgroundInput = document.getElementById('backgroundInput');
    const audioInput = document.getElementById('audioInput');
    const titleInput = document.getElementById('titleInput').value;
    const nameInput = document.getElementById('nameInput').value;
    const descriptionInput = document.getElementById('descriptionInput').value;
    let telegramLinkInput = document.getElementById('telegramLinkInput').value;
    const accentColor = document.getElementById('accentColor').value;
    const textColor = document.getElementById('textColor').value;
    const backgroundColor = document.getElementById('backgroundColor').value;
    const borderColor = document.getElementById('borderColor').value;
    const mediaPlayerBgColor = document.getElementById('mediaPlayerBgColor').value;
    const mediaPlayerBtnColor = document.getElementById('mediaPlayerBtnColor').value;
    const progressBarColor = document.getElementById('progressBarColor').value;
    const profileOpacity = document.getElementById('profileOpacity').value;
    const profileBlur = document.getElementById('profileBlur').value;
    const monochromeIcons = document.getElementById('monochromeIcons').checked;
    const animatedTitle = document.getElementById('animatedTitle').checked;
    const enableParticles = document.getElementById('enableParticles').checked;
    const particleType = document.getElementById('particleType').value;

    if (telegramLinkInput && !telegramLinkInput.startsWith('https://')) {
        telegramLinkInput = `https://${telegramLinkInput}`;
    }

    const profileData = {
        title: titleInput || '',
        name: nameInput || '',
        description: descriptionInput || '',
        telegramLink: telegramLinkInput || '',
        backgroundColor: backgroundColor || '#1c2526',
        accentColor: accentColor || '#f39c12',
        textColor: textColor || '#ffffff',
        borderColor: borderColor || '#ffffff',
        mediaPlayerBgColor: mediaPlayerBgColor || '#4834d4',
        mediaPlayerBtnColor: mediaPlayerBtnColor || '#6c5ce7',
        progressBarColor: progressBarColor || '#e84118',
        opacity: profileOpacity || '100',
        blur: profileBlur || '0',
        monochromeIcons: monochromeIcons || false,
        animatedTitle: animatedTitle || false,
        enableParticles: enableParticles || false,
        particleType: particleType || 'snowflakes'
    };

    loadFromDB('profileData').then(existingData => {
        if (!existingData) existingData = {};

        function processFile(input, key, nameKey) {
            return new Promise((resolve) => {
                if (input.files && input.files[0]) {
                    const file = input.files[0];

                    if (file.size > 50 * 1024 * 1024) {
                        alert(`Ошибка: Файл для ${key} слишком большой. Максимальный размер — 50 МБ.`);
                        resolve();
                        return;
                    }

                    const fileName = file.name.toLowerCase();
                    if (key === 'audio') {
                        const supportedAudioFormats = ['.mp3', '.wav', '.ogg', '.m4a'];
                        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
                        if (!supportedAudioFormats.includes(fileExtension)) {
                            alert(`Ошибка: Файл для ${key} должен быть аудиофайлом (поддерживаемые форматы: ${supportedAudioFormats.join(', ')}).`);
                            resolve();
                            return;
                        }
                        profileData[key] = file;
                        profileData[nameKey] = file.name;
                    } else {
                        const supportedImageFormats = ['.jpg', '.jpeg', '.png', '.gif'];
                        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
                        if (!supportedImageFormats.includes(fileExtension)) {
                            alert(`Ошибка: Файл для ${key} должен быть изображением (поддерживаемые форматы: ${supportedImageFormats.join(', ')}).`);
                            resolve();
                            return;
                        }
                        profileData[key] = file;
                    }
                    resolve();
                } else {
                    if (key === 'avatar') {
                        profileData[key] = existingData[key] || 'https://via.placeholder.com/100';
                    } else if (key === 'audio') {
                        profileData[key] = existingData[key] || null;
                        profileData[nameKey] = existingData[nameKey] || '-';
                    } else {
                        profileData[key] = existingData[key] || null;
                    }
                    resolve();
                }
            });
        }

        Promise.all([
            processFile(avatarInput, 'avatar'),
            processFile(backgroundInput, 'backgroundImage'),
            processFile(audioInput, 'audio', 'audioName')
        ])
        .then(() => {
            return saveToDB('profileData', profileData);
        })
        .then(() => {
            return saveToDB('isLoggedIn', 'false');
        })
        .then(() => {
            loadingIndicator.style.display = 'none';
            closePanel();
            alert('Изменения успешно сохранены!');
        })
        .catch(error => {
            loadingIndicator.style.display = 'none';
            console.error('Ошибка при сохранении профиля:', error);
            alert('Произошла ошибк при сохранении изменений: ' + error.message + '. Попробуйте снова.');
        });
    }).catch(error => {
        loadingIndicator.style.display = 'none';
        console.error('Ошибка загрузки существующих данных из IndexedDB:', error);
        alert('Произошла ошибка при загрузке данных: ' + error.message + '. Попробуйте снова.');
    });
}

function loadProfileData() {
    const bodyBackground = document.getElementById('bodyBackground');
    const profileHeader = document.getElementById('profileHeader');
    const profileBackground = document.getElementById('profileBackground');
    const mediaPlayer = document.getElementById('mediaPlayer');
    const progressBar = document.getElementById('progressBar');
    const controlButtons = document.querySelectorAll('.control-btn');
    const descriptionElement = document.getElementById('profileDescription');
    const titleElement = document.getElementById('profileTitle');
    const usernameElement = document.getElementById('profileUsername');

    loadFromDB('profileData').then(profileData => {
        if (!profileData) {
            profileData = {};
        }

        if (profileData.avatar) {
            if (typeof profileData.avatar === 'string') {
                document.getElementById('profileAvatar').src = profileData.avatar;
            } else {
                document.getElementById('profileAvatar').src = URL.createObjectURL(profileData.avatar);
            }
        } else {
            document.getElementById('profileAvatar').src = 'https://via.placeholder.com/100';
        }

        document.getElementById('telegramLink').href = profileData.telegramLink || '#';
        if (descriptionElement) {
            descriptionElement.textContent = profileData.description || '';
            descriptionElement.setAttribute('data-text', profileData.description || '');
        }
        titleElement.textContent = profileData.title || 'Profile Title';
        usernameElement.textContent = profileData.name || 'Username';
        
        if (profileData.animatedTitle) {
            titleElement.classList.add('animated');
        }

        bodyBackground.style.backgroundColor = profileData.backgroundColor || '#1c2526';
        if (profileData.backgroundImage) {
            bodyBackground.style.backgroundImage = `url(${URL.createObjectURL(profileData.backgroundImage)})`;
            bodyBackground.style.backgroundSize = 'cover';
            bodyBackground.style.backgroundPosition = 'center';
            bodyBackground.style.backgroundAttachment = 'fixed';
        } else {
            bodyBackground.style.backgroundImage = 'none';
        }

        profileHeader.style.opacity = (profileData.opacity || '100') / 100;
        profileBackground.style.filter = `blur(${profileData.blur || '0'}px)`;
        profileHeader.style.boxShadow = `0 0 20px ${profileData.borderColor || '#ffffff'}`;
        mediaPlayer.style.boxShadow = `0 0 20px ${profileData.borderColor || '#ffffff'}`;

        mediaPlayer.style.background = profileData.mediaPlayerBgColor || '#4834d4';
        progressBar.style.setProperty('--progress-bar-color', profileData.progressBarColor || '#e84118');
        controlButtons.forEach(btn => {
            btn.style.background = profileData.mediaPlayerBtnColor || '#6c5ce7';
        });

        document.getElementById('titleInput').value = profileData.title || '';
        document.getElementById('nameInput').value = profileData.name || '';
        document.getElementById('descriptionInput').value = profileData.description || '';
        document.getElementById('telegramLinkInput').value = profileData.telegramLink ? profileData.telegramLink.replace('https://', '') : '';
        document.getElementById('backgroundColor').value = profileData.backgroundColor || '#1c2526';
        document.getElementById('accentColor').value = profileData.accentColor || '#f39c12';
        document.getElementById('textColor').value = profileData.textColor || '#ffffff';
        document.getElementById('borderColor').value = profileData.borderColor || '#ffffff';
        document.getElementById('mediaPlayerBgColor').value = profileData.mediaPlayerBgColor || '#4834d4';
        document.getElementById('mediaPlayerBtnColor').value = profileData.mediaPlayerBtnColor || '#6c5ce7';
        document.getElementById('progressBarColor').value = profileData.progressBarColor || '#e84118';
        document.getElementById('profileOpacity').value = profileData.opacity || '100';
        document.getElementById('profileBlur').value = profileData.blur || '0';
        document.getElementById('monochromeIcons').checked = profileData.monochromeIcons || false;
        document.getElementById('animatedTitle').checked = profileData.animatedTitle || false;
        document.getElementById('enableParticles').checked = profileData.enableParticles || false;
        document.getElementById('particleType').value = profileData.particleType || 'snowflakes';

        typeWriterEffect();
    }).catch(error => {
        console.error('Ошибка загрузки данных профиля из IndexedDB:', error);
        alert('Произошла ошибка при загрузке данных профиля: ' + error.message + '. Попробуйте снова.');
    });
}

function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    loadFromDB('profileData').then(profileData => {
        if (!profileData) profileData = {};
        const enableParticles = profileData.enableParticles || false;
        const particleType = profileData.particleType || 'snowflakes';

        const backgroundParticles = [];
        const cursorParticles = [];
        let lastParticleTime = 0;
        const particleInterval = 100;

        if (enableParticles) {
            for (let i = 0; i < 100; i++) {
                backgroundParticles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 5 + 2,
                    speedY: Math.random() * 2 + 1,
                });
            }
        }

        document.addEventListener('mousemove', (e) => {
            const currentTime = Date.now();
            if (currentTime - lastParticleTime < particleInterval) return;

            lastParticleTime = currentTime;
            const particle = {
                x: e.clientX,
                y: e.clientY,
                life: 60,
                speedX: (Math.random() - 0.5) * 4,
                speedY: (Math.random() - 0.5) * 4,
            };
            cursorParticles.push(particle);
        });

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (enableParticles) {
                backgroundParticles.forEach(p => {
                    p.y += p.speedY;
                    if (p.y > canvas.height) p.y = 0;

                    ctx.beginPath();
                    if (particleType === 'snowflakes') {
                        ctx.font = `${p.size}px Arial`;
                        ctx.fillText('❄', p.x, p.y);
                    } else if (particleType === 'circles') {
                        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (particleType === 'stars') {
                        ctx.font = `${p.size}px Arial`;
                        ctx.fillText('✨', p.x, p.y);
                    }
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fill();
                });
            }

            for (let i = cursorParticles.length - 1; i >= 0; i--) {
                const p = cursorParticles[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.life--;

                if (p.life <= 0) {
                    cursorParticles.splice(i, 1);
                    continue;
                }

                ctx.font = '12px Arial';
                ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 60})`;
                ctx.fillText('✖', p.x, p.y);
            }

            requestAnimationFrame(animateParticles);
        }

        animateParticles();
    });
}

const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
    #progressBar::-webkit-slider-thumb {
        background: var(--progress-bar-color, #e84118);
    }
    #progressBar::-webkit-slider-runnable-track {
        background: var(--progress-bar-color, #e84118);
    }
`;
document.head.appendChild(styleSheet);

window.onload = function() {
    initDB().then(() => {
        initParticles();
        loadProfileData();
        initMediaPlayer();
    }).catch(error => {
        console.error('Ошибка инициализации IndexedDB:', error);
        alert('Не удалось инициализировать базу данных: ' + error.message + '. Попробуйте снова.');
    });
};