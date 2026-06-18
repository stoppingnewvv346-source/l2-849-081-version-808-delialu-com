(function () {
  var toggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var previous = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function restartTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (slides.length) {
    restartTimer();
  }

  if (previous) {
    previous.addEventListener("click", function () {
      showSlide(current - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      restartTimer();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      restartTimer();
    });
  });

  var filterPanel = document.querySelector(".filter-panel");

  if (filterPanel) {
    var textInput = filterPanel.querySelector(".page-filter");
    var typeSelect = filterPanel.querySelector(".type-filter");
    var regionSelect = filterPanel.querySelector(".region-filter");
    var yearSelect = filterPanel.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".category-movie-grid .movie-card"));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function applyFilters() {
      var query = valueOf(textInput);
      var type = valueOf(typeSelect);
      var region = valueOf(regionSelect);
      var year = valueOf(yearSelect);

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !type || (card.getAttribute("data-type") || "").toLowerCase() === type;
        var matchesRegion = !region || (card.getAttribute("data-region") || "").toLowerCase() === region;
        var matchesYear = !year || (card.getAttribute("data-year") || "").toLowerCase() === year;

        card.style.display = matchesQuery && matchesType && matchesRegion && matchesYear ? "" : "none";
      });
    }

    [textInput, typeSelect, regionSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", applyFilters);
        element.addEventListener("change", applyFilters);
      }
    });
  }
})();
