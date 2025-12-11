(() => {
  const panicKey = localStorage.getItem('panicKey');
  let panicUrl = localStorage.getItem('panicUrl');

  if (panicUrl && !panicUrl.startsWith('http://') && !panicUrl.startsWith('https://')) {
    panicUrl = 'https://' + panicUrl;
  }

  if (panicKey && panicUrl) {
    window.addEventListener('keydown', (event) => {
      if (event.key === panicKey) {
        top.location.href = panicUrl;
      }
    });
  }
})();
