# Security

## Scope

This project is a **static, client-only** tic-tac-toe demo. It does not send data to a server, load third-party scripts, or use cookies or local storage.

## Hardening in this repository

- **Content-Security-Policy** (CSP) in `index.html` restricts scripts and styles to same-origin files only, blocks frames and plugins, limits network connections to **same origin** (`connect-src 'self'`), and disallows dangerous URL handlers (`javascript:`) by omitting broad `'unsafe-inline'` for scripts. Two **SHA-256 hashes** in `script-src` allow only the known inline snippets injected locally by **live-server** (live reload) and by **Cursor’s embedded browser**; other inline scripts remain blocked.
- **No inline script handlers** — UI actions use `addEventListener` and delegated clicks on `data-menace-action` buttons instead of `javascript:` links or inline `onsubmit`.
- **Text-first UI updates** where practical — status lines and scores use `textContent` instead of HTML concatenation to avoid accidental markup injection.
- `referrer` meta set to `strict-origin-when-cross-origin`.
- **Dependencies** — none; there is nothing to keep “up to date” via a lockfile. If you fork and add a build tool or CDN assets, pin versions and run your ecosystem’s audit (e.g. `npm audit`).

## Reporting

If you discover a security issue in this repository, please open a **private** security advisory on GitHub (or contact the repository owner) with enough detail to reproduce.

## Deployment

For production, **repeat the same CSP (or stricter) as HTTP response headers** on your static host; meta CSP is a baseline and headers can add HSTS, etc., at the edge. Use headers for **`frame-ancestors`** (embedding / clickjacking): browsers ignore that directive in `<meta>` tags, so it is not set in `index.html`.