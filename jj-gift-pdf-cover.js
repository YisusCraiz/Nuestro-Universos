'use strict';

window.GiftPdfCover = (() => {
  const packageUrl = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.5.438/';
  const buildUrl = packageUrl + 'legacy/build/';
  let library;
  let renderQueue = Promise.resolve();

  async function signedUrl(storage, path) {
    const {data, error} = await storage.createSignedUrl(path, 300);
    if (error) throw error;
    return data.signedUrl;
  }

  async function render(source) {
    library ||= import(buildUrl + 'pdf.min.mjs').then(pdf => {
      pdf.GlobalWorkerOptions.workerSrc = buildUrl + 'pdf.worker.min.mjs';
      return pdf;
    }).catch(error => {
      library = null;
      throw error;
    });
    const pdf = await library;
    const input = typeof source === 'string' ? {url: source} : {data: await source.arrayBuffer()};
    const task = pdf.getDocument({
      ...input,
      cMapUrl: packageUrl + 'cmaps/',
      standardFontDataUrl: packageUrl + 'standard_fonts/',
      iccUrl: packageUrl + 'iccs/',
      wasmUrl: packageUrl + 'wasm/',
      enableXfa: false
    });
    try {
      const page = await (await task.promise).getPage(1);
      const original = page.getViewport({scale: 1});
      const viewport = page.getViewport({scale: 520 / Math.max(original.width, original.height)});
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));
      await page.render({canvas, viewport}).promise;
      return canvas.toDataURL('image/webp', 0.87);
    } finally {
      await task.destroy();
    }
  }

  function firstPage(source) {
    const preview = renderQueue.then(async () => render(await source()));
    renderQueue = preview.catch(() => {});
    return preview;
  }

  return {signedUrl, firstPage};
})();
