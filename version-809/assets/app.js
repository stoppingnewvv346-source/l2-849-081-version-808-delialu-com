function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var player = document.querySelector("[data-player]");
  if (!video || !player || !streamUrl) {
    return;
  }
  var errorBox = document.createElement("div");
  errorBox.className = "player-error";
  errorBox.textContent = "视频暂时无法加载，请稍后重试";
  player.appendChild(errorBox);
  if (typeof Hls !== "undefined" && Hls.isSupported()) {
    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          player.classList.add("player-unavailable");
        }
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
  } else {
    player.classList.add("player-unavailable");
  }
  var start = function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var promise = video.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  };
  if (cover) {
    cover.addEventListener("click", start);
  }
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
}

(function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var setHero = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };
    var next = function () {
      setHero(current + 1);
    };
    var prev = function () {
      setHero(current - 1);
    };
    var nextButton = hero.querySelector("[data-hero-next]");
    var prevButton = hero.querySelector("[data-hero-prev]");
    if (nextButton) {
      nextButton.addEventListener("click", next);
    }
    if (prevButton) {
      prevButton.addEventListener("click", prev);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    setInterval(next, 5000);
  }

  var categoryTools = document.querySelector("[data-category-tools]");
  if (categoryTools) {
    var filterInput = categoryTools.querySelector("[data-card-filter]");
    var sortSelect = categoryTools.querySelector("[data-card-sort]");
    var grid = categoryTools.querySelector("[data-card-grid]");
    var applyFilter = function () {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      Array.prototype.slice.call(grid.querySelectorAll(".movie-card")).forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        card.setAttribute("data-hidden", query && text.indexOf(query) === -1 ? "true" : "false");
      });
    };
    var applySort = function () {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var mode = sortSelect ? sortSelect.value : "latest";
      cards.sort(function (a, b) {
        if (mode === "oldest") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    };
    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        applySort();
        applyFilter();
      });
    }
  }

  var searchResults = document.querySelector("[data-search-results]");
  var searchForm = document.querySelector("[data-search-page-form]");
  if (searchResults && typeof SearchIndex !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = searchForm ? searchForm.querySelector("input[name='q']") : null;
    var title = document.querySelector("[data-search-title]");
    if (input) {
      input.value = query;
    }
    var makeCard = function (item) {
      var link = document.createElement("a");
      link.className = "movie-card";
      link.href = item.file;
      link.innerHTML = "<div class=\"card-poster\"><img loading=\"lazy\"><div class=\"card-overlay\"><span>▶</span></div><span class=\"category-pill card-category\"></span><span class=\"year-pill\"></span></div><div class=\"card-body\"><h3></h3><p></p><div class=\"genre-line\"></div></div>";
      link.querySelector("img").src = item.cover;
      link.querySelector("img").alt = item.title;
      link.querySelector(".card-category").textContent = item.category;
      link.querySelector(".year-pill").textContent = item.year;
      link.querySelector("h3").textContent = item.title;
      link.querySelector("p").textContent = item.oneLine;
      link.querySelector(".genre-line").textContent = "★ " + item.genre;
      return link;
    };
    var normalized = query.trim().toLowerCase();
    var results = normalized ? SearchIndex.filter(function (item) {
      return item.search.indexOf(normalized) !== -1;
    }).slice(0, 160) : SearchIndex.slice(0, 80);
    if (title) {
      title.textContent = normalized ? "搜索结果：" + query : "精选结果";
    }
    searchResults.innerHTML = "";
    if (results.length) {
      results.forEach(function (item) {
        searchResults.appendChild(makeCard(item));
      });
    } else {
      var empty = document.createElement("div");
      empty.className = "detail-panel";
      empty.textContent = "没有找到匹配内容";
      searchResults.appendChild(empty);
    }
  }
})();
