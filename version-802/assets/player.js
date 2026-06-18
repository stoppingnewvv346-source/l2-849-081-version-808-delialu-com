(function () {
  function attachStream(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = url;
  }

  function boot(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var isAttached = false;

    if (!video || !button || !url) {
      return;
    }

    function startPlayback() {
      if (!isAttached) {
        attachStream(video, url);
        isAttached = true;
      }

      button.classList.add("is-hidden");
      video.controls = true;

      var playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {});
      }
    }

    button.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
  }

  window.MoviePlayer = {
    boot: boot
  };
})();
