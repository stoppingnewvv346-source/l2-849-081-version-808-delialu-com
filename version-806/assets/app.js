(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-card-grid]");
    if (!panel || !grid) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-input]");
    var year = panel.querySelector("[data-filter-year]");
    var region = panel.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function yearMatches(cardYear, selected) {
      if (!selected) {
        return true;
      }
      if (selected === "older") {
        var parsed = parseInt(cardYear, 10);
        return Number.isFinite(parsed) && parsed < 2020;
      }
      return cardYear.indexOf(selected) !== -1;
    }

    function apply() {
      var q = normalize(keyword && keyword.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" "));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var matched = (!q || haystack.indexOf(q) !== -1) &&
          yearMatches(cardYear, selectedYear) &&
          (!selectedRegion || cardRegion.indexOf(selectedRegion) !== -1);
        card.classList.toggle("is-hidden", !matched);
      });
    }

    [keyword, year, region].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var form = page.querySelector("[data-search-form]");
    var input = page.querySelector("[data-search-input]");
    var results = page.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;"
        }[char];
      });
    }

    function createCard(movie) {
      var tag = movie.tags && movie.tags.length ? movie.tags[0] : movie.type;
      return [
        '<article class="movie-card card-hover">',
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '<span class="poster-wrap">',
        '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-shade"></span>',
        '<span class="poster-badge">HD</span>',
        '<span class="poster-tag">' + escapeHtml(tag) + '</span>',
        '</span>',
        '<span class="card-body">',
        '<strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
        '<span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
        '<span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></span>',
        '</span>',
        '</a>',
        '</article>'
      ].join("");
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function render() {
      var query = normalize(input.value);
      if (!query) {
        results.innerHTML = "";
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        return text.indexOf(query) !== -1;
      }).slice(0, 120);
      results.innerHTML = matched.map(createCard).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      var query = input.value.trim();
      if (query) {
        url.searchParams.set("q", query);
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState({}, "", url.toString());
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (panel) {
      var video = panel.querySelector("video");
      var button = panel.querySelector("[data-play]");
      var source = panel.getAttribute("data-src");
      var hls = null;
      if (!video || !button || !source) {
        return;
      }

      function loadSource() {
        if (video.getAttribute("data-ready") === "true") {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute("data-ready", "true");
      }

      function playVideo() {
        loadSource();
        panel.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            panel.classList.remove("is-playing");
          });
        }
      }

      button.addEventListener("click", playVideo);
      panel.addEventListener("click", function (event) {
        if (event.target === video || event.target === panel) {
          if (video.paused) {
            playVideo();
          }
        }
      });
      video.addEventListener("play", function () {
        panel.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          panel.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
