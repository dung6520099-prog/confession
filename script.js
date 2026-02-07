document.addEventListener('DOMContentLoaded', () => {
    const screens = {
        s1: document.getElementById('s1'),
        s2: document.getElementById('s2'),
        dynamic: document.getElementById('s-dynamic'),
        finale: document.getElementById('s-finale')
    };

    const cupid = document.getElementById('cupid-wrapper');
    const messageTarget = document.getElementById('message-target');
    const bgContainer = document.getElementById('bg-stickers-container');

    function updateBackground(theme) {
        const oldStickers = bgContainer.querySelectorAll('.bg-sticker');
        oldStickers.forEach(s => {
            s.style.setProperty('--exit-x', (Math.random() - 0.5) * 1000 + 'px');
            s.style.setProperty('--exit-y', (Math.random() - 0.5) * 1000 + 'px');
            s.classList.add('sticker-exit');
        });
        
        setTimeout(() => {
            bgContainer.innerHTML = '';
            const stickers = {
                intro: ['✨', '💖', '🌸', '✨', '🍭'],
                question: ['❓', '🎁', '🎀', '💭', '🧸'],
                sad: ['😢', '💧', '💔', '☁️', '☔'],
                love: ['🔥', '😍', '💘', '💝', '🌹'],
                finale: ['🎉', '🥂', '👩‍❤️‍👨', '✨', '🎈']
            };

            const currentSet = stickers[theme] || stickers.intro;
            for (let i = 0; i < 15; i++) {
                const span = document.createElement('span');
                span.className = 'bg-sticker';
                span.innerText = currentSet[Math.floor(Math.random() * currentSet.length)];
                span.style.left = Math.random() * 90 + 'vw';
                span.style.top = Math.random() * 90 + 'vh';
                span.style.animationDelay = Math.random() * 2 + 's';
                bgContainer.appendChild(span);
            }
        }, 800);
    }

    async function switchScreen(toId, transitionType = 'fade-in') {
        const activeScreen = document.querySelector('.screen.active');
        
        if (toId === 's1') updateBackground('intro');
        if (toId === 's2') updateBackground('question');
        if (toId === 's-finale') updateBackground('finale');

        if (activeScreen) {
            activeScreen.classList.add(transitionType);
            await new Promise(r => setTimeout(r, 800));
            activeScreen.classList.remove('active', transitionType);
        }

        screens[toId].classList.add('active', 'fade-in');
        setTimeout(() => screens[toId].classList.remove('fade-in'), 800);
    }

    // --- Screen 1 -> 2 ---
    document.getElementById('btn-start').addEventListener('click', () => switchScreen('s2', 'zoom-out'));

    const flipper = document.getElementById('card-flipper');
    flipper.addEventListener('click', () => {
        if (!flipper.classList.contains('flipped')) {
            flipper.classList.add('flipped');
            setTimeout(() => {
                const opts = document.getElementById('s2-options');
                opts.style.opacity = '1';
                opts.style.pointerEvents = 'all';
            }, 600);
        }
    });

    // --- Shoot Arrow Logic ---
    async function shootArrow(contentHtml, theme = 'love') {
        cupid.classList.add('ready');
        updateBackground(theme);
        await new Promise(r => setTimeout(r, 1000));

        await switchScreen('dynamic', 'wipe-left');
        messageTarget.style.opacity = '0';
        messageTarget.style.transform = 'scale(0)';

        cupid.querySelector('.cupid-char').classList.add('drawing');
        await new Promise(r => setTimeout(r, 500));

        const arrow = document.getElementById('arrow-template').cloneNode(true);
        arrow.style.display = 'block';
        document.body.appendChild(arrow);

        const startRect = cupid.getBoundingClientRect();
        const startX = startRect.left + 50;
        const startY = startRect.top;
        const targetX = window.innerWidth / 2;
        const targetY = window.innerHeight / 2;

        arrow.style.left = startX + 'px';
        arrow.style.top = startY + 'px';

        requestAnimationFrame(() => {
            const xDiv = arrow.querySelector('.arrow-x');
            const yDiv = arrow.querySelector('.arrow-y');
            xDiv.style.transition = 'transform 1s linear';
            yDiv.style.transition = 'transform 1s cubic-bezier(0.15, 0.85, 0.35, 1)';
            xDiv.style.transform = `translateX(${targetX - startX}px)`;
            yDiv.style.transform = `translateY(${targetY - startY}px)`;
            cupid.querySelector('.cupid-char').classList.remove('drawing');
        });

        setTimeout(() => {
            arrow.remove();
            messageTarget.innerHTML = contentHtml;
            messageTarget.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            messageTarget.style.opacity = '1';
            messageTarget.style.transform = 'scale(1)';
            attachDynamicListeners();
        }, 1000);
    }

    // --- Tear Animation Fixed ---
    async function startTearAnimation(contentHtml) {
        const eye = document.getElementById('eye-container');
        const tear = document.getElementById('tear-drop');
        
        await switchScreen('dynamic', 'wipe-left');
        updateBackground('sad');
        messageTarget.style.opacity = '0';
        messageTarget.style.transform = 'scale(0)';

        eye.style.opacity = '1';
        await new Promise(r => setTimeout(r, 800));

        tear.style.opacity = '1';
        tear.classList.add('falling');

        setTimeout(() => {
            // Morph precisely
            tear.style.opacity = '0';
            eye.style.opacity = '0';
            
            messageTarget.innerHTML = contentHtml;
            messageTarget.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            messageTarget.style.opacity = '1';
            messageTarget.style.transform = 'scale(1)';
            
            tear.classList.remove('falling');
            attachDynamicListeners();
        }, 1000); 
    }

    function attachDynamicListeners() {
        const btnFinalYes = document.getElementById('btn-final-yes');
        if (btnFinalYes) btnFinalYes.addEventListener('click', startFinale);

        const btnThink = document.getElementById('btn-think');
        if (btnThink) btnThink.addEventListener('click', () => {
            shootArrow(`
                <h2>Suy Nghĩ Gì Nữa, Đồng Ý Luôn Đi!</h2>
                <button id="btn-final-yes" class="btn-cool">Ok mình chấp nhận...</button>
            `);
        });

        const btnLikeBack = document.getElementById('btn-like-back');
        if (btnLikeBack) btnLikeBack.addEventListener('click', () => triggerConfession());

        const btnForce = document.getElementById('btn-force-love');
        if (btnForce) btnForce.addEventListener('click', () => {
            shootArrow(`
                <h2>Chỉ Có Một Lựa Chọn Duy Nhất Thôi</h2>
                <button id="btn-final-yes" class="btn-cool">I love you... 💖</button>
            `);
        });
    }

    function triggerConfession() {
        shootArrow(`
            <div style="text-align: center;">
                <svg viewBox="0 0 100 100" style="width: 100px; height: 100px; margin-bottom: 20px;">
                    <path d="M50 30 C50 10, 10 10, 10 40 C10 70, 50 90, 50 90 C50 90, 90 70, 90 40 C90 10, 50 10, 50 30" 
                          fill="none" stroke="#ff2d55" stroke-width="4" id="svg-heart-path" />
                </svg>
                <p>Mình cũng có cảm tình với bạn ấy, vậy liệu bạn có muốn đồng hành với mình không? ❤️</p>
                <div style="margin-top: 25px;">
                    <button id="btn-final-yes" class="btn-cool">Có!</button>
                    <button id="btn-think" class="btn-cool btn-outline">Để mình xem...</button>
                </div>
            </div>
        `);
        setTimeout(() => {
            const path = document.getElementById('svg-heart-path');
            if (path) {
                path.style.strokeDasharray = '300';
                path.style.strokeDashoffset = '300';
                path.style.transition = 'stroke-dashoffset 3s ease-in-out';
                requestAnimationFrame(() => path.style.strokeDashoffset = '0');
            }
        }, 1500);
    }

    document.getElementById('btn-yes').addEventListener('click', triggerConfession);
    document.getElementById('btn-no').addEventListener('click', () => {
        startTearAnimation(`
            <h2>Thật ư, lựa chọn lại đi nhé... 😢</h2>
            <div style="margin-top: 25px;">
                <button id="btn-like-back" class="btn-cool">Mình cũng thích bạn! 💗</button>
                <button id="btn-force-love" class="btn-cool btn-outline">Suy nghĩ lại...</button>
            </div>
        `);
    });

    async function startFinale() {
        await switchScreen('finale', 'zoom-out');
        const morph = document.createElement('div');
        morph.className = 'heart-blossom';
        document.getElementById('morph-container').appendChild(morph);
        
        setTimeout(() => {
            morph.classList.add('show');
            setTimeout(() => {
                document.getElementById('finale-text').style.opacity = '1';
                startCelebration();
            }, 2000);
        }, 500);
    }

    function startCelebration() {
        setInterval(() => {
            const h = document.createElement('div');
            h.className = 'heart-rain-particle';
            h.innerText = ['❤️', '💖', '💝', '✨', '🍭'][Math.floor(Math.random() * 5)];
            h.style.left = Math.random() * 100 + 'vw';
            h.style.top = '-50px';
            h.style.fontSize = (Math.random() * 20 + 20) + 'px';
            h.style.animation = `rainDown ${Math.random() * 2 + 3}s linear forwards`;
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 5000);
        }, 200);

        setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            const f = document.createElement('div');
            f.className = 'firework';
            f.style.left = x + 'px';
            f.style.top = y + 'px';
            f.style.boxShadow = `0 0 50px 10px ${['#ff2d55', '#48cae4', '#ffffff'][Math.floor(Math.random()*3)]}`;
            document.body.appendChild(f);
            f.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(20)', opacity: 0 }], { duration: 1000 });
            setTimeout(() => f.remove(), 1000);
        }, 800);
    }

    updateBackground('intro');
});
