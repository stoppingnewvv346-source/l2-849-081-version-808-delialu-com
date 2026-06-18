(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "").trim();
  }

  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        if (input) {
          input.focus();
        }
      }
    });
  });

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
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
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilter(root) {
    var input = root.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
    var status = root.querySelector("[data-filter-status]");
    var empty = root.querySelector("[data-empty-state]");

    if (!input || !cards.length) {
      return;
    }

    function applyFilter(value) {
      var keyword = normalize(value);
      var shown = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search-text"));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          shown += 1;
        }
      });

      if (status) {
        status.textContent = keyword ? "匹配内容 " + shown + " 部" : "可输入片名、题材、年份或地区筛选";
      }

      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    input.addEventListener("input", function () {
      applyFilter(input.value);
    });

    var initialQuery = getQuery();
    if (root.hasAttribute("data-search-page") && initialQuery) {
      input.value = initialQuery;
    }
    applyFilter(input.value);
  }

  document.querySelectorAll("[data-filter-root]").forEach(setupFilter);
})();
