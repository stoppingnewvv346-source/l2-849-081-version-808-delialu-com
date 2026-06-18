(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function applyFilter(control) {
    var section = control.closest("section") || document;
    var list = section.querySelector("[data-card-list]");
    if (!list) {
      return;
    }
    var input = control.querySelector("[data-search-input]");
    var activeChip = control.querySelector("[data-filter].is-active");
    var query = input ? input.value.trim().toLowerCase() : "";
    var filter = activeChip ? activeChip.getAttribute("data-filter") : "all";
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    cards.forEach(function (card) {
      var searchable = (card.getAttribute("data-search") || "").toLowerCase();
      var type = (card.getAttribute("data-type") || "").toLowerCase();
      var genre = (card.getAttribute("data-genre") || "").toLowerCase();
      var matchesSearch = !query || searchable.indexOf(query) !== -1;
      var normalized = filter.toLowerCase();
      var matchesFilter = normalized === "all" || type.indexOf(normalized) !== -1 || genre.indexOf(normalized) !== -1;
      card.classList.toggle("is-hidden", !(matchesSearch && matchesFilter));
    });
  }

  function initFilters() {
    var controls = Array.prototype.slice.call(document.querySelectorAll("[data-filter-control]"));
    controls.forEach(function (control) {
      var input = control.querySelector("[data-search-input]");
      var chips = Array.prototype.slice.call(control.querySelectorAll("[data-filter]"));
      if (input) {
        input.addEventListener("input", function () {
          applyFilter(control);
        });
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter(control);
        });
      });
      applyFilter(control);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (container) {
      var video = container.querySelector("video");
      var button = container.querySelector("[data-play-button]");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-stream");
      var prepared = false;
      var hlsInstance = null;

      function prepare() {
        if (prepared || !streamUrl) {
          return;
        }
        prepared = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else {
          video.src = streamUrl;
        }
      }

      function startPlayback() {
        prepare();
        if (button) {
          button.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        }
      }

      if (button) {
        button.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        prepare();
      });
      video.addEventListener("play", function () {
        if (button) {
          button.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
          button.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
})();
