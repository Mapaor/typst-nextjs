# Typst Online Editor

A lightweight web-based Typst editor that compiles documents directly in your browser using WebAssembly. No servers, everything client-side.

Check it out here: [https://typst-online-editor.vercel.app](https://typst-online-editor.vercel.app).

## Tech used

This website is built with NextJS (React), Typst.ts (Typst for the javascript world made by [@myriaddreamin](https://github.com/Myriad-Dreamin)), PDF.js and Shiki.

## Great things about the website

- Everything is client-side thanks to Typst.ts (wasm file is from their CDN).
- Full featured demo with different examples to load, file explorer, custom PDF preview and debounce compilation (compiles as you type).
- Portable. The UI may not be framework-agnostic but the compiler logic is. You can find a more minimal version [here](https://github.com/Mapaor4/simple-typst-editor) and also another minimal Vite version [here](https://github.com/Mapaor/typst-online-vite).

## How to use or deploy
The following is basic knowledge of how to deploy a NextJS application but I'll say it in case someone is unfamiliar with it.

The easiest way is to fork the repository and then deploy it to Vercel.

Once deployed you can clone it locally and develop it. First install the dependencies:
```
npm install
```
Then run the development server:
```
npm run dev
```
And open the localhost URL you get.

The corresponding commands for those but in production mode (the commands that Vercel runs in their server) would be `npm run build` and `npm run start`.

Also if you want you can deploy this as a static site in GitHub Pages. That is done by exporting the NextJS app to static HTML+CSS+JS you can do so but uncommenting the lines in `next.config.ts` and then running `npm run build`, the `out` generated folder is the one you can publish to GitHub Pages.

## Credits

Credits mainly to Myriad-Dreamin for the creation of [typst.ts](https://github.com/Myriad-Dreamin/typst.ts), to [@cosformula](https://github.com/typst/typst) for the creation of [mdxport](https://github.com/cosformula/mdxport), which served as an inspiration for this demo, and obviously also to Martin Haug and Laurenz Mädje for the creation of [Typst](https://github.com/typst/typst).

## License

MIT License.

This repo code is MIT Licensed, however the libraries used are:
- @myriaddreamin/typst-ts-renderer"
- @myriaddreamin/typst-ts-web-compiler"
- @myriaddreamin/typst.ts"
- pdf.js
- pdfjs-dist

Which are, under Apache-2.0 license. At the same time Typst.ts uses the Typst compiler which is also licensed under Apache-2.0 license.

The Lucide icons used are licensed under MIT.

