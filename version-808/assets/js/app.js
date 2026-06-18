(function () {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var navLinks = document.querySelector("[data-nav-links]");

    function setHeaderState() {
        if (!header) {
            return;
        }
        if (window.scrollY > 16) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    setHeaderState();
    window.addEventListener("scroll", setHeaderState, { passive: true });

    if (toggle && navLinks) {
        toggle.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", navLinks.classList.contains("is-open"));
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navLinks.classList.remove("is-open");
                document.body.classList.remove("menu-open");
            });
        });
    }

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-zone]").forEach(function (zone) {
        var input = zone.querySelector("[data-filter-input]");
        var chips = Array.prototype.slice.call(zone.querySelectorAll("[data-filter-chip]"));
        var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-card]"));
        var empty = zone.querySelector("[data-empty-state]");
        var activeChip = "all";
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");

        if (q && input) {
            input.value = q;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "") + " " + card.textContent).toLowerCase();
                var matchQuery = !query || text.indexOf(query) !== -1;
                var matchChip = activeChip === "all" || text.indexOf(activeChip.toLowerCase()) !== -1;
                var matched = matchQuery && matchChip;

                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                activeChip = chip.getAttribute("data-filter-chip") || "all";
                apply();
            });
        });

        apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector("[data-play-cover]");
        var streamUrl = shell.getAttribute("data-stream");
        var hls = null;
        var prepared = false;

        function prepare() {
            if (!video || !streamUrl || prepared) {
                return;
            }
            prepared = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            prepare();
            shell.classList.add("is-playing");
            if (video) {
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {});
                }
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!prepared) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
        }

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
