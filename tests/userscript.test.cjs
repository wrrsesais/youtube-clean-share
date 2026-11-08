'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'YouTube-Clean-Share.user.js'), 'utf8');

function load(languages = ['en-US'], language = languages?.[0] || '', failOpen = false) {
    const writes = [], warnings = [], opens = [];
    class Element {}
    class Document {
        querySelectorAll() { return []; }
        addEventListener() {}
    }
    class Clipboard { writeText(text) { writes.push(text); return Promise.resolve(); } }
    class XMLHttpRequest {}
    class MutationObserver { observe() {} }
    const window = { Clipboard, XMLHttpRequest };
    Object.defineProperty(window, 'open', {
        value: (...args) => { opens.push(args); return null; },
        configurable: !failOpen, writable: !failOpen
    });
    const context = vm.createContext({
        window, navigator: { languages, language },
        document: new Document(), Element, Document, MutationObserver, XMLHttpRequest,
        location: { href: 'https://www.youtube.com/watch?v=example' }, URL,
        console: { warn: (...args) => warnings.push(args) },
        queueMicrotask, setTimeout
    });
    vm.runInContext(source, context, { timeout: 1500 });
    return { window, clipboard: new Clipboard(), writes, warnings, opens, context };
}

const urls = [
    ['https://youtu.be/example?si=token', 'https://youtu.be/example'],
    ['https://youtu.be/example?si=token&t=90', 'https://youtu.be/example?t=90'],
    ['https://youtu.be/example?t=1m30s&si=token', 'https://youtu.be/example?t=1m30s'],
    ['https://www.youtube.com/watch?v=example&si=a&list=PL1&index=4', 'https://www.youtube.com/watch?v=example&list=PL1&index=4'],
    ['https://www.youtube.com/shorts/example?si=a&feature=shared', 'https://www.youtube.com/shorts/example'],
    ['https://www.youtube.com/live/example?si=a&start=12&end=30', 'https://www.youtube.com/live/example?start=12&end=30'],
    ['https://music.youtube.com/watch?v=example&si=a&list=RD1', 'https://music.youtube.com/watch?v=example&list=RD1'],
    ['https://m.youtube.com/watch?v=example&si=a', 'https://m.youtube.com/watch?v=example'],
    ['https://youtube.com/playlist?list=PL1&si=a', 'https://youtube.com/playlist?list=PL1'],
    ['https://www.youtube.com/clip/example?si=a', 'https://www.youtube.com/clip/example'],
    ['https://youtu.be/example?si=a&si=b&t=30#part', 'https://youtu.be/example?t=30#part'],
    ['https://youtu.be/example?s%69=a&t=1%3A30&x=a+b%2Bc', 'https://youtu.be/example?t=1%3A30&x=a+b%2Bc'],
    ['https://youtu.be/example?si=a&future=new&feature=player_embedded', 'https://youtu.be/example?future=new&feature=player_embedded'],
    ['https://youtu.be/example?si=a#t=50', 'https://youtu.be/example#t=50'],
    ['https://youtu.be/example#si=a', 'https://youtu.be/example#si=a'],
    ['https://www.youtube.com/watch?v=example&t=40&list=PL1', 'https://www.youtube.com/watch?v=example&t=40&list=PL1'],
    ['https://example.com/watch?si=a&feature=shared', 'https://example.com/watch?si=a&feature=shared'],
    ['https://youtube.com.evil.example/watch?si=a', 'https://youtube.com.evil.example/watch?si=a'],
    ['https://youtube.com@evil.example/watch?si=a', 'https://youtube.com@evil.example/watch?si=a'],
    ['https://evil.example@youtube.com/watch?si=a', 'https://evil.example@youtube.com/watch?si=a'],
    ['not a URL, si=token', 'not a URL, si=token'],
    ['看这里（https://youtu.be/example?si=a&t=9）。', '看这里（https://youtu.be/example?t=9）。'],
    ['A: https://youtu.be/a?si=x B: https://youtu.be/b?si=y&t=2', 'A: https://youtu.be/a B: https://youtu.be/b?t=2'],
    ['https://www.youtube.com/watch?v=a&si=%E0%A4%A&x=%E0%A4%A', 'https://www.youtube.com/watch?v=a&x=%E0%A4%A'],
    ['<iframe src="https://www.youtube.com/embed/example?si=a&start=90"></iframe>', '<iframe src="https://www.youtube.com/embed/example?start=90"></iframe>'],
    ['<iframe src="https://www.youtube-nocookie.com/embed/example?start=90&amp;si=a&amp;controls=0"></iframe>', '<iframe src="https://www.youtube-nocookie.com/embed/example?start=90&amp;controls=0"></iframe>']
];
for (const [input, expected] of urls) {
    test('clipboard: ' + input, async () => {
        const app = load();
        await app.clipboard.writeText(input);
        assert.equal(app.writes.at(-1), expected);
    });
}

const warnings = {
    en: 'Some automatic hooks are unavailable.',
    'zh-CN': '部分自动拦截不可用。',
    'zh-TW': '部分自動攔截無法使用。',
    ja: '一部の自動処理を利用できません。',
    ko: '일부 자동 처리 기능을 사용할 수 없습니다.',
    de: 'Einige automatische Eingriffe sind nicht verfügbar.',
    es: 'Algunas funciones automáticas no están disponibles.',
    fr: 'Certaines fonctions automatiques sont indisponibles.',
    'pt-BR': 'Algumas funções automáticas estão indisponíveis.',
    ru: 'Некоторые функции автоматической обработки недоступны.'
};
const locales = [
    [['en-US'], 'en'], [['zh-CN'], 'zh-CN'], [['zh-Hans'], 'zh-CN'],
    [['zh-TW'], 'zh-TW'], [['zh-Hant-HK'], 'zh-TW'], [['zh-HK'], 'zh-TW'],
    [['ja-JP'], 'ja'], [['ko-KR'], 'ko'], [['de-DE'], 'de'], [['es-MX'], 'es'],
    [['fr-CA'], 'fr'], [['pt-BR'], 'pt-BR'], [['pt-PT'], 'pt-BR'],
    [['ru-RU'], 'ru'], [['it-IT', 'de-DE'], 'de'], [['it-IT'], 'en']
];
for (const [languages, expected] of locales) {
    test('language preference: ' + languages.join(', '), () => {
        const app = load(languages, languages[0], true);
        assert.equal(app.warnings.length, 1);
        assert.ok(app.warnings[0][0].endsWith(warnings[expected]));
    });
}
test('navigator.language works when navigator.languages is unavailable', () => {
    const app = load(null, 'zh-TW', true);
    assert.ok(app.warnings[0][0].endsWith(warnings['zh-TW']));
});
test('every language has a name and description', () => {
    for (const locale of Object.keys(warnings)) {
        assert.match(source, new RegExp('^// @name:' + locale + '\\s+\\S', 'm'));
        assert.match(source, new RegExp('^// @description:' + locale + '\\s+\\S', 'm'));
    }
});
test('installation identity is preserved', () => {
    assert.match(source, /^\/\/ @name\s+YouTube 分享链接净化$/m);
    assert.match(source, /^\/\/ @namespace\s+local\.youtube-clean-share$/m);
});
test('nested social destinations keep timestamps and native window arguments', () => {
    const app = load();
    app.window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent('https://youtu.be/example?si=a&t=90') + '&text=Title', 'share', 'width=600');
    const [address, target, features] = app.opens.at(-1);
    assert.equal(new URL(address).searchParams.get('url'), 'https://youtu.be/example?t=90');
    assert.equal(new URL(address).searchParams.get('text'), 'Title');
    assert.equal(target, 'share');
    assert.equal(features, 'width=600');
});
test('email share body is cleaned', () => {
    const app = load();
    app.window.open('mailto:?body=' + encodeURIComponent('https://youtu.be/example?si=a&t=9'));
    assert.equal(new URL(app.opens.at(-1)[0]).searchParams.get('body'), 'https://youtu.be/example?t=9');
});
test('duplicate execution does not wrap twice', () => {
    const app = load();
    const open = app.window.open;
    vm.runInContext(source, app.context, { timeout: 1500 });
    assert.equal(app.window.open, open);
});
