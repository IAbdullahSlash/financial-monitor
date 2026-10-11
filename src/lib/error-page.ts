export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* Mirrors the neobrutalism theme in styles.css; this page renders without the app's CSS. */
      body { font: 500 15px/1.5 system-ui, -apple-system, sans-serif; background: hsl(54, 92%, 88%); color: #000; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; background: #fff; border: 2px solid #000; border-radius: 5px; box-shadow: 4px 4px 0 0 #000; }
      h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem; }
      p { margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border: 2px solid #000; border-radius: 5px; font: inherit; font-weight: 700; cursor: pointer; text-decoration: none; color: #000; box-shadow: 4px 4px 0 0 #000; transition: transform 150ms, box-shadow 150ms; }
      a:hover, button:hover { transform: translate(4px, 4px); box-shadow: none; }
      .primary { background: hsl(49, 100%, 49%); }
      .secondary { background: #fff; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
