(function () {
  var content = document.querySelector('[data-post-content]') || document.getElementById('post-content');
  var toc = document.querySelector('[data-post-toc]');
  var tocList = document.querySelector('[data-toc-list]');

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
    document.body.removeChild(area);
    return copied;
  }

  function setCopyState(button, copied) {
    button.textContent = copied ? '已复制' : '复制失败';
    button.classList.toggle('is-copied', copied);
    window.setTimeout(function () {
      button.textContent = '复制';
      button.classList.remove('is-copied');
    }, 1800);
  }

  function addCopyButtons() {
    if (!content) return;
    Array.prototype.forEach.call(content.querySelectorAll('pre'), function (pre) {
      if (pre.parentElement.classList.contains('code-block')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-code';
      button.textContent = '复制';
      button.setAttribute('aria-label', '复制代码');
      button.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        var promise = navigator.clipboard && window.isSecureContext
          ? navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return fallbackCopy(text); })
          : Promise.resolve(fallbackCopy(text));
        promise.then(function (copied) { setCopyState(button, copied); });
      });
      wrapper.appendChild(button);
    });
  }

  function buildToc() {
    if (!content || !toc || !tocList) return;
    var headings = Array.prototype.slice.call(content.querySelectorAll('h2, h3'))
      .filter(function (heading) { return heading.id; });
    if (!headings.length) {
      toc.hidden = true;
      return;
    }

    headings.forEach(function (heading) {
      var item = document.createElement('li');
      item.className = heading.tagName.toLowerCase() === 'h3' ? 'toc-depth-3' : 'toc-depth-2';
      var link = document.createElement('a');
      link.href = '#' + heading.id;
      link.textContent = heading.textContent;
      item.appendChild(link);
      tocList.appendChild(item);
    });
    toc.hidden = false;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          tocList.querySelectorAll('a').forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, { rootMargin: '-92px 0px -65% 0px', threshold: 0 });
      headings.forEach(function (heading) { observer.observe(heading); });
    }
  }

  addCopyButtons();
  buildToc();
}());
