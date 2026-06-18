(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('.search-large input[name="q"]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-search-empty]');
    if (input) {
        input.value = query;
    }
    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function makeCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';
        article.innerHTML = [
            '<a class="card-poster" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-badge">' + escapeHtml(movie.type) + '</span>',
            '<span class="card-play">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-tags"><span>' + escapeHtml(movie.category) + '</span></div>',
            '</div>'
        ].join('');
        var img = article.querySelector('img');
        img.addEventListener('error', function () {
            img.classList.add('is-hidden');
        }, { once: true });
        return article;
    }
    if (!results || !empty) {
        return;
    }
    if (!query) {
        empty.classList.add('is-visible');
        return;
    }
    var key = query.toLowerCase();
    var data = window.SITE_MOVIES || [];
    var matched = data.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category]
            .join(' ')
            .toLowerCase()
            .indexOf(key) !== -1;
    }).slice(0, 120);
    if (!matched.length) {
        empty.textContent = '暂无匹配内容';
        empty.classList.add('is-visible');
        return;
    }
    empty.classList.remove('is-visible');
    matched.forEach(function (movie) {
        results.appendChild(makeCard(movie));
    });
})();
