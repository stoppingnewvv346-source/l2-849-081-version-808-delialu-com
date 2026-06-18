(function () {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      body.classList.toggle('menu-open', mobileMenu.classList.contains('open'));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-empty');
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    let timer = null;

    const activate = function (nextIndex) {
      index = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        if (dotIndex === index) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    };

    const start = function () {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        activate((index + 1) % slides.length);
      }, 5000);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        if (timer) {
          window.clearInterval(timer);
          start();
        }
      });
    });

    start();
  }

  const searchScopes = Array.from(document.querySelectorAll('[data-search-scope]'));
  const searchInput = document.querySelector('[data-search]');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const emptyState = document.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  const runSearch = function () {
    if (searchScopes.length === 0) {
      return;
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    let visible = 0;

    searchScopes.forEach(function (scope) {
      Array.from(scope.querySelectorAll('.movie-card')).forEach(function (card) {
        const haystack = card.getAttribute('data-filter-text') || '';
        const title = card.getAttribute('data-title') || '';
        const matchesQuery = query === '' || haystack.includes(query) || title.includes(query);
        const matchesFilter = activeFilter === 'all' || haystack.includes(activeFilter);
        const shouldShow = matchesQuery && matchesFilter;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', runSearch);
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query) {
      searchInput.value = query;
      runSearch();
    }
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      runSearch();
    });
  });

  const loadPlayer = function (player) {
    const video = player.querySelector('[data-player-video]');
    const button = player.querySelector('[data-play-button]');
    const streamUrl = player.getAttribute('data-stream');
    let loaded = false;

    if (!video || !streamUrl) {
      return;
    }

    const begin = function () {
      if (button) {
        button.hidden = true;
      }

      if (loaded) {
        video.play().catch(function () {});
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        video._hlsPlayer = hls;
        return;
      }

      video.src = streamUrl;
      video.play().catch(function () {});
    };

    if (button) {
      button.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
  };

  document.querySelectorAll('[data-player]').forEach(loadPlayer);
})();
