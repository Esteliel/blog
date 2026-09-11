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

    var sections = [];
    var currentSection = null;
    var sectionByHeadingId = {};

    headings.forEach(function (heading) {
      if (heading.tagName.toLowerCase() === 'h2') {
        var sectionItem = document.createElement('li');
        sectionItem.className = 'toc-section';
        var sectionLink = document.createElement('a');
        sectionLink.href = '#' + heading.id;
        sectionLink.textContent = heading.textContent;
        sectionLink.className = 'toc-section-link';
        sectionItem.appendChild(sectionLink);

        var subList = document.createElement('ul');
        subList.className = 'toc-sublist';
        subList.hidden = true;
        sectionItem.appendChild(subList);
        tocList.appendChild(sectionItem);

        var section = {
          heading: heading,
          item: sectionItem,
          link: sectionLink,
          subList: subList,
          children: []
        };
        currentSection = section;
        sections.push(section);
        sectionByHeadingId[heading.id] = section;
        sectionLink.addEventListener('click', function () { activate(section, heading.id); });
      } else if (currentSection) {
        var parentSection = currentSection;
        var childItem = document.createElement('li');
        var childLink = document.createElement('a');
        childLink.href = '#' + heading.id;
        childLink.textContent = heading.textContent;
        childLink.className = 'toc-sub-link';
        childItem.appendChild(childLink);
        parentSection.subList.appendChild(childItem);
        parentSection.children.push({ heading: heading, link: childLink });
        sectionByHeadingId[heading.id] = parentSection;
        childLink.addEventListener('click', function () { activate(parentSection, heading.id); });
      }
    });

    sections.forEach(function (section) {
      if (!section.children.length) section.subList.hidden = true;
    });
    toc.hidden = false;

    function activate(section, headingId) {
      sections.forEach(function (item) {
        var isActive = item === section;
        item.item.classList.toggle('is-active', isActive);
        item.link.classList.toggle('is-active', isActive);
        item.subList.hidden = !isActive || !item.children.length;
        item.children.forEach(function (child) {
          child.link.classList.toggle('is-active', isActive && child.heading.id === headingId);
        });
      });
    }

    activate(sections[0], sections[0].heading.id);

    if ('IntersectionObserver' in window) {
      var observer;
      var header = document.querySelector('[data-site-header]');
      function observeHeadings() {
        if (observer) observer.disconnect();
        var offset = (header ? header.offsetHeight : 72) + 24;
        observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var section = sectionByHeadingId[entry.target.id];
            if (section) activate(section, entry.target.id);
          });
        }, { rootMargin: '-' + offset + 'px 0px -50% 0px', threshold: 0 });
        headings.forEach(function (heading) { observer.observe(heading); });
      }
      observeHeadings();
      if (header && 'ResizeObserver' in window) {
        new ResizeObserver(observeHeadings).observe(header);
      } else {
        window.addEventListener('resize', observeHeadings);
      }
    }
  }

  addCopyButtons();
  buildToc();
}());
