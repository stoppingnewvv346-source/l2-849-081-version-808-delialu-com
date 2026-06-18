(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    qsa('img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('is-hidden');
        }, { once: true });
    });

    var mobileToggle = qs('[data-mobile-toggle]');
    var mobilePanel = qs('[data-mobile-panel]');
    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    qsa('[data-tab-button]').forEach(function (button) {
        button.addEventListener('click', function () {
            var target = button.dataset.tabButton;
            qsa('[data-tab-button]').forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            qsa('[data-tab-panel]').forEach(function (panel) {
                panel.classList.toggle('is-active', panel.dataset.tabPanel === target);
            });
        });
    });

    qsa('[data-filter-scope]').forEach(function (scope) {
        var input = qs('.js-filter-input', scope);
        var selects = qsa('.js-filter-select', scope);
        var grid = qs('.js-filter-grid') || scope.parentElement.querySelector('.js-filter-grid');
        var empty = qs('[data-filter-empty]') || scope.parentElement.querySelector('[data-filter-empty]');
        var cards = grid ? qsa('.movie-card', grid) : [];

        function apply() {
            var query = text(input ? input.value : '');
            var filters = {};
            selects.forEach(function (select) {
                filters[select.dataset.filter] = text(select.value);
            });
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = text([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                var ok = !query || haystack.indexOf(query) !== -1;
                Object.keys(filters).forEach(function (key) {
                    if (filters[key] && text(card.dataset[key]) !== filters[key]) {
                        ok = false;
                    }
                });
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
    });
})();
