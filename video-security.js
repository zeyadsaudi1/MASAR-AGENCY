/**
 * ============================================
 * MASAR Video Security System
 * نظام حماية الفيديو - مسار
 * ============================================
 */

(function () {
    'use strict';

    // ─── Configuration ───
    const API_URL = 'http://localhost:3000';
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const currentUserId = currentUser.phone || 'unknown';
    const currentVideoId = new URLSearchParams(window.location.search).get('v') || 'unknown';

    let violationCount = 0;
    let videoElement = null;
    let expectedTime = 0;
    let isPlaying = false;
    let lastValidTime = 0;

    // ─── Initialize on DOM Ready ───
    document.addEventListener('DOMContentLoaded', () => {
        videoElement = document.getElementById('secureVideo');
        if (!videoElement) return;

        initSecurityShield();
        initCustomControls();
        initAntiCapture();
        initAntiDevTools();
        initAntiSpeedChange();
        initAntiSeeking();
        initMediaKeysBlock();
        initCanvasProtection();
        initWatermark();
        showShieldIndicator();
    });

    // ============================================
    // 1. Screen Capture Detection & Blocking
    // ============================================
    function initAntiCapture() {
        // إخفاء الفيديو فوراً عند فقدان التركيز (مثل فتح Snipping Tool)
        window.addEventListener('blur', () => {
            if (isPlaying) {
                pauseVideo();
                coverVideoWithBlackout(true);
                reportToAdmin('window_blur_detected');
            }
        });

        window.addEventListener('focus', () => {
            coverVideoWithBlackout(false);
        });

        // Visibility change detection
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                pauseVideo();
                coverVideoWithBlackout(true);
                showWarning('تم اكتشاف محاولة تصوير أو تغيير النافذة، تم إيقاف المحاضرة.');
                reportToAdmin('visibility_change');
            }
        });

        // Block copy/paste/cut
        document.addEventListener('copy', (e) => { e.preventDefault(); reportToAdmin('copy_attempt'); });
        document.addEventListener('paste', (e) => e.preventDefault());
        document.addEventListener('cut', (e) => e.preventDefault());
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showWarning('غير مسموح بقائمة السياق');
        });

        // Block dangerous keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // F12
            if (e.key === 'F12') {
                e.preventDefault();
                reportToAdmin('devtools_attempt');
                return;
            }
            // Ctrl+Shift+I/J/C
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
                e.preventDefault();
                reportToAdmin('devtools_attempt');
                return;
            }
            // Ctrl+U (view source)
            if (e.ctrlKey && e.key.toLowerCase() === 'u') {
                e.preventDefault();
                reportToAdmin('devtools_attempt');
                return;
            }
            // PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                showWarning('تم اكتشاف محاولة تصوير');
                reportToAdmin('printscreen_attempt');
                return;
            }
            // Win+Shift+S (Snipping Tool)
            if (e.key.toLowerCase() === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                reportToAdmin('snipping_attempt');
                return;
            }
            // Ctrl+S (save page)
            if (e.ctrlKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                return;
            }
            // Ctrl+P (print)
            if (e.ctrlKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                return;
            }
        });
    }

    // ============================================
    // 2. Anti Speed Change & Force Full Watch
    // ============================================
    function initAntiSpeedChange() {
        if (!videoElement) return;

        // Override playbackRate property
        try {
            Object.defineProperty(videoElement, 'playbackRate', {
                get: () => 1,
                set: () => {
                    reportToAdmin('playbackrate_change_attempt');
                    showWarning('غير مسموح بتغيير سرعة الفيديو');
                },
                configurable: false
            });
        } catch (e) {
            // Fallback: interval check
            setInterval(() => {
                if (videoElement.playbackRate !== 1) {
                    videoElement.playbackRate = 1;
                    reportToAdmin('playbackrate_override');
                }
            }, 500);
        }

        // Also set interval as backup
        setInterval(() => {
            try {
                const desc = Object.getOwnPropertyDescriptor(videoElement, 'playbackRate');
                if (!desc || desc.configurable) {
                    // Someone may have re-defined it
                    HTMLVideoElement.prototype.playbackRate = 1;
                }
            } catch (e) { /* ignore */ }
        }, 2000);
    }

    function initAntiSeeking() {
        if (!videoElement) return;

        videoElement.addEventListener('loadedmetadata', () => {
            videoElement.controls = false;
        });

        videoElement.addEventListener('timeupdate', () => {
            if (!isPlaying) return;
            const diff = Math.abs(videoElement.currentTime - expectedTime);
            if (diff > 2) {
                videoElement.currentTime = expectedTime;
                reportToAdmin('seek_attempt');
                showWarning('غير مسموح بالتقديم على الفيديو');
            } else {
                expectedTime = videoElement.currentTime;
                lastValidTime = videoElement.currentTime;
            }
            updateProgressBar();
            updateTimeDisplay();
        });

        videoElement.addEventListener('seeking', () => {
            if (Math.abs(videoElement.currentTime - lastValidTime) > 2) {
                videoElement.currentTime = lastValidTime;
                reportToAdmin('seek_attempt');
            }
        });

        videoElement.addEventListener('play', () => { isPlaying = true; updatePlayButton(); });
        videoElement.addEventListener('pause', () => { isPlaying = false; updatePlayButton(); });
        videoElement.addEventListener('ended', () => { isPlaying = false; updatePlayButton(); });
    }

    // ============================================
    // 3. Media Keys Block
    // ============================================
    function initMediaKeysBlock() {
        try {
            navigator.mediaSession.setActionHandler('seekforward', () => {
                reportToAdmin('media_key_seek_forward');
            });
            navigator.mediaSession.setActionHandler('seekbackward', () => {
                reportToAdmin('media_key_seek_backward');
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                reportToAdmin('media_key_skip');
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                reportToAdmin('media_key_skip');
            });
        } catch (e) { /* browser doesn't support mediaSession */ }
    }

    // ============================================
    // 4. Canvas / Blob Protection
    // ============================================
    function initCanvasProtection() {
        let lastBlobTime = 0;
        const originalToBlob = HTMLCanvasElement.prototype.toBlob;
        HTMLCanvasElement.prototype.toBlob = function (...args) {
            const now = Date.now();
            if (now - lastBlobTime < 1000) {
                reportToAdmin('canvas_screenshot_attempt');
                showWarning('غير مسموح بالتصوير');
                return;
            }
            lastBlobTime = now;
            return originalToBlob.apply(this, args);
        };

        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function (...args) {
            reportToAdmin('canvas_todataurl_attempt');
            return '';
        };
    }

    // ============================================
    // 5. DevTools Detection
    // ============================================
    function initAntiDevTools() {
        // Size-based detection
        const checkDevTools = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;
            if (widthThreshold || heightThreshold) {
                pauseVideo();
                reportToAdmin('devtools_detected');
                showWarning('تم اكتشاف أدوات المطور - تم الإبلاغ');
            }
        };
        setInterval(checkDevTools, 2000);

        // Console.log trick
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: () => {
                reportToAdmin('devtools_console_detected');
            }
        });
        setInterval(() => {
            console.log('%c', element);
            console.clear();
        }, 3000);
    }

    // ============================================
    // 6. Security Shield Init
    // ============================================
    function initSecurityShield() {
        // Disable right-click globally on secure page
        document.body.classList.add('secure-video-page');

        // Prevent drag on all media
        document.querySelectorAll('img, video').forEach(el => {
            el.setAttribute('draggable', 'false');
            el.addEventListener('dragstart', e => e.preventDefault());
        });
    }

    // ============================================
    // 7. Custom Video Controls
    // ============================================
    function initCustomControls() {
        if (!videoElement) return;
        const container = document.getElementById('videoContainer');
        if (!container) return;

        // Play/Pause
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', togglePlay);
        }

        // Click on video area to toggle play
        container.addEventListener('click', (e) => {
            if (e.target.closest('.custom-video-controls') || e.target.closest('.quality-menu')) return;
            togglePlay();
        });

        // Fullscreen
        const fsBtn = document.getElementById('fullscreenBtn');
        if (fsBtn) {
            fsBtn.addEventListener('click', () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    container.requestFullscreen().catch(() => {});
                }
            });
        }

        // Volume
        const volSlider = document.getElementById('volumeSlider');
        const volBtn = document.getElementById('volumeBtn');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                videoElement.volume = e.target.value;
                updateVolumeIcon();
            });
        }
        if (volBtn) {
            volBtn.addEventListener('click', () => {
                videoElement.muted = !videoElement.muted;
                if (volSlider) volSlider.value = videoElement.muted ? 0 : videoElement.volume;
                updateVolumeIcon();
            });
        }

        // Quality menu
        const qualityBtn = document.getElementById('qualityBtn');
        const qualityMenu = document.getElementById('qualityMenu');
        if (qualityBtn && qualityMenu) {
            qualityBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                qualityMenu.classList.toggle('active');
            });
            document.addEventListener('click', () => qualityMenu.classList.remove('active'));
        }

        // Keyboard: space to play/pause only
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
        });
    }

    function togglePlay() {
        if (!videoElement) return;
        if (videoElement.paused) {
            videoElement.play().catch(() => {});
        } else {
            videoElement.pause();
        }
    }

    function pauseVideo() {
        if (videoElement && !videoElement.paused) {
            videoElement.pause();
        }
    }

    function updatePlayButton() {
        const btn = document.getElementById('playBtn');
        if (btn) {
            btn.textContent = isPlaying ? '⏸' : '▶';
        }
    }

    function updateProgressBar() {
        const fill = document.getElementById('progressFill');
        if (fill && videoElement && videoElement.duration) {
            const pct = (videoElement.currentTime / videoElement.duration) * 100;
            fill.style.width = pct + '%';
        }
    }

    function updateTimeDisplay() {
        const display = document.getElementById('timeDisplay');
        if (display && videoElement) {
            display.textContent = formatTime(videoElement.currentTime) + ' / ' + formatTime(videoElement.duration || 0);
        }
    }

    function updateVolumeIcon() {
        const btn = document.getElementById('volumeBtn');
        if (!btn || !videoElement) return;
        if (videoElement.muted || videoElement.volume === 0) btn.textContent = '🔇';
        else if (videoElement.volume < 0.5) btn.textContent = '🔉';
        else btn.textContent = '🔊';
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    // ============================================
    // 8. Watermark
    // ============================================
    function initWatermark() {
        const wmContainer = document.getElementById('videoWatermark');
        if (!wmContainer) return;
        const name = currentUser.name || currentUser.firstName || 'طالب';
        const phone = currentUser.phone || '';
        const text = name + ' - ' + phone;

        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.className = 'watermark-text';
            span.textContent = text;
            wmContainer.appendChild(span);
        }
    }

    // ============================================
    // 9. Reporting System
    // ============================================
    function reportToAdmin(reason) {
        violationCount++;
        updateViolationBadge();

        const report = {
            action: 'security_violation',
            reason: reason,
            timestamp: new Date().toISOString(),
            userId: currentUserId,
            videoId: currentVideoId,
            violationCount: violationCount,
            userAgent: navigator.userAgent,
            screenSize: screen.width + 'x' + screen.height,
            url: window.location.href
        };

        fetch(API_URL + '/api/security/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        }).catch(() => {
            // Fallback to localStorage
            const key = 'pending_report_' + Date.now();
            try { localStorage.setItem(key, JSON.stringify(report)); } catch (e) { }
        });

        // Auto-block after too many violations
        if (violationCount >= 5) {
            pauseVideo();
            showWarning('تم حظر المشاهدة بسبب محاولات مخالفة متعددة. تم إبلاغ الإدارة.');
        }
    }

    function showWarning(message) {
        // Remove existing overlay if any
        const existing = document.querySelector('.security-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'security-overlay';
        overlay.innerHTML =
            '<div class="warning-box">' +
                '<span class="warning-icon">🛡️</span>' +
                '<h2>⚠️ تحذير أمني</h2>' +
                '<p>' + message + '</p>' +
                '<p class="report-note">تم إبلاغ المسؤول عن هذا الإجراء</p>' +
                '<button class="warning-dismiss-btn" id="dismissWarning">موافق</button>' +
            '</div>';
        document.body.appendChild(overlay);

        document.getElementById('dismissWarning').addEventListener('click', () => {
            overlay.remove();
        });
    }

    function updateViolationBadge() {
        let badge = document.getElementById('violationBadge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'violationBadge';
            badge.className = 'violation-badge';
            document.body.appendChild(badge);
        }
        badge.className = 'violation-badge visible';
        badge.textContent = '⚠ مخالفات: ' + violationCount;
    }

    function coverVideoWithBlackout(shouldCover) {
        const container = document.getElementById('videoContainer');
        if (!container) return;

        let blackout = document.getElementById('videoBlackoutOverlay');
        if (!blackout) {
            blackout = document.createElement('div');
            blackout.id = 'videoBlackoutOverlay';
            blackout.style.position = 'absolute';
            blackout.style.top = '0';
            blackout.style.left = '0';
            blackout.style.width = '100%';
            blackout.style.height = '100%';
            blackout.style.backgroundColor = '#000';
            blackout.style.zIndex = '99999';
            blackout.style.display = 'none';
            blackout.style.alignItems = 'center';
            blackout.style.justifyContent = 'center';
            blackout.style.color = '#fff';
            blackout.style.fontSize = '1.2rem';
            blackout.style.fontWeight = 'bold';
            blackout.style.fontFamily = 'sans-serif';
            blackout.innerHTML = '⚠️ تم إيقاف العرض مؤقتاً لحماية المحتوى';
            container.appendChild(blackout);
        }

        if (shouldCover) {
            blackout.style.display = 'flex';
        } else {
            blackout.style.display = 'none';
        }
    }

    function showShieldIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'shield-indicator';
        indicator.innerHTML = '<span class="shield-dot"></span> الحماية مفعّلة';
        document.body.appendChild(indicator);
    }

    // Expose pauseVideo globally for the warning button
    window.MasarSecurity = { pauseVideo, showWarning, reportToAdmin, coverVideoWithBlackout };
})();
