(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-post-card]'));
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-kind]'));
  var summary = document.querySelector('[data-filter-summary]');
  var empty = document.querySelector('[data-filter-empty]');

  if (!cards.length || !buttons.length) return;

  var state = { category: '', tag: '' };

  function values(card, key) {
    return (card.dataset[key] || '').split('||').filter(Boolean);
  }

  function setActive(kind) {
    buttons.forEach(function (button) {
      if (button.dataset.filterKind !== kind) return;
      var active = button.dataset.filterValue === state[kind];
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function syncUrl() {
    var url = new URL(window.location.href);
    ['category', 'tag'].forEach(function (key) {
      if (state[key]) url.searchParams.set(key, state[key]);
      else url.searchParams.delete(key);
    });
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
  }

  function render() {
    var visible = 0;
    cards.forEach(function (card) {
      var categoryMatch = !state.category || values(card, 'categories').indexOf(state.category) !== -1;
      var tagMatch = !state.tag || values(card, 'tags').indexOf(state.tag) !== -1;
      var show = categoryMatch && tagMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (summary) {
      var active = [];
      if (state.category) active.push('分类：' + state.category);
      if (state.tag) active.push('标签：' + state.tag);
      summary.textContent = active.length ? active.join('　·　') + '　/　' + visible + ' 篇文章' : '共 ' + visible + ' 篇文章';
    }
    if (empty) empty.hidden = visible !== 0;
    setActive('category');
    setActive('tag');
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      state[button.dataset.filterKind] = button.dataset.filterValue;
      syncUrl();
      render();
    });
  });

  var params = new URLSearchParams(window.location.search);
  ['category', 'tag'].forEach(function (key) {
    var value = params.get(key);
    if (value) state[key] = value;
  });
  render();
}());
