(function () {

  function collectSelectors() {
    var selectors = [];

    function processRules(rules) {
      Array.from(rules).forEach(function (rule) {
        if (rule.cssRules) {
          processRules(rule.cssRules);
        } else {
          var found = false;
          Array.from(rule.style).forEach(function (dec) {
            if (dec === 'display' &&
                (rule.style[dec] === 'grid' ||
                 rule.style[dec] === 'inline-grid')) {
              found = true;
            }
          });
          if (found) {
            selectors.push(rule.selectorText);
          }
        }
      });
    }

    Array.from(document.styleSheets).forEach(function (sheet) {
      try {
        processRules(sheet.cssRules);
      } catch (e) {
        console.warn("failed to process sheet with error", e);
      }
    });
    return selectors;
  }

  var selectors = collectSelectors();

  // Recursively determine offsetLeft.
  function getLeft(el) {
    if (el.offsetParent) {
      return getLeft(el.offsetParent) + el.offsetLeft;
    } else {
      return el.offsetLeft;
    }
  }

  // Recursively determine offsetTop.
  function getTop(el) {
    if (el.offsetParent) {
      return getTop(el.offsetParent) + el.offsetTop;
    } else {
      return el.offsetTop;
    }
  }

  var dpr = window.devicePixelRatio;

  var overlayEl = document.createElement('canvas');
  overlayEl.width = document.documentElement.offsetWidth * dpr;
  overlayEl.height = document.documentElement.offsetHeight * dpr;
  var style = {
    pointerEvents: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    width: "100%",
    height: "100%"
  }
  for (var p in style) {
    overlayEl.style[p] = style[p];
  }
  document.body.appendChild(overlayEl);
  var ctx = overlayEl.getContext('2d');

  var els;

  function detectElements() {
    els = selectors.map(sel => document.querySelectorAll(sel));
    els = els.reduce(
      (old, current) => old.concat(Array.from(current)),
      []
    );
  }

  function measureAndDraw() {
    overlayEl.width = window.innerWidth * dpr;
    overlayEl.height = window.innerHeight * dpr;

    var viewTop = document.documentElement.scrollTop;
    var viewLeft = document.documentElement.scrollLeft;

    overlayEl.style.top = viewTop + 'px';
    overlayEl.style.left = viewLeft + 'px';

    ctx.clearRect(0,0,overlayEl.width * dpr, overlayEl.height * dpr);
    ctx.lineWidth = dpr * 2;

    function vert(x) {
      ctx.lineDashOffset = (viewTop * dpr) % 20;
      line(x - viewLeft, 0, x - viewLeft, overlayEl.height);
    }

    function horiz(y) {
      ctx.lineDashOffset = (viewLeft * dpr) % 20;
      line(0, y - viewTop, overlayEl.width, y - viewTop);
    }

    function line(x0, y0, x1, y1) {
      ctx.beginPath();
      ctx.moveTo(x0 * dpr, y0 * dpr);
      ctx.lineTo(x1 * dpr, y1 * dpr);
      ctx.stroke();
    }


    els.forEach(function (el, i) {
      ctx.setLineDash([15, 5]);

      ctx.strokeStyle = 'hsl(' + ((i * 219) % 360) + ', 100%, 50%)';

      var top = getTop(el);
      var left = getLeft(el);

      var elStyle;

      function getStyle(prop) {
        return elStyle.getPropertyValue(prop);
      }

      function parseMulti(s) {
        return s.split(/\s+/).filter(p => !isNaN(parseFloat(p, 10)));
      }

      function rect(x, y, width, height) {
        ctx.fillRect(x * dpr, y * dpr, width * dpr, height * dpr);
      }

      elStyle = window.getComputedStyle(el);

      var cols = parseMulti(getStyle('grid-template-columns'));
      var colGaps = parseMulti(getStyle('grid-column-gap'));
      var rows = parseMulti(getStyle('grid-template-rows'));
      var rowGaps = parseMulti(getStyle('grid-row-gap'));

      var pos = 0;
      ctx.fillStyle = 'rgba(0,255,255,.3)';
      for (var i = 0; i < cols.length - 1; i++) {
        pos += parseFloat(cols[i], 10);
        var gap = parseFloat(colGaps[i % colGaps.length], 10);
        vert(pos + left);
        vert(pos + gap + left);
        pos += gap;
      }

      var pos = 0;
      ctx.fillStyle = 'rgba(0,255,255,.3)';
      for (var i = 0; i < rows.length - 1; i++) {
        pos += parseFloat(rows[i], 10);
        var gap = parseFloat(rowGaps[i % rowGaps.length], 10);
        horiz(pos + top);
        horiz(pos + gap + top);
        pos += gap;
      }

    });

    ctx.setLineDash([0]);

    els.forEach(function (el, i) {
      ctx.strokeStyle = 'hsl(' + ((i * 219) % 360) + ', 100%, 50%)';

      var top = getTop(el);
      var left = getLeft(el);

      horiz(top);
      vert(left);
      horiz(top + el.offsetHeight);
      vert(left + el.offsetWidth);
    });

  }

  detectElements();
  measureAndDraw();

  var redrawScheduled = false;
  function redraw() {
    if (!redrawScheduled) {
      redrawScheduled = true;
      setTimeout(function () {
        measureAndDraw();
        redrawScheduled = false;
      }, 100);
    }
  }

  self.port.on('grid', function (state) {
    if (state === 'show') {
      overlayEl.style.display = 'block';
      collectSelectors();
      detectElements();
      measureAndDraw();
    } else {
      overlayEl.style.display = 'none';
    }
  });

  self.port.on('detach', function () {
    overlayEl.parentNode.removeChild(overlayEl);
  });

  window.addEventListener('resize', redraw);
  window.addEventListener('scroll', redraw);
})();
