# YouTube Clean Share

[简体中文](README.zh-CN.md) · [Other languages](docs/TRANSLATIONS.md)

A dependency-free userscript that removes YouTube share identifiers from native copy, social sharing destinations and embed code. It keeps YouTube’s original controls and adds no buttons.

~~~text
https://youtu.be/VIDEO_ID?si=SHARE_TOKEN&t=90
→ https://youtu.be/VIDEO_ID?t=90
~~~

## What it does

- Removes si and feature=shared from supported YouTube URLs; preserves timestamps, playlists, other playback parameters and fragments.
- Cleans encoded YouTube URLs in social share destinations, including Messages, WhatsApp, Facebook, X, email, Reddit, Pinterest and LinkedIn.
- Cleans embed iframe code, including privacy-enhanced YouTube URLs, while retaining playback settings.
- Cleans share response data and renderer data before use, plus outgoing clipboard, popup and native Web Share calls.
- Adds no UI buttons. Script names, descriptions and console diagnostics support ten languages.

## Install or update

Install Tampermonkey in your desktop browser. Open [YouTube-Clean-Share.user.js](YouTube-Clean-Share.user.js), use Raw when viewing it on GitHub, and install it through Tampermonkey. Alternatively, copy the full file into a new Tampermonkey script and save.

For an existing installation, replace or update the old script, save, then refresh every open YouTube tab. Do not leave two copies enabled. The original default @name and @namespace are retained for update identity; localized names are metadata overrides.

Recent Chrome-based browsers may require Allow User Scripts in Tampermonkey’s extension details or the developer-mode setup described in the [official FAQ](https://www.tampermonkey.net/faq.php?q=Q209).

## Scope and privacy

Runs on HTTPS pages at youtube.com, www.youtube.com, m.youtube.com and music.youtube.com. The mobile YouTube app and other websites are outside its scope.

All transformations happen locally. The script adds no network requests, downloads no external code, stores no share history, and never reads the existing clipboard. It only transforms text or blobs already being written and YouTube’s share data. Removing URL parameters does not disable YouTube analytics, cookies, account activity or tracking by destination platforms.

## Compatibility and validation

Primarily validated in desktop Chrome. A Tampermonkey installation alone does not establish compatibility with every browser. Edge, Firefox, Safari and mobile browser variants need separate end-to-end validation.

The 1.2.0 candidate passed 67 browser-fixture regression checks. Real YouTube share targets and embed code were checked during 1.1.0 validation. A user also reported successful installed-script checks on ordinary videos, Shorts and live videos in 1.1.0. This does not claim independent 1.2.0 installation testing across browsers or every social platform’s final send flow.

## Development

Node.js 20 or later; no package installation is required:

~~~sh
node --test tests/userscript.test.cjs
~~~

The portable tests cover URL handling, HTML embed text, social share destinations, ten languages and locale fallbacks. Browser-fixture coverage was also run during release preparation; it is separate from these portable tests.

## Acknowledgements

Maintained by wrrsesais, with development, testing, and documentation assistance from OpenAI Codex.

## License

[MIT](LICENSE), copyright 2026 wrrsesais.
