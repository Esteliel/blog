(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-taxonomy-card]'));
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-taxonomy-value]'));
  var summary = document.querySelector('[data-taxonomy-summary]');
  var empty = document.querySelector('[data-taxonomy-empty]');
  var kind = document.body.dataset.taxonomyKind || (window.location.pathname.indexOf('/tags/') !== -1 ? 'tag' : 'category');

  if (!cards.length || !links.length) return;

  var selected = new URLSearchParams(window.location.search).get('name') || '';

  function render() {
    var visible = 0;
    cards.forEach(function (card) {
      var values = (card.dataset.taxonomyValues || '').split('||').filter(Boolean);
      var show = !selected || values.indexOf(selected) !== -1;
      card.hidden = !show;
      if (show) visible += 1;
    });

    links.forEach(function (link) {
      var active = link.dataset.taxonomyValue === selected;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    if (summary) summary.textContent = (selected || (kind === 'tag' ? '全部标签' : '全部分类')) + ' · ' + visible + ' 篇文章';
    if (empty) empty.hidden = visible !== 0;
  }

  render();
}());
