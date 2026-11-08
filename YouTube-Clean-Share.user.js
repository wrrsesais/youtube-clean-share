// ==UserScript==
// @name         YouTube 分享链接净化
// @name:en      YouTube Clean Share
// @name:zh-CN   YouTube 分享链接净化
// @name:zh-TW   YouTube 分享連結淨化
// @name:ja      YouTube 共有リンクの追跡除去
// @name:ko      YouTube 공유 링크 정리
// @name:de      YouTube: saubere Freigabelinks
// @name:es      YouTube: enlaces para compartir sin rastreo
// @name:fr      YouTube : liens de partage sans suivi
// @name:pt-BR   YouTube: links de compartilhamento sem rastreamento
// @name:ru      YouTube: ссылки без меток отслеживания
// @namespace    local.youtube-clean-share
// @version      1.2.0
// @author       wrrsesais
// @description  净化原生复制、社交分享与嵌入代码中的 si，保留时间戳与播放列表，不添加按钮。
// @description:en Remove si from native copy, social sharing and embed code. Keep timestamps and playlists; no extra buttons.
// @description:zh-CN 净化原生复制、社交分享与嵌入代码中的 si，保留时间戳与播放列表，不添加按钮。
// @description:zh-TW 移除原生複製、社群分享及嵌入程式碼中的 si，保留時間戳記與播放清單，不新增按鈕。
// @description:ja 標準コピー、SNS 共有、埋め込みコードから si を除去。開始時間と再生リストを保持し、ボタンを追加しません。
// @description:ko 기본 복사, 소셜 공유 및 삽입 코드에서 si를 제거합니다. 타임스탬프와 재생목록을 유지하며 버튼을 추가하지 않습니다.
// @description:de Entfernt si beim Kopieren, Teilen und Einbetten. Zeitstempel und Playlists bleiben erhalten; keine zusätzlichen Schaltflächen.
// @description:es Elimina si al copiar, compartir e insertar vídeos. Conserva las marcas de tiempo y las listas de reproducción, sin añadir botones.
// @description:fr Supprime si des liens copiés, partagés et intégrés. Conserve les horodatages et les playlists, sans ajouter de bouton.
// @description:pt-BR Remove si ao copiar, compartilhar e incorporar vídeos. Preserva os horários de início e as playlists, sem adicionar botões.
// @description:ru Удаляет si при копировании, публикации ссылок и встраивании видео. Сохраняет время начала и плейлисты, не добавляя кнопок.
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @match        https://m.youtube.com/*
// @match        https://music.youtube.com/*
// @run-at       document-start
// @grant        none
// @sandbox      raw
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
    'use strict';

    const installed = Symbol.for('local.youtube-clean-share.v1');
    if (window[installed]) return;
    window[installed] = true;

    const translations = {
        en: ['YouTube Clean Share', 'Some automatic hooks are unavailable.'],
        'zh-CN': ['YouTube 分享净化', '部分自动拦截不可用。'],
        'zh-TW': ['YouTube 分享淨化', '部分自動攔截無法使用。'],
        ja: ['YouTube 共有リンクの追跡除去', '一部の自動処理を利用できません。'],
        ko: ['YouTube 공유 링크 정리', '일부 자동 처리 기능을 사용할 수 없습니다.'],
        de: ['YouTube Clean Share', 'Einige automatische Eingriffe sind nicht verfügbar.'],
        es: ['YouTube Clean Share', 'Algunas funciones automáticas no están disponibles.'],
        fr: ['YouTube Clean Share', 'Certaines fonctions automatiques sont indisponibles.'],
        'pt-BR': ['YouTube Clean Share', 'Algumas funções automáticas estão indisponíveis.'],
        ru: ['YouTube Clean Share', 'Некоторые функции автоматической обработки недоступны.']
    };

    function preferredLocale() {
        const languages = [...(navigator.languages || []), navigator.language || ''];
        for (const language of languages) {
            const tag = language.toLowerCase().replace(/_/g, '-');
            if (/^zh(?:-|$)/.test(tag)) {
                return /^zh-(?:hant|tw|hk|mo)(?:-|$)/.test(tag) ? 'zh-TW' : 'zh-CN';
            }
            if (/^pt(?:-|$)/.test(tag)) return 'pt-BR';
            const base = tag.split('-')[0];
            if (Object.prototype.hasOwnProperty.call(translations, base)) return base;
        }
        return 'en';
    }
    const messages = translations[preferredLocale()];

    const hosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com',
        'music.youtube.com', 'youtu.be', 'www.youtu.be',
        'youtube-nocookie.com', 'www.youtube-nocookie.com']);
    const panelSelector = [
        'ytd-unified-share-panel-renderer', 'yt-unified-share-panel-renderer', 'yt-share-panel-renderer',
        'ytm-share-panel-renderer', 'ytm-unified-share-panel-renderer',
        'ytmusic-share-dialog-renderer', 'ytd-share-popup-renderer',
        'yt-share-panel-view-model', 'yt-share-dialog-view-model', '.ytp-share-panel',
        'yt-sharing-embed-renderer', 'yt-sharing-embed-code-renderer'
    ].join(',');
    const fieldSelector = 'input#share-url,textarea#share-url,' +
        'input:not([type="checkbox"]):not([type="radio"]),textarea';
    const rendererSelector = 'yt-share-target-renderer,yt-copy-link-renderer,' +
        'yt-sharing-embed-renderer,yt-sharing-embed-code-renderer';

    function decode(value) {
        try { return decodeURIComponent(value.replace(/\+/g, ' ')); }
        catch { return value; }
    }

    function cleanUrl(value) {
        if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return value;
        let url;
        try { url = new URL(value); } catch { return value; }
        if (!hosts.has(url.hostname.toLowerCase()) || url.username || url.password) return value;
        // Filter the original query bytes so timestamps, escapes and other values stay intact.
        const hashAt = value.indexOf('#');
        const hash = hashAt < 0 ? '' : value.slice(hashAt);
        const beforeHash = hashAt < 0 ? value : value.slice(0, hashAt);
        const queryAt = beforeHash.indexOf('?');
        if (queryAt < 0) return value;
        const parts = beforeHash.slice(queryAt + 1).split('&');
        const kept = parts.filter(part => {
            const equals = part.indexOf('=');
            const key = decode(equals < 0 ? part : part.slice(0, equals));
            const val = decode(equals < 0 ? '' : part.slice(equals + 1));
            return key !== 'si' && !(key === 'feature' && val === 'shared');
        });
        if (kept.length === parts.length) return value;
        const query = kept.join('&');
        return beforeHash.slice(0, queryAt) + (query ? '?' + query : '') + hash;
    }

    function cleanText(text) {
        if (typeof text !== 'string') return text;
        return text.replace(/https?:\/\/[^\s<>"'`]+/gi, candidate => {
            // Keep surrounding prose punctuation, e.g. “(https://youtu.be/id?si=x).”.
            const tail = candidate.match(/[)\]}.!,;:，。！？；：、）】》」』]+$/u)?.[0] || '';
            const address = tail ? candidate.slice(0, -tail.length) : candidate;
            // Embed markup uses &amp; separators, while plain URLs use &.
            const decoded = address.replace(/&amp;/g, '&');
            const cleaned = cleanUrl(decoded);
            return (cleaned === decoded ? address : address.includes('&amp;') ?
                cleaned.replace(/&/g, '&amp;') : cleaned) + tail;
        });
    }

    function cleanShareTarget(value, depth = 0) {
        if (depth > 4) return value;
        const direct = cleanUrl(value);
        if (direct !== value || typeof value !== 'string') return direct;
        // Social share buttons may contain an encoded YouTube URL in url=, href=, etc.
        const hashAt = value.indexOf('#');
        const hash = hashAt < 0 ? '' : value.slice(hashAt);
        const beforeHash = hashAt < 0 ? value : value.slice(0, hashAt);
        const queryAt = beforeHash.indexOf('?');
        if (queryAt < 0) return value;
        let changed = false;
        const parts = beforeHash.slice(queryAt + 1).split('&').map(part => {
            const equals = part.indexOf('=');
            if (equals < 0 || !['url', 'u', 'href', 'text', 'body', 'link', 'share_url'].includes(decode(part.slice(0, equals)))) return part;
            const decoded = decode(part.slice(equals + 1));
            const cleaned = cleanText(cleanShareTarget(decoded, depth + 1));
            if (decoded === cleaned) return part;
            changed = true;
            return part.slice(0, equals + 1) + encodeURIComponent(cleaned);
        });
        return changed ? beforeHash.slice(0, queryAt + 1) + parts.join('&') + hash : value;
    }

    function cleanShareData(data) {
        const seen = new WeakSet();
        function visit(value, depth) {
            if (!value || typeof value !== 'object' || depth > 40 || seen.has(value)) return;
            // Only walk JSON-like renderer data, never DOM elements or browser objects.
            const proto = Object.getPrototypeOf(value);
            if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) return;
            seen.add(value);
            for (const key of Object.keys(value)) {
                const descriptor = Object.getOwnPropertyDescriptor(value, key);
                if (!descriptor || !('value' in descriptor)) continue;
                const entry = descriptor.value;
                try {
                    // YouTube uses this value to generate ?si= in embed code.
                    if (key === 'attributionId') {
                        if (descriptor.configurable) delete value[key];
                        else if (descriptor.writable) value[key] = '';
                    } else if (typeof entry === 'string') {
                        const cleaned = cleanText(cleanShareTarget(entry));
                        if (entry !== cleaned && descriptor.writable) value[key] = cleaned;
                    } else visit(entry, depth + 1);
                } catch { /* Other layers still clean the final outgoing URL. */ }
            }
        }
        visit(data, 0);
        return data;
    }

    function isShareResponse(address) {
        try {
            const url = new URL(address, location.href);
            return hosts.has(url.hostname) && /^\/youtubei\/v\d+\/share\/get_share_panel\/?$/.test(url.pathname);
        } catch { return false; }
    }

    function cleanShareJson(text) {
        if (typeof text !== 'string') return text;
        const prefix = text.match(/^\s*\)\]\}'[^\n]*\n/)?.[0] || '';
        try {
            const payload = prefix ? text.slice(prefix.length) : text;
            const data = JSON.parse(payload);
            cleanShareData(data);
            return prefix + JSON.stringify(data);
        } catch { return text; }
    }

    function patch(owner, key, makeWrapper) {
        try {
            const original = owner?.[key];
            if (typeof original !== 'function') return;
            const descriptor = Object.getOwnPropertyDescriptor(owner, key);
            Object.defineProperty(owner, key, {
                configurable: true, writable: true, ...descriptor,
                value: makeWrapper(original)
            });
        } catch (error) {
            console.warn(`[${messages[0]}] ${messages[1]}`, key, error);
        }
    }

    // Clean the share response before YouTube builds buttons and embed renderers.
    for (const method of ['json', 'text']) {
        patch(window.Response?.prototype, method, original => function () {
            const result = Reflect.apply(original, this, arguments);
            if (!isShareResponse(this.url)) return result;
            return result.then(method === 'json' ? cleanShareData : cleanShareJson);
        });
    }
    const xhrCache = new WeakMap();
    for (const property of ['response', 'responseText']) {
        try {
            const descriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, property);
            if (!descriptor?.get || !descriptor.configurable) continue;
            Object.defineProperty(XMLHttpRequest.prototype, property, {
                ...descriptor, get() {
                    const raw = Reflect.apply(descriptor.get, this, []);
                    if (!isShareResponse(this.responseURL)) return raw;
                    if (raw && typeof raw === 'object' && this.responseType === 'json') return cleanShareData(raw);
                    if (typeof raw !== 'string') return raw;
                    const cached = xhrCache.get(this);
                    if (cached?.raw === raw) return cached.cleaned;
                    const cleaned = cleanShareJson(raw);
                    xhrCache.set(this, { raw, cleaned });
                    return cleaned;
                }
            });
        } catch { /* Renderer and navigation hooks remain available. */ }
    }

    patch(window, 'open', original => function (url) {
        const args = [...arguments];
        if (typeof url === 'string') args[0] = cleanShareTarget(url);
        return Reflect.apply(original, this, args);
    });

    // Only transform the data being written; never read the existing clipboard.
    patch(window.Clipboard?.prototype, 'writeText', original => function (text) {
        return Reflect.apply(original, this, [cleanText(text)]);
    });
    patch(window.DataTransfer?.prototype, 'setData', original => function (format, data) {
        const isText = typeof format === 'string' &&
            /^(?:text|url|text\/plain|text\/html|text\/uri-list)$/i.test(format);
        return Reflect.apply(original, this, [format, isText ? cleanText(data) : data]);
    });
    patch(window.Navigator?.prototype, 'share', original => function (data) {
        if (!data || typeof data !== 'object') return Reflect.apply(original, this, arguments);
        const cleaned = { ...data };
        if (typeof cleaned.url === 'string') cleaned.url = cleanUrl(cleaned.url);
        if (typeof cleaned.text === 'string') cleaned.text = cleanText(cleaned.text);
        return Reflect.apply(original, this, [cleaned]);
    });
    if (window.ClipboardItem) {
        patch(window.Clipboard?.prototype, 'write', original => function (items) {
            if (!Array.isArray(items)) return Reflect.apply(original, this, arguments);
            const cleaned = items.map(item => {
                if (!(item instanceof ClipboardItem) || !item.types.some(type => /^text\/(plain|html|uri-list)$/.test(type))) return item;
                const entries = {};
                for (const type of item.types) {
                    const blob = item.getType(type);
                    entries[type] = /^text\/(plain|html|uri-list)$/.test(type) ?
                        blob.then(async value => new Blob([cleanText(await value.text())], { type })) : blob;
                }
                return new ClipboardItem(entries, { presentationStyle: item.presentationStyle });
            });
            // Call synchronously with promised blobs to preserve user activation.
            return Reflect.apply(original, this, [cleaned]);
        });
    }

    function isShareField(element) {
        return element instanceof Element && element.matches('input,textarea') &&
            (element.id === 'share-url' || element.closest(panelSelector));
    }

    function cleanField(field) {
        if (!isShareField(field)) return;
        const value = field.value;
        const cleaned = cleanText(value);
        if (cleaned === value) return;
        const active = document.activeElement === field;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        field.value = cleaned;
        if (field.getAttribute('value') === value) field.setAttribute('value', cleaned);
        if (active && start !== null && end !== null) {
            // Preserve a full selection, commonly used by YouTube's legacy Copy button.
            try {
                field.setSelectionRange(start === 0 ? 0 : Math.min(start, cleaned.length),
                    end === value.length ? cleaned.length : Math.min(end, cleaned.length));
            } catch { /* A non-text input may not support selection. */ }
        }
    }

    function cleanRenderer(element) {
        for (const controller of new Set([element, element.polymerController, element.inst])) {
            if (controller?.data && typeof controller.data === 'object') cleanShareData(controller.data);
        }
    }

    function preparePanel(panel) {
        cleanRenderer(panel);
        panel.querySelectorAll(rendererSelector).forEach(cleanRenderer);
        panel.querySelectorAll(fieldSelector).forEach(cleanField);
        panel.querySelectorAll('a[href]').forEach(cleanAnchor);
        panel.querySelectorAll('iframe[src]').forEach(frame => {
            const original = frame.getAttribute('src');
            const cleaned = cleanUrl(original);
            if (original !== cleaned) frame.setAttribute('src', cleaned);
        });
        panel.querySelectorAll('.mirror-text').forEach(mirror => {
            const cleaned = cleanText(mirror.textContent);
            if (cleaned !== mirror.textContent) mirror.textContent = cleaned;
        });
    }

    function cleanAnchor(anchor) {
        const original = anchor.getAttribute('href');
        const cleaned = anchor.closest(panelSelector) ? cleanShareTarget(original) : cleanUrl(original);
        if (original === cleaned) return;
        anchor.setAttribute('href', cleaned);
        if (anchor.childElementCount === 0 && anchor.textContent === original) anchor.textContent = cleaned;
        for (const attribute of ['aria-label', 'title']) {
            const label = anchor.getAttribute(attribute);
            if (label?.includes(original)) anchor.setAttribute(attribute, label.replace(original, cleaned));
        }
    }

    function scan(root) {
        if (!(root instanceof Element || root instanceof Document)) return;
        if (root instanceof Element && root.matches('[data-yt-clean-share-button]')) {
            root.remove();
            return;
        }
        root.querySelectorAll('[data-yt-clean-share-button]').forEach(button => button.remove());
        if (root instanceof Element) {
            if (root.matches('a[href]')) cleanAnchor(root);
            if (isShareField(root)) cleanField(root);
            if (root.matches(rendererSelector)) cleanRenderer(root);
            const enclosingPanel = root.closest(panelSelector);
            if (enclosingPanel) preparePanel(enclosingPanel);
            if (root.matches(panelSelector)) preparePanel(root);
        }
        root.querySelectorAll('a[href]').forEach(cleanAnchor);
        root.querySelectorAll('input#share-url,textarea#share-url').forEach(cleanField);
        root.querySelectorAll(panelSelector).forEach(preparePanel);
    }

    // Legacy execCommand('copy') and manual keyboard copying.
    document.addEventListener('copy', event => {
        if (!event.clipboardData) return;
        const active = document.activeElement;
        let text;
        if (active?.matches?.('input,textarea') && typeof active.selectionStart === 'number') {
            text = active.value.slice(active.selectionStart, active.selectionEnd);
        } else {
            text = window.getSelection()?.toString() || '';
        }
        const cleaned = cleanText(text);
        if (cleaned !== text) {
            event.clipboardData.setData('text/plain', cleaned);
            event.preventDefault();
        }
    }, true);

    // Catch same-tick changes to input.value, which MutationObserver cannot observe.
    for (const type of ['pointerdown', 'click', 'keydown', 'contextmenu', 'focusin', 'input', 'change']) {
        document.addEventListener(type, event => {
            const target = event.target instanceof Element ? event.target : null;
            const panel = target?.closest(panelSelector);
            if (panel) preparePanel(panel);
            if (isShareField(target)) cleanField(target);
            if (target?.closest('a[href]')) cleanAnchor(target.closest('a[href]'));
            if (panel || isShareField(target)) queueMicrotask(() => scan(panel || target));
        }, true);
    }

    const observer = new MutationObserver(records => {
        const roots = new Set();
        for (const record of records) {
            if (record.type === 'attributes') roots.add(record.target);
            else for (const node of record.addedNodes) {
                if (node instanceof Element) roots.add(node);
            }
        }
        for (const root of roots) {
            if (root.isConnected) scan(root);
        }
    });
    observer.observe(document, { subtree: true, childList: true, attributes: true,
        attributeFilter: ['href', 'value', 'src'] });
    document.querySelectorAll('[data-yt-clean-share-button]').forEach(button => button.remove());
    document.addEventListener('yt-navigate-finish', () => scan(document));
    scan(document);
})();
