import { readFile, writeFile, mkdir } from 'node:fs/promises';

await mkdir('undo-mobile/assets', { recursive: true });
let html = await readFile('undo-mobile/web-build/mobile.html', 'utf8');
const jsPath = html.match(/<script[^>]+src="([^"]+\.js)"[^>]*><\/script>/)?.[1];
const cssPath = html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)?.[1];
if (!jsPath || !cssPath) throw new Error('Vite output is missing JavaScript or CSS assets');
const js = await readFile(`undo-mobile/web-build/${jsPath.replace(/^\.\//, '')}`, 'utf8');
const css = await readFile(`undo-mobile/web-build/${cssPath.replace(/^\.\//, '')}`, 'utf8');
html = html.replace(/<script\b([^>]*?)src="[^"]+\.js"([^>]*)><\/script>/, (_tag, before, after) =>
  `<script${before}${after}>${js.replace(/<\/script/gi, '<\\/script')}</script>`
);
html = html.replace(/<link[^>]+href="[^"]+\.css"[^>]*>/, () =>
  `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`
);
await writeFile('undo-mobile/assets/mobile.html', html);
