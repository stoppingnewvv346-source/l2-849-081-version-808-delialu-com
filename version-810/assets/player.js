(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('.player-overlay');
        var url = video ? video.dataset.streamUrl : '';
        var ready = false;
        var hls = null;

        function attach() {
            if (!video || !url || ready) {
                return Promise.resolve();
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    window.setTimeout(resolve, 1400);
                });
            }
            video.src = url;
            return Promise.resolve();
        }

        function play() {
            if (!video) {
                return;
            }
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            attach().then(function () {
                var request = video.play();
                if (request && request.catch) {
                    request.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            });
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.js-player').forEach(initPlayer);
})();
