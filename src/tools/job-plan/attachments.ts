/**
 * Turns dropped files into attachments: images are normalized to JPEG, and each
 * PDF page is rendered to an image with its text extracted. pdf.js is large, so
 * it is only downloaded the first time someone adds a PDF.
 */
import { uid } from '../../lib/id';
import type { Attachment } from './types';

const MAX_PDF_PAGES = 8;
const MAX_EDGE = 2400;

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/jpeg', 0.88),
  );
}

function whiteCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  return { canvas, ctx };
}

async function toAttachment(name: string, canvas: HTMLCanvasElement, text = ''): Promise<Attachment> {
  const blob = await canvasToJpeg(canvas);
  return { id: uid('img'), name, blob, url: URL.createObjectURL(blob), width: canvas.width, height: canvas.height, text };
}

async function fromImage(file: File): Promise<Attachment> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const { canvas, ctx } = whiteCanvas(Math.round(bmp.width * scale), Math.round(bmp.height * scale));
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return toAttachment(file.name, canvas);
}

async function fromPdf(file: File): Promise<Attachment[]> {
  const pdfjs = await import('pdfjs-dist');
  const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out: Attachment[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, MAX_PDF_PAGES); n++) {
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(MAX_EDGE / Math.max(base.width, base.height), 4) });
    const { canvas, ctx } = whiteCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
    await page.render({ canvasContext: ctx, viewport }).promise;
    const content = await page.getTextContent();
    const text = content.items.map((i) => ('str' in i ? i.str : '')).join(' ').replace(/\s+/g, ' ').trim();
    out.push(await toAttachment(pdf.numPages > 1 ? `${file.name} p${n}` : file.name, canvas, text));
  }
  return out;
}

export const isPdf = (f: File) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);

export async function readFiles(files: File[], onError: (name: string) => void): Promise<Attachment[]> {
  const out: Attachment[] = [];
  for (const f of files) {
    try {
      if (isPdf(f)) out.push(...(await fromPdf(f)));
      else if (f.type.startsWith('image/')) out.push(await fromImage(f));
      else onError(f.name);
    } catch (err) {
      console.error(err);
      onError(f.name);
    }
  }
  return out;
}

export function revoke(attachments: Attachment[]) {
  attachments.forEach((a) => URL.revokeObjectURL(a.url));
}
