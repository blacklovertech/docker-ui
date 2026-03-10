(function (global) {
    'use strict';

    var STORAGE_KEY = 'dockerui.lang';

    function cookieGet(name) {
        try {
            if (global.jQuery && typeof global.jQuery.cookie === 'function') {
                return global.jQuery.cookie(name);
            }
        } catch (e) {}
        try {
            var all = global.document && global.document.cookie ? global.document.cookie : '';
            if (!all) return null;
            var parts = all.split(';');
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i].trim();
                if (!p) continue;
                if (p.indexOf(name + '=') === 0) {
                    return decodeURIComponent(p.substring(name.length + 1));
                }
            }
        } catch (e2) {}
        return null;
    }

    function cookieSet(name, value) {
        try {
            if (global.jQuery && typeof global.jQuery.cookie === 'function') {
                // 365 days
                global.jQuery.cookie(name, value, { expires: 365, path: '/' });
                return;
            }
        } catch (e) {}
        try {
            var v = encodeURIComponent(String(value));
            var maxAge = 60 * 60 * 24 * 365;
            global.document.cookie = name + '=' + v + '; Max-Age=' + maxAge + '; Path=/';
        } catch (e2) {}
    }

    function loadStoredLang() {
        try {
            var stored = global.localStorage.getItem(STORAGE_KEY);
            if (!isEmpty(stored)) return stored;
        } catch (e) {}
        try {
            var c = cookieGet(STORAGE_KEY);
            if (!isEmpty(c)) return c;
        } catch (e2) {}
        return null;
    }

    function readLangFromQuery() {
        try {
            var loc = global.location;
            if (!loc || !loc.search) return null;
            var qs = loc.search.replace(/^\?/, '');
            if (!qs) return null;
            var parts = qs.split('&');
            for (var i = 0; i < parts.length; i++) {
                var p = parts[i];
                if (!p) continue;
                var kv = p.split('=');
                if (!kv.length) continue;
                var k = decodeURIComponent(kv[0] || '').trim();
                if (k !== 'lang') continue;
                var v = decodeURIComponent(kv[1] || '').trim();
                if (v === 'zh-CN' || v === 'en-US') return v;
            }
        } catch (e) {}
        return null;
    }

    function isEmpty(val) {
        return val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
    }

    function format(template, args) {
        if (isEmpty(template)) return '';
        var s = String(template);
        if (!args || !args.length) return s;
        return s.replace(/\{(\d+)\}/g, function (_, idx) {
            var i = parseInt(idx, 10);
            return args[i] !== undefined && args[i] !== null ? String(args[i]) : '';
        });
    }

    var dict = {};

    var i18n = {
        _lang: 'zh-CN',
        _dict: dict,

        register: function (lang, table) {
            if (isEmpty(lang)) return;
            if (!this._dict) this._dict = {};
            this._dict[lang] = table || {};
            try {
                // 如果当前语言就是刚注册的语言，立即刷新页面
                if (lang === this._lang) {
                    this.apply(global.document);
                }
            } catch (e) {}
        },

        getLang: function () {
            return this._lang;
        },

        setLang: function (lang) {
            if (isEmpty(lang)) return;
            this._lang = lang;
            try {
                global.localStorage.setItem(STORAGE_KEY, lang);
            } catch (e) {}

            // fallback: cookie (more robust in some iframe/private modes)
            try {
                cookieSet(STORAGE_KEY, lang);
            } catch (e1) {}

            this.apply(global.document);

            // 通知业务层（如果需要）
            try {
                if (global.jQuery) {
                    global.jQuery(global.document).trigger('app:langChanged', [lang]);
                }
            } catch (e2) {}
        },

        init: function (defaultLang) {
            var lang = defaultLang || this._lang;
            try {
                var q = readLangFromQuery();
                if (!isEmpty(q)) {
                    lang = q;
                } else {
                    var stored = loadStoredLang();
                    if (!isEmpty(stored)) {
                        lang = stored;
                    }
                }
            } catch (e) {}
            this._lang = lang;
        },

        t: function (key) {
            if (isEmpty(key)) return '';
            var args = Array.prototype.slice.call(arguments, 1);
            var table = (this._dict && this._dict[this._lang]) ? this._dict[this._lang] : {};
            var s = table[key];
            if (s === undefined || s === null) {
                // fallback: zh-CN
                s = ((this._dict && this._dict['zh-CN']) ? this._dict['zh-CN'] : {})[key];
            }
            if (s === undefined || s === null) return key;
            return format(s, args);
        },

        apply: function (root) {
            if (!root || !root.querySelectorAll) return;

            var nodes = root.querySelectorAll('[data-i18n]');
            for (var i = 0; i < nodes.length; i++) {
                var el = nodes[i];
                var key = el.getAttribute('data-i18n');
                if (isEmpty(key)) continue;
                el.textContent = this.t(key);
            }

            var htmlNodes = root.querySelectorAll('[data-i18n-html]');
            for (var j = 0; j < htmlNodes.length; j++) {
                var el2 = htmlNodes[j];
                var key2 = el2.getAttribute('data-i18n-html');
                if (isEmpty(key2)) continue;
                el2.innerHTML = this.t(key2);
            }

            var titleNodes = root.querySelectorAll('[data-i18n-title]');
            for (var k = 0; k < titleNodes.length; k++) {
                var el3 = titleNodes[k];
                var key3 = el3.getAttribute('data-i18n-title');
                if (isEmpty(key3)) continue;
                el3.setAttribute('title', this.t(key3));
            }

            var placeholderNodes = root.querySelectorAll('[data-i18n-placeholder]');
            for (var p = 0; p < placeholderNodes.length; p++) {
                var el4 = placeholderNodes[p];
                var key4 = el4.getAttribute('data-i18n-placeholder');
                if (isEmpty(key4)) continue;
                el4.setAttribute('placeholder', this.t(key4));
            }

            // 可选：同步一个通用的语言切换按钮文案
            try {
                var toggleText = root.querySelector('#langToggleText');
                if (toggleText) {
                    toggleText.textContent = (this._lang === 'zh-CN') ? 'EN' : '中文';
                }
            } catch (e) {}
        }
    };

    global.APP_I18N = i18n;

    if (global.APP) {
        global.APP.i18n = i18n;
    }

    // 支持父页面用 postMessage 同步 iframe 的语言
    try {
        global.addEventListener('message', function (evt) {
            try {
                var data = evt && evt.data ? evt.data : null;
                if (!data || data.type !== 'dockerui:setLang') return;
                var lang = data.lang;
                if (lang !== 'zh-CN' && lang !== 'en-US') return;
                i18n.setLang(lang);
            } catch (e2) {}
        });
    } catch (e) {}

    i18n.init('zh-CN');
})(window);
