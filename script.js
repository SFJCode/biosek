function updateProfile() {
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

    if (avatarInput.files && avatarInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileData.avatar = e.target.result;
            localStorage.setItem('profileData', JSON.stringify(profileData));
            localStorage.setItem('isLoggedIn', 'false');
            window.location.href = '/bio.html';
        };
        reader.readAsDataURL(avatarInput.files[0]);
    }

    if (backgroundInput.files && backgroundInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileData.backgroundImage = e.target.result;
            localStorage.setItem('profileData', JSON.stringify(profileData));
            localStorage.setItem('isLoggedIn', 'false');
            window.location.href = '/bio.html';
        };
        reader.readAsDataURL(backgroundInput.files[0]);
    }

    if (audioInput.files && audioInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileData.audio = e.target.result;
            profileData.audioName = audioInput.files[0].name;
            localStorage.setItem('profileData', JSON.stringify(profileData));
            localStorage.setItem('isLoggedIn', 'false');
            window.location.href = '/bio.html';
        };
        reader.readAsDataURL(audioInput.files[0]);
    }

    const existingData = JSON.parse(localStorage.getItem('profileData')) || {};
    profileData.avatar = profileData.avatar || existingData.avatar || 'https://via.placeholder.com/100';
    profileData.audio = profileData.audio || existingData.audio || '';
    profileData.audioName = profileData.audioName || existingData.audioName || '-';
    localStorage.setItem('profileData', JSON.stringify(profileData));
    localStorage.setItem('isLoggedIn', 'false');
    window.location.href = '/bio.html';
}

function loadProfileData() {
    const profileData = JSON.parse(localStorage.getItem('profileData')) || {};
    const bodyBackground = document.getElementById('bodyBackground');
    const profileHeader = document.getElementById('profileHeader');
    const profileBackground = document.getElementById('profileBackground');
    const mediaPlayer = document.getElementById('mediaPlayer');
    const progressBar = document.getElementById('progressBar');
    const controlButtons = document.querySelectorAll('.control-btn');
    const descriptionElement = document.getElementById('profileDescription');
    const titleElement = document.getElementById('profileTitle');
    const usernameElement = document.getElementById('profileUsername');

    document.getElementById('profileAvatar').src = profileData.avatar || 'https://via.placeholder.com/100';
    document.getElementById('telegramLink').href = profileData.telegramLink || '#';
    descriptionElement.textContent = profileData.description || '';
    titleElement.textContent = profileData.title || 'Profile Title';
    usernameElement.textContent = profileData.name || 'Username';
    
    if (profileData.animatedTitle) {
        titleElement.classList.add('animated');
    }

    bodyBackground.style.backgroundColor = profileData.backgroundColor || '#1c2526';
    if (profileData.backgroundImage) {
        bodyBackground.style.backgroundImage = `url(${profileData.backgroundImage})`;
        bodyBackground.style.backgroundSize = 'cover';
        bodyBackground.style.backgroundPosition = 'center';
        bodyBackground.style.backgroundAttachment = 'fixed';
    }
    profileHeader.style.opacity = (profileData.opacity || '100') / 100;
    profileBackground.style.filter = `blur(${profileData.blur || '0'}px)`;
    profileHeader.style.boxShadow = `0 0 20px ${profileData.borderColor || '#ffffff'}`;
    mediaPlayer.style.boxShadow = `0 0 20px ${profileData.borderColor || '#ffffff'}`;

    if (profileData.audio) {
        document.getElementById('audioPlayer').src = profileData.audio;
        document.getElementById('trackName').textContent = profileData.audioName || '-';
    }

    mediaPlayer.style.background = profileData.mediaPlayerBgColor || '#4834d4';
    progressBar.style.setProperty('--progress-bar-color', profileData.progressBarColor || '#e84118');
    controlButtons.forEach(btn => {
        btn.style.background = profileData.mediaPlayerBtnColor || '#6c5ce7';
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