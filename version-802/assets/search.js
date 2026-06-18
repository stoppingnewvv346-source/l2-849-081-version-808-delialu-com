(function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim().toLowerCase();
  var input = document.querySelector(".search-page-input");
  var title = document.querySelector(".search-title");
  var results = document.querySelector(".search-results");
  var movies = window.SiteMovies || [];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '<img src="./' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-list"><span>' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</article>'
    ].join('');
  }

  if (input) {
    input.value = query;
  }

  var filtered = movies.filter(function (movie) {
    if (!query) {
      return true;
    }

    var haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.tags,
      movie.category,
      movie.oneLine
    ].join(" ").toLowerCase();

    return haystack.indexOf(query) !== -1;
  }).slice(0, 120);

  if (title) {
    title.textContent = query ? "搜索结果" : "热门推荐";
  }

  if (!results) {
    return;
  }

  if (!filtered.length) {
    results.innerHTML = '<div class="search-results-empty">没有匹配的影片，请尝试其他关键词。</div>';
    return;
  }

  results.innerHTML = filtered.map(card).join('');
})();
