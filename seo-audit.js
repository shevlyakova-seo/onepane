/*!
 * SEO Workspace — аудит сторінки за URL.
 * Працює повністю в браузері. Підключення на сторінці:
 *
 *   <div id="seo-audit"></div>
 *   <script>
 *     window.SEO_AUDIT_CONFIG = {
 *       workerUrl: 'https://seo-audit.ВАШ-ПІДДОМЕН.workers.dev',
 *       psiKey: 'ВАШ_КЛЮЧ_PAGESPEED_API'
 *     };
 *   </script>
 *   <script src="seo-audit.js" defer></script>
 *
 * Без workerUrl працює лише блок швидкості та SEO-перевірки Lighthouse.
 */
(function () {
  'use strict';

  var CONFIG = Object.assign(
    {
      workerUrl: '',
      psiKey: '',
      strategy: 'mobile',
      container: '#seo-audit',
      titleMaxPx: 600,
      titleMaxChars: 60,
      descMinChars: 70,
      descMaxChars: 160,
    },
    window.SEO_AUDIT_CONFIG || {}
  );

  /* ---------------- Стилі ---------------- */

  var CSS = [
    '.sa{--sa-bg:#ffffff;--sa-surface:#f6f7f9;--sa-border:#dfe3ea;--sa-text:#1f2430;--sa-muted:#5d6676;--sa-accent:#2f6feb;--sa-pass:#1b7f4b;--sa-pass-bg:#e5f5ec;--sa-warn:#8a5a00;--sa-warn-bg:#fdf1d8;--sa-fail:#b42318;--sa-fail-bg:#fde8e6;--sa-info:#3b4a66;--sa-info-bg:#e9eef7;font-family:inherit;color:var(--sa-text);max-width:1100px;margin:0 auto;line-height:1.5}',
    '.sa *{box-sizing:border-box}',
    '.sa-form{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}',
    '.sa-label{font-weight:600;font-size:15px}',
    '.sa-row{display:flex;gap:10px;flex-wrap:wrap}',
    '.sa-input{flex:1 1 320px;min-width:0;font:inherit;font-size:16px;padding:13px 14px;border:1.5px solid var(--sa-border);border-radius:10px;background:var(--sa-bg);color:var(--sa-text)}',
    '.sa-input:focus{outline:2px solid var(--sa-accent);outline-offset:1px;border-color:var(--sa-accent)}',
    '.sa-btn{font:inherit;font-size:15px;font-weight:600;padding:12px 20px;border-radius:10px;border:none;background:var(--sa-accent);color:#fff;cursor:pointer;min-height:46px}',
    '.sa-btn:disabled{opacity:.55;cursor:progress}',
    '.sa-btn-ghost{background:transparent;color:var(--sa-text);border:1.5px solid var(--sa-border)}',
    '.sa-hint{margin:0;font-size:13px;color:var(--sa-muted)}',
    '.sa-status{min-height:22px;font-size:14px;color:var(--sa-muted);margin-bottom:12px}',
    '.sa-results{display:flex;flex-direction:column;gap:16px}',
    '.sa-card{background:var(--sa-bg);border:1.5px solid var(--sa-border);border-radius:14px;padding:18px 20px}',
    '.sa-card h3{margin:0 0 12px;font-size:17px}',
    '.sa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}',
    '.sa-kpi{background:var(--sa-surface);border-radius:10px;padding:12px 14px}',
    '.sa-kpi span{display:block;font-size:13px;color:var(--sa-muted)}',
    '.sa-kpi strong{display:block;font-size:24px;margin-top:2px}',
    '.sa-table-wrap{overflow-x:auto}',
    '.sa-table{width:100%;border-collapse:collapse;font-size:14px;min-width:620px}',
    '.sa-table th{text-align:left;font-size:12px;color:var(--sa-muted);font-weight:600;padding:8px 10px;border-bottom:1.5px solid var(--sa-border)}',
    '.sa-table td{padding:9px 10px;border-bottom:1px solid var(--sa-border);vertical-align:top;word-break:break-word}',
    '.sa-badge{display:inline-block;font-size:12px;font-weight:700;padding:2px 9px;border-radius:99px;white-space:nowrap}',
    '.sa-pass{color:var(--sa-pass);background:var(--sa-pass-bg)}',
    '.sa-warn{color:var(--sa-warn);background:var(--sa-warn-bg)}',
    '.sa-fail{color:var(--sa-fail);background:var(--sa-fail-bg)}',
    '.sa-info{color:var(--sa-info);background:var(--sa-info-bg)}',
    '.sa-serp{border:1px solid var(--sa-border);border-radius:10px;padding:14px 16px;font-family:Arial,sans-serif;max-width:640px}',
    '.sa-serp-url{font-size:13px;color:#4d5156;margin-bottom:4px;word-break:break-all}',
    '.sa-serp-title{font-size:20px;color:#1a0dab;line-height:1.3;margin-bottom:4px}',
    '.sa-serp-desc{font-size:14px;color:#4d5156;line-height:1.58}',
    '.sa-meta{font-size:13px;color:var(--sa-muted);margin-top:8px}',
    '.sa-outline{margin:0;padding:0;list-style:none;font-size:14px;max-height:340px;overflow:auto}',
    '.sa-outline li{padding:3px 0}',
    '.sa-outline .sa-h2{padding-left:18px}',
    '.sa-outline .sa-h3{padding-left:36px;color:var(--sa-muted)}',
    '.sa-tag{display:inline-block;font-size:11px;font-weight:700;color:var(--sa-muted);border:1px solid var(--sa-border);border-radius:4px;padding:0 5px;margin-right:6px}',
    '.sa-list{margin:0;padding-left:18px;font-size:14px}',
    '.sa-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}',
    '.sa-note{font-size:13px;color:var(--sa-muted);margin:8px 0 0}',
    '.sa-ai-item{display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--sa-border);font-size:15px}',
    '@media (max-width:600px){.sa-card{padding:14px}.sa-kpi strong{font-size:20px}}',
  ].join('\n');

  /* ---------------- Утиліти ---------------- */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clean(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function normalizeInputUrl(raw) {
    var v = clean(raw);
    if (!v) return null;
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    try {
      var u = new URL(v);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
      return u.toString();
    } catch (e) {
      return null;
    }
  }

  function sameUrl(a, b) {
    try {
      var x = new URL(a);
      var y = new URL(b);
      var px = x.pathname.replace(/\/+$/, '') || '/';
      var py = y.pathname.replace(/\/+$/, '') || '/';
      return x.protocol === y.protocol && x.host.toLowerCase() === y.host.toLowerCase() && px === py && x.search === y.search;
    } catch (e) {
      return false;
    }
  }

  var measureCanvas = null;
  function textWidth(text, font) {
    if (typeof document === 'undefined') return 0;
    try {
      measureCanvas = measureCanvas || document.createElement('canvas');
      var ctx = measureCanvas.getContext && measureCanvas.getContext('2d');
      if (!ctx) return 0;
      ctx.font = font;
      return Math.round(ctx.measureText(text).width);
    } catch (e) {
      return 0;
    }
  }

  function truncateToWidth(text, font, maxPx) {
    if (!text) return '';
    if (textWidth(text, font) <= maxPx || textWidth('a', font) === 0) return text;
    var out = text;
    while (out.length > 1 && textWidth(out + ' …', font) > maxPx) out = out.slice(0, -1);
    return out.replace(/\s+\S*$/, '') + ' …';
  }

  function primaryLang(code) {
    return String(code || '').toLowerCase().split(/[-_]/)[0];
  }

  /* ---------------- robots.txt ---------------- */

  function parseRobots(text) {
    var groups = [];
    var current = null;
    var lastWasAgent = false;
    String(text || '')
      .split(/\r?\n/)
      .forEach(function (rawLine) {
        var line = rawLine.replace(/#.*$/, '').trim();
        if (!line) return;
        var idx = line.indexOf(':');
        if (idx === -1) return;
        var key = line.slice(0, idx).trim().toLowerCase();
        var value = line.slice(idx + 1).trim();
        if (key === 'user-agent') {
          if (!current || !lastWasAgent) {
            current = { agents: [], rules: [] };
            groups.push(current);
          }
          current.agents.push(value.toLowerCase());
          lastWasAgent = true;
        } else if (key === 'allow' || key === 'disallow') {
          if (current) current.rules.push({ allow: key === 'allow', path: value });
          lastWasAgent = false;
        } else {
          lastWasAgent = false;
        }
      });
    return groups;
  }

  function robotsRuleToRegex(path) {
    var anchored = path.endsWith('$');
    var body = anchored ? path.slice(0, -1) : path;
    var pattern = body
      .split('*')
      .map(function (part) {
        return part.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      })
      .join('.*');
    return new RegExp('^' + pattern + (anchored ? '$' : ''));
  }

  function robotsCheck(text, url, agent) {
    agent = (agent || 'googlebot').toLowerCase();
    var groups = parseRobots(text);
    var specific = groups.filter(function (g) {
      return g.agents.indexOf(agent) !== -1;
    });
    var chosen = specific.length
      ? specific
      : groups.filter(function (g) {
          return g.agents.indexOf('*') !== -1;
        });
    var target;
    try {
      var u = new URL(url);
      target = u.pathname + u.search;
    } catch (e) {
      return { allowed: true, rule: null };
    }
    var best = null;
    chosen.forEach(function (g) {
      g.rules.forEach(function (r) {
        if (!r.path) return;
        if (!robotsRuleToRegex(r.path).test(target)) return;
        var len = r.path.replace(/[*$]/g, '').length;
        if (!best || len > best.len || (len === best.len && r.allow && !best.allow)) {
          best = { len: len, allow: r.allow, path: r.path };
        }
      });
    });
    return {
      allowed: !best || best.allow,
      rule: best ? (best.allow ? 'Allow: ' : 'Disallow: ') + best.path : null,
      group: specific.length ? 'Googlebot' : chosen.length ? '*' : null,
    };
  }

  /* ---------------- Розбір HTML ---------------- */

  function collectSchemaTypes(node, out) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(function (n) {
        collectSchemaTypes(n, out);
      });
      return;
    }
    if (node['@type']) {
      [].concat(node['@type']).forEach(function (t) {
        out.push(String(t));
      });
    }
    if (node['@graph']) collectSchemaTypes(node['@graph'], out);
  }

  function analyzeHtml(html, baseUrl) {
    var doc = new DOMParser().parseFromString(html || '', 'text/html');
    var q = function (sel) {
      return doc.querySelector(sel);
    };
    var qa = function (sel) {
      return Array.prototype.slice.call(doc.querySelectorAll(sel));
    };
    var abs = function (href) {
      try {
        return new URL(href, baseUrl).toString();
      } catch (e) {
        return href;
      }
    };
    var metaContent = function (sel) {
      var m = q(sel);
      return m ? clean(m.getAttribute('content')) : null;
    };

    var titles = qa('head title, title');
    var uniqueTitles = titles.filter(function (t, i) {
      return titles.indexOf(t) === i;
    });

    var headings = qa('h1, h2, h3').map(function (h) {
      return { level: Number(h.tagName.slice(1)), text: clean(h.textContent) };
    });

    var hreflang = qa('link[rel~="alternate" i][hreflang]').map(function (l) {
      return { lang: clean(l.getAttribute('hreflang')), href: abs(l.getAttribute('href') || '') };
    });

    var jsonLd = qa('script[type="application/ld+json" i]').map(function (s) {
      var raw = s.textContent || '';
      try {
        var parsed = JSON.parse(raw);
        var types = [];
        collectSchemaTypes(parsed, types);
        return { ok: true, types: types };
      } catch (e) {
        return { ok: false, types: [], error: e.message };
      }
    });

    var images = qa('img');
    var imgNoAlt = images.filter(function (i) {
      return !i.hasAttribute('alt');
    }).length;
    var imgEmptyAlt = images.filter(function (i) {
      return i.hasAttribute('alt') && !clean(i.getAttribute('alt'));
    }).length;

    var host = '';
    try {
      host = new URL(baseUrl).host.toLowerCase();
    } catch (e) {}
    var internal = 0;
    var external = 0;
    var nofollow = 0;
    qa('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (/^(#|javascript:|mailto:|tel:)/i.test(href)) return;
      var u;
      try {
        u = new URL(href, baseUrl);
      } catch (e) {
        return;
      }
      if (u.host.toLowerCase() === host) internal++;
      else external++;
      if (/nofollow/i.test(a.getAttribute('rel') || '')) nofollow++;
    });

    var bodyText = '';
    if (doc.body) {
      var clone = doc.body.cloneNode(true);
      Array.prototype.slice.call(clone.querySelectorAll('script, style, noscript, template, svg')).forEach(function (n) {
        n.remove();
      });
      bodyText = clean(clone.textContent);
    }
    var words = bodyText ? bodyText.split(' ').filter(function (w) {
      return /[\p{L}\p{N}]/u.test(w);
    }).length : 0;

    var canonicals = qa('link[rel~="canonical" i]').map(function (l) {
      return abs(l.getAttribute('href') || '');
    });

    return {
      title: uniqueTitles.length ? clean(uniqueTitles[0].textContent) : null,
      titleCount: uniqueTitles.length,
      description: metaContent('meta[name="description" i]'),
      descriptionCount: qa('meta[name="description" i]').length,
      robotsMeta: [metaContent('meta[name="robots" i]'), metaContent('meta[name="googlebot" i]')].filter(Boolean).join(', ') || null,
      canonicals: canonicals,
      htmlLang: clean(doc.documentElement.getAttribute('lang')) || null,
      viewport: metaContent('meta[name="viewport" i]'),
      h1: headings.filter(function (h) {
        return h.level === 1;
      }),
      headings: headings,
      hreflang: hreflang,
      jsonLd: jsonLd,
      og: {
        title: metaContent('meta[property="og:title" i]'),
        description: metaContent('meta[property="og:description" i]'),
        image: metaContent('meta[property="og:image" i]'),
      },
      images: { total: images.length, noAlt: imgNoAlt, emptyAlt: imgEmptyAlt },
      links: { internal: internal, external: external, nofollow: nofollow },
      words: words,
      text: bodyText,
    };
  }

  /* ---------------- Перевірки ---------------- */

  var HREFLANG_RE = /^(x-default|[a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?)$/i;

  function buildChecks(page, fetchInfo, lang) {
    var checks = [];
    var add = function (group, name, status, value) {
      checks.push({ group: group, name: name, status: status, value: value });
    };

    // Доступність
    var chain = fetchInfo.chain || [];
    add('Доступність', 'Код відповіді', fetchInfo.status === 200 ? 'pass' : fetchInfo.status >= 400 ? 'fail' : 'warn', String(fetchInfo.status));
    if (chain.length > 1) {
      add(
        'Доступність',
        'Редиректи',
        chain.length > 2 ? 'warn' : 'info',
        chain
          .map(function (c) {
            return c.status + ' ' + c.url;
          })
          .join(' → ')
      );
    } else {
      add('Доступність', 'Редиректи', 'pass', 'Немає');
    }

    // Індексація
    var robotsMeta = (page.robotsMeta || '').toLowerCase();
    var xRobots = (fetchInfo.headers && fetchInfo.headers.xRobotsTag ? fetchInfo.headers.xRobotsTag : '').toLowerCase();
    add('Індексація', 'Meta robots', /noindex|none/.test(robotsMeta) ? 'fail' : 'pass', page.robotsMeta || 'не вказано (index за замовчуванням)');
    add('Індексація', 'X-Robots-Tag', /noindex|none/.test(xRobots) ? 'fail' : 'pass', xRobots || 'немає');

    var robots = fetchInfo.robots || {};
    if (robots.status === 200) {
      var rc = robotsCheck(robots.text, fetchInfo.finalUrl, 'googlebot');
      add('Індексація', 'robots.txt для Googlebot', rc.allowed ? 'pass' : 'fail', rc.rule ? rc.rule + ' (група ' + rc.group + ')' : 'Сканування дозволено');
    } else if (robots.status >= 400 && robots.status < 500) {
      add('Індексація', 'robots.txt для Googlebot', 'info', 'Файл не знайдено (' + robots.status + ') — сканування дозволено');
    } else {
      add('Індексація', 'robots.txt для Googlebot', 'warn', 'Не вдалося отримати' + (robots.status ? ' (' + robots.status + ')' : ''));
    }

    if (!page.canonicals.length) {
      add('Індексація', 'Canonical', 'warn', 'Не вказано');
    } else if (page.canonicals.length > 1) {
      add('Індексація', 'Canonical', 'fail', 'Кілька тегів: ' + page.canonicals.join(', '));
    } else if (sameUrl(page.canonicals[0], fetchInfo.finalUrl)) {
      add('Індексація', 'Canonical', 'pass', 'Вказує на себе');
    } else {
      add('Індексація', 'Canonical', 'warn', 'Вказує на іншу сторінку: ' + page.canonicals[0]);
    }

    // Мета-теги
    if (!page.title) {
      add('Мета-теги', 'Title', 'fail', 'Відсутній');
    } else {
      var tPx = textWidth(page.title, '20px Arial');
      var tLen = page.title.length;
      var tStatus = tLen < 30 || tLen > CONFIG.titleMaxChars || (tPx && tPx > CONFIG.titleMaxPx) ? 'warn' : 'pass';
      add('Мета-теги', 'Title', page.titleCount > 1 ? 'fail' : tStatus, tLen + ' симв.' + (tPx ? ' · ≈' + tPx + ' px з ' + CONFIG.titleMaxPx : '') + (page.titleCount > 1 ? ' · тегів title: ' + page.titleCount : ''));
    }
    if (!page.description) {
      add('Мета-теги', 'Meta description', 'warn', 'Відсутній — Google візьме фрагмент тексту');
    } else {
      var dLen = page.description.length;
      add(
        'Мета-теги',
        'Meta description',
        page.descriptionCount > 1 ? 'fail' : dLen < CONFIG.descMinChars || dLen > CONFIG.descMaxChars ? 'warn' : 'pass',
        dLen + ' симв. (норма ' + CONFIG.descMinChars + '–' + CONFIG.descMaxChars + ')' + (page.descriptionCount > 1 ? ' · тегів: ' + page.descriptionCount : '')
      );
    }
    add('Мета-теги', 'Open Graph', page.og.title && page.og.image ? 'pass' : 'warn', page.og.title && page.og.image ? 'og:title і og:image є' : 'Бракує ' + [!page.og.title && 'og:title', !page.og.image && 'og:image'].filter(Boolean).join(', '));

    // Контент
    add('Контент', 'H1', page.h1.length === 1 ? 'pass' : page.h1.length === 0 ? 'fail' : 'warn', page.h1.length === 0 ? 'Відсутній' : page.h1.length === 1 ? page.h1[0].text : page.h1.length + ' заголовки H1');
    add('Контент', 'Обсяг тексту', page.words < 150 ? 'warn' : 'pass', page.words + ' слів у HTML');
    add('Контент', 'Посилання', 'info', 'внутрішніх ' + page.links.internal + ' · зовнішніх ' + page.links.external + ' · nofollow ' + page.links.nofollow);

    // Мови
    add('Мови', 'Атрибут lang', page.htmlLang ? 'pass' : 'warn', page.htmlLang || 'Не вказано');
    if (lang && lang.available && lang.lang && page.htmlLang) {
      var match = primaryLang(lang.lang) === primaryLang(page.htmlLang);
      add('Мови', 'Реальна мова тексту', match ? 'pass' : 'fail', lang.lang + ' (впевненість ' + Math.round(lang.confidence * 100) + '%)' + (match ? '' : ' ≠ lang="' + page.htmlLang + '"'));
    }
    if (page.hreflang.length) {
      var invalid = page.hreflang.filter(function (h) {
        return !HREFLANG_RE.test(h.lang);
      });
      var self = page.hreflang.filter(function (h) {
        return sameUrl(h.href, fetchInfo.finalUrl);
      });
      var xdef = page.hreflang.some(function (h) {
        return h.lang.toLowerCase() === 'x-default';
      });
      add('Мови', 'hreflang: коди', invalid.length ? 'fail' : 'pass', invalid.length ? 'Некоректні: ' + invalid.map(function (h) { return h.lang; }).join(', ') : page.hreflang.length + ' версій');
      add('Мови', 'hreflang: посилання на себе', self.length ? 'pass' : 'fail', self.length ? self[0].lang : 'Немає — версія не посилається сама на себе');
      add('Мови', 'hreflang: x-default', xdef ? 'pass' : 'warn', xdef ? 'Є' : 'Немає');
      if (self.length && lang && lang.available && lang.lang && self[0].lang.toLowerCase() !== 'x-default') {
        var selfMatch = primaryLang(self[0].lang) === primaryLang(lang.lang);
        add('Мови', 'hreflang vs мова тексту', selfMatch ? 'pass' : 'fail', 'hreflang="' + self[0].lang + '", текст: ' + lang.lang);
      }
    } else {
      add('Мови', 'hreflang', 'info', 'Не використовується');
    }

    // Мікророзмітка
    if (!page.jsonLd.length) {
      add('Мікророзмітка', 'JSON-LD', 'info', 'Не знайдено');
    } else {
      var broken = page.jsonLd.filter(function (j) {
        return !j.ok;
      });
      var types = [];
      page.jsonLd.forEach(function (j) {
        types = types.concat(j.types);
      });
      add('Мікророзмітка', 'JSON-LD', broken.length ? 'fail' : 'pass', (types.length ? types.join(', ') : 'типи не вказано') + (broken.length ? ' · помилка JSON: ' + broken[0].error : ''));
    }

    // Зображення та мобільність
    add('Зображення', 'Alt у зображень', page.images.noAlt ? 'warn' : 'pass', page.images.total + ' зображень · без alt: ' + page.images.noAlt + ' · порожній alt: ' + page.images.emptyAlt);
    add('Мобільність', 'Meta viewport', page.viewport ? 'pass' : 'fail', page.viewport || 'Відсутній');

    return checks;
  }

  /* ---------------- Зовнішні дані ---------------- */

  function fetchPage(url) {
    if (!CONFIG.workerUrl) return Promise.resolve(null);
    var endpoint = CONFIG.workerUrl.replace(/\/$/, '') + '/?url=' + encodeURIComponent(url);
    return fetch(endpoint).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || 'Помилка ' + r.status);
        return data;
      });
    });
  }

  function fetchPsi(url) {
    var params = new URLSearchParams({ url: url, strategy: CONFIG.strategy, locale: 'uk' });
    params.append('category', 'performance');
    params.append('category', 'seo');
    if (CONFIG.psiKey) params.set('key', CONFIG.psiKey);
    return fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?' + params.toString()).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) {
          var msg = data && data.error && data.error.message ? data.error.message : 'Помилка ' + r.status;
          if (r.status === 429) msg = 'Вичерпано ліміт запитів PageSpeed. Додайте власний API-ключ у налаштуваннях.';
          throw new Error(msg);
        }
        return parsePsi(data);
      });
    });
  }

  function parsePsi(data) {
    var lh = data.lighthouseResult || {};
    var cats = lh.categories || {};
    var audits = lh.audits || {};
    var field = data.loadingExperience && data.loadingExperience.metrics ? data.loadingExperience : null;
    var fieldScope = 'сторінка';
    if (!field && data.originLoadingExperience && data.originLoadingExperience.metrics) {
      field = data.originLoadingExperience;
      fieldScope = 'весь домен';
    }
    var metric = function (key, transform) {
      if (!field || !field.metrics[key]) return null;
      var m = field.metrics[key];
      return { value: transform ? transform(m.percentile) : m.percentile, category: m.category };
    };
    var seoFails = ((cats.seo && cats.seo.auditRefs) || [])
      .map(function (ref) {
        return audits[ref.id];
      })
      .filter(function (a) {
        return a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== 'manual' && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'informative';
      })
      .map(function (a) {
        return { title: a.title, value: a.displayValue || '' };
      });
    return {
      performance: cats.performance ? Math.round(cats.performance.score * 100) : null,
      seo: cats.seo ? Math.round(cats.seo.score * 100) : null,
      lab: {
        lcp: audits['largest-contentful-paint'] ? audits['largest-contentful-paint'].displayValue : null,
        cls: audits['cumulative-layout-shift'] ? audits['cumulative-layout-shift'].displayValue : null,
        tbt: audits['total-blocking-time'] ? audits['total-blocking-time'].displayValue : null,
      },
      field: field
        ? {
            scope: fieldScope,
            lcp: metric('LARGEST_CONTENTFUL_PAINT_MS', function (v) {
              return (v / 1000).toFixed(1) + ' с';
            }),
            inp: metric('INTERACTION_TO_NEXT_PAINT', function (v) {
              return v + ' мс';
            }),
            cls: metric('CUMULATIVE_LAYOUT_SHIFT_SCORE', function (v) {
              return (v / 100).toFixed(2);
            }),
          }
        : null,
      seoFails: seoFails,
    };
  }

  function detectLanguage(text) {
    if (!text || typeof self === 'undefined' || !('LanguageDetector' in self)) return Promise.resolve({ available: false });
    var Detector = self.LanguageDetector;
    return Detector.availability()
      .then(function (a) {
        if (a === 'unavailable') return { available: false };
        return Detector.create().then(function (d) {
          return d.detect(text.slice(0, 5000)).then(function (res) {
            var top = res && res[0];
            if (!top || top.detectedLanguage === 'und') return { available: false };
            return { available: true, lang: top.detectedLanguage, confidence: top.confidence };
          });
        });
      })
      .catch(function () {
        return { available: false };
      });
  }

  /* ---------------- ШІ: варіанти title ---------------- */

  function generateTitles(page, onStatus) {
    if (typeof self === 'undefined' || !('LanguageModel' in self)) {
      return Promise.reject(new Error('Вбудований ШІ недоступний у цьому браузері. Потрібен Google Chrome 148+ на компʼютері.'));
    }
    var LM = self.LanguageModel;
    var lang = primaryLang(page.htmlLang) || 'en';
    var tryLangs = lang === 'en' ? ['en'] : [lang, 'en'];

    function pick(i) {
      if (i >= tryLangs.length) return Promise.reject(new Error('Модель ШІ недоступна на цьому пристрої.'));
      var opts = {
        expectedInputs: [{ type: 'text', languages: [tryLangs[i]] }],
        expectedOutputs: [{ type: 'text', languages: [tryLangs[i]] }],
      };
      return LM.availability(opts).then(function (a) {
        return a === 'unavailable' ? pick(i + 1) : opts;
      });
    }

    return pick(0).then(function (opts) {
      opts.monitor = function (m) {
        m.addEventListener('downloadprogress', function (e) {
          onStatus('Завантаження моделі ШІ: ' + Math.round(e.loaded * 100) + '%');
        });
      };
      return LM.create(opts).then(function (session) {
        onStatus('ШІ пише варіанти…');
        var h1 = page.h1.length ? page.h1[0].text : '';
        var prompt =
          'You are an SEO specialist. Write exactly 3 alternative <title> tags for this web page.\n' +
          'Rules: each at most ' + CONFIG.titleMaxChars + ' characters; main keyword at the very beginning; no quotes; no ALL CAPS; ' +
          'write in the same language as the page (language code: ' + (page.htmlLang || 'detect it from the text') + ').\n\n' +
          'Current title: ' + (page.title || '(missing)') + '\n' +
          'H1: ' + h1 + '\n' +
          'Meta description: ' + (page.description || '(missing)') + '\n' +
          'Page text (excerpt): ' + page.text.slice(0, 1500);
        var schema = {
          type: 'object',
          properties: { titles: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 } },
          required: ['titles'],
        };
        return session.prompt(prompt, { responseConstraint: schema }).then(function (res) {
          if (session.destroy) session.destroy();
          var parsed = JSON.parse(res);
          return (parsed.titles || []).map(clean).filter(Boolean);
        });
      });
    });
  }

  /* ---------------- Відображення ---------------- */

  var STATUS_LABEL = { pass: 'OK', warn: 'Увага', fail: 'Помилка', info: 'Інфо' };
  var CWV_LABEL = { FAST: 'добре', AVERAGE: 'потребує уваги', SLOW: 'погано' };
  var CWV_CLASS = { FAST: 'pass', AVERAGE: 'warn', SLOW: 'fail' };

  function badge(status, text) {
    return '<span class="sa-badge sa-' + status + '">' + esc(text || STATUS_LABEL[status]) + '</span>';
  }

  function renderSummary(checks, fetchInfo) {
    var count = { pass: 0, warn: 0, fail: 0, info: 0 };
    checks.forEach(function (c) {
      count[c.status]++;
    });
    return (
      '<section class="sa-card"><h3>Підсумок</h3><div class="sa-grid">' +
      '<div class="sa-kpi"><span>Помилки</span><strong style="color:var(--sa-fail)">' + count.fail + '</strong></div>' +
      '<div class="sa-kpi"><span>Потребує уваги</span><strong style="color:var(--sa-warn)">' + count.warn + '</strong></div>' +
      '<div class="sa-kpi"><span>Без проблем</span><strong style="color:var(--sa-pass)">' + count.pass + '</strong></div>' +
      '<div class="sa-kpi"><span>Код відповіді</span><strong>' + esc(fetchInfo.status) + '</strong></div>' +
      '</div><p class="sa-note">Фінальна адреса: ' + esc(fetchInfo.finalUrl) + ' · перевірено ' + esc(new Date(fetchInfo.fetchedAt).toLocaleString('uk-UA')) + '</p></section>'
    );
  }

  function renderSerp(page, url) {
    var u;
    try {
      u = new URL(url);
    } catch (e) {
      u = { host: url, pathname: '' };
    }
    var crumbs = u.host + u.pathname.replace(/\/$/, '').split('/').filter(Boolean).map(function (p) {
      return ' › ' + decodeURIComponentSafe(p);
    }).join('');
    var title = page.title ? truncateToWidth(page.title, '20px Arial', CONFIG.titleMaxPx) : '(title відсутній)';
    var desc = page.description ? truncateToWidth(page.description, '14px Arial', 920) : '(meta description відсутній — Google підставить фрагмент тексту)';
    return (
      '<section class="sa-card"><h3>Превʼю у видачі Google</h3><div class="sa-serp">' +
      '<div class="sa-serp-url">' + esc(crumbs) + '</div>' +
      '<div class="sa-serp-title">' + esc(title) + '</div>' +
      '<div class="sa-serp-desc">' + esc(desc) + '</div></div>' +
      '<p class="sa-note">Приблизне превʼю для компʼютера. Google може переписати title і description.</p></section>'
    );
  }

  function decodeURIComponentSafe(s) {
    try {
      return decodeURIComponent(s);
    } catch (e) {
      return s;
    }
  }

  function renderChecks(checks) {
    var rows = checks
      .map(function (c) {
        return '<tr><td>' + esc(c.group) + '</td><td>' + esc(c.name) + '</td><td>' + badge(c.status) + '</td><td>' + esc(c.value) + '</td></tr>';
      })
      .join('');
    return (
      '<section class="sa-card"><h3>Перевірки</h3><div class="sa-table-wrap"><table class="sa-table">' +
      '<thead><tr><th>Розділ</th><th>Перевірка</th><th>Статус</th><th>Значення</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="sa-actions"><button type="button" class="sa-btn sa-btn-ghost" data-sa="copy">Копіювати для Google Таблиць</button></div></section>'
    );
  }

  function renderOutline(page) {
    if (!page.headings.length) return '';
    var items = page.headings
      .slice(0, 60)
      .map(function (h) {
        return '<li class="sa-h' + h.level + '"><span class="sa-tag">H' + h.level + '</span>' + esc(h.text || '(порожній)') + '</li>';
      })
      .join('');
    return '<section class="sa-card"><h3>Структура заголовків</h3><ul class="sa-outline">' + items + '</ul></section>';
  }

  function renderHreflang(page, finalUrl) {
    if (!page.hreflang.length) return '';
    var rows = page.hreflang
      .map(function (h) {
        var valid = HREFLANG_RE.test(h.lang);
        return '<tr><td>' + esc(h.lang) + '</td><td>' + esc(h.href) + '</td><td>' + (sameUrl(h.href, finalUrl) ? badge('info', 'ця сторінка') : '') + (valid ? '' : badge('fail', 'некоректний код')) + '</td></tr>';
      })
      .join('');
    return '<section class="sa-card"><h3>Мовні версії (hreflang)</h3><div class="sa-table-wrap"><table class="sa-table"><thead><tr><th>Код</th><th>URL</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }

  function renderPsi(psi) {
    if (!psi) return '';
    if (psi.error) {
      return '<section class="sa-card"><h3>Швидкість (PageSpeed)</h3><p class="sa-note">' + esc(psi.error) + '</p></section>';
    }
    var cwv = '';
    if (psi.field) {
      cwv = ['lcp', 'inp', 'cls']
        .map(function (k) {
          var m = psi.field[k];
          if (!m) return '';
          return '<div class="sa-kpi"><span>' + k.toUpperCase() + ' · реальні користувачі</span><strong>' + esc(m.value) + '</strong>' + badge(CWV_CLASS[m.category] || 'info', CWV_LABEL[m.category] || m.category) + '</div>';
        })
        .join('');
    }
    var fails = psi.seoFails.length
      ? '<ul class="sa-list">' + psi.seoFails.map(function (f) {
          return '<li>' + esc(f.title) + (f.value ? ' — ' + esc(f.value) : '') + '</li>';
        }).join('') + '</ul>'
      : '<p class="sa-note">Усі автоматичні SEO-перевірки Lighthouse пройдено.</p>';
    return (
      '<section class="sa-card"><h3>Швидкість і Lighthouse (' + (CONFIG.strategy === 'mobile' ? 'мобільна версія' : 'компʼютер') + ')</h3><div class="sa-grid">' +
      '<div class="sa-kpi"><span>Продуктивність</span><strong>' + esc(psi.performance) + '</strong></div>' +
      '<div class="sa-kpi"><span>SEO (Lighthouse)</span><strong>' + esc(psi.seo) + '</strong></div>' +
      '<div class="sa-kpi"><span>LCP · лабораторія</span><strong>' + esc(psi.lab.lcp || '—') + '</strong></div>' +
      '<div class="sa-kpi"><span>CLS · лабораторія</span><strong>' + esc(psi.lab.cls || '—') + '</strong></div>' +
      cwv +
      '</div>' +
      (psi.field ? '<p class="sa-note">Реальні дані Chrome (CrUX): ' + esc(psi.field.scope) + ', 75-й перцентиль за 28 днів.</p>' : '<p class="sa-note">Реальних даних Chrome для цієї сторінки немає — замало трафіку.</p>') +
      '<h3 style="margin-top:16px">Що Lighthouse радить виправити</h3>' + fails + '</section>'
    );
  }

  function renderAi() {
    return (
      '<section class="sa-card" data-sa="ai-card"><h3>Варіанти title від ШІ</h3>' +
      '<p class="sa-note" style="margin-top:0">Генерує вбудований ШІ Chrome просто на вашому компʼютері — текст сторінки нікуди не відправляється.</p>' +
      '<div class="sa-actions"><button type="button" class="sa-btn" data-sa="ai">Згенерувати 3 варіанти</button></div>' +
      '<div data-sa="ai-out"></div></section>'
    );
  }

  function renderNoWorker() {
    return '<section class="sa-card"><h3>Повний розбір HTML вимкнено</h3><p class="sa-note" style="margin-top:0">Щоб перевіряти title, H1, canonical, hreflang, robots.txt і мікророзмітку, вкажіть workerUrl у налаштуваннях. Зараз показано лише дані PageSpeed.</p></section>';
  }

  function checksToTsv(checks, url) {
    var lines = [['URL', 'Розділ', 'Перевірка', 'Статус', 'Значення'].join('\t')];
    checks.forEach(function (c) {
      lines.push([url, c.group, c.name, STATUS_LABEL[c.status], c.value].map(function (v) {
        return String(v).replace(/[\t\r\n]+/g, ' ');
      }).join('\t'));
    });
    return lines.join('\n');
  }

  /* ---------------- Запуск ---------------- */

  function mount(root) {
    if (!document.getElementById('sa-styles')) {
      var style = document.createElement('style');
      style.id = 'sa-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    root.classList.add('sa');
    root.innerHTML =
      '<form class="sa-form" novalidate>' +
      '<label class="sa-label" for="sa-url">URL сторінки</label>' +
      '<div class="sa-row"><input class="sa-input" id="sa-url" name="url" type="url" inputmode="url" autocomplete="url" placeholder="https://example.com/storinka" required>' +
      '<button class="sa-btn" type="submit">Перевірити</button></div>' +
      '<p class="sa-hint">Сторінка завантажується без виконання JavaScript — так, як її бачить пошуковий бот при першому скануванні.</p>' +
      '</form><div class="sa-status" role="status" aria-live="polite"></div><div class="sa-results"></div>';

    var form = root.querySelector('form');
    var input = root.querySelector('#sa-url');
    var button = form.querySelector('button');
    var status = root.querySelector('.sa-status');
    var results = root.querySelector('.sa-results');
    var state = { page: null, checks: [], url: '' };

    var setStatus = function (text) {
      status.textContent = text || '';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var url = normalizeInputUrl(input.value);
      if (!url) {
        setStatus('Введіть коректну адресу, наприклад https://example.com/storinka');
        input.focus();
        return;
      }
      input.value = url;
      button.disabled = true;
      results.innerHTML = '';
      setStatus(CONFIG.workerUrl ? 'Завантажую сторінку і запускаю PageSpeed (до 40 секунд)…' : 'Запускаю PageSpeed (до 40 секунд)…');

      var psiPromise = fetchPsi(url).catch(function (err) {
        return { error: 'PageSpeed: ' + err.message };
      });

      fetchPage(url)
        .then(function (fetchInfo) {
          if (!fetchInfo) {
            results.innerHTML = renderNoWorker();
            return psiPromise.then(function (psi) {
              results.insertAdjacentHTML('beforeend', renderPsi(psi));
            });
          }
          var page = analyzeHtml(fetchInfo.html, fetchInfo.finalUrl);
          state.page = page;
          state.url = fetchInfo.finalUrl;
          setStatus('Сторінку отримано. Визначаю мову тексту…');
          return detectLanguage(page.text).then(function (lang) {
            var checks = buildChecks(page, fetchInfo, lang);
            state.checks = checks;
            results.innerHTML =
              renderSummary(checks, fetchInfo) +
              renderSerp(page, fetchInfo.finalUrl) +
              renderChecks(checks) +
              renderAi() +
              renderOutline(page) +
              renderHreflang(page, fetchInfo.finalUrl);
            if (fetchInfo.htmlTruncated) {
              results.insertAdjacentHTML('afterbegin', '<p class="sa-note">HTML більший за 3 МБ — перевірено лише першу частину.</p>');
            }
            setStatus('Чекаю на PageSpeed…');
            return psiPromise.then(function (psi) {
              results.insertAdjacentHTML('beforeend', renderPsi(psi));
            });
          });
        })
        .then(function () {
          setStatus('Готово.');
        })
        .catch(function (err) {
          setStatus('');
          results.innerHTML = '<section class="sa-card"><h3>Не вдалося перевірити сторінку</h3><p class="sa-note" style="margin-top:0">' + esc(err.message) + '</p></section>';
        })
        .then(function () {
          button.disabled = false;
        });
    });

    results.addEventListener('click', function (e) {
      var target = e.target.closest('[data-sa]');
      if (!target) return;
      var action = target.getAttribute('data-sa');

      if (action === 'copy') {
        var tsv = checksToTsv(state.checks, state.url);
        navigator.clipboard.writeText(tsv).then(
          function () {
            target.textContent = 'Скопійовано ✓';
            setTimeout(function () {
              target.textContent = 'Копіювати для Google Таблиць';
            }, 2000);
          },
          function () {
            setStatus('Не вдалося скопіювати — дозвольте доступ до буфера обміну.');
          }
        );
      }

      if (action === 'ai' && state.page) {
        var out = results.querySelector('[data-sa="ai-out"]');
        target.disabled = true;
        out.innerHTML = '<p class="sa-note">Готую модель…</p>';
        generateTitles(state.page, function (msg) {
          out.innerHTML = '<p class="sa-note">' + esc(msg) + '</p>';
        })
          .then(function (titles) {
            out.innerHTML = titles
              .map(function (t) {
                var px = textWidth(t, '20px Arial');
                var ok = t.length <= CONFIG.titleMaxChars && (!px || px <= CONFIG.titleMaxPx);
                return '<div class="sa-ai-item"><span>' + esc(t) + '</span>' + badge(ok ? 'pass' : 'warn', t.length + ' симв.' + (px ? ' · ' + px + ' px' : '')) + '</div>';
              })
              .join('') + '<p class="sa-note">Це пропозиції — перевірте їх перед використанням.</p>';
          })
          .catch(function (err) {
            out.innerHTML = '<p class="sa-note">' + esc(err.message) + '</p>';
          })
          .then(function () {
            target.disabled = false;
          });
      }
    });
  }

  window.SeoAudit = {
    analyzeHtml: analyzeHtml,
    buildChecks: buildChecks,
    robotsCheck: robotsCheck,
    parsePsi: parsePsi,
    checksToTsv: checksToTsv,
    mount: mount,
  };

  function init() {
    var root = document.querySelector(CONFIG.container);
    if (root) mount(root);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
