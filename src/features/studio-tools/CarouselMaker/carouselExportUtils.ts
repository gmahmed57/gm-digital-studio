
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export function waitForImages(node: HTMLElement, timeout: number): Promise<void> {
  const imgs = Array.from(node.querySelectorAll('img'));
  if(!imgs.length) return Promise.resolve();
  return Promise.all(imgs.map(img => new Promise<void>(res => {
    if(img.complete && img.naturalWidth > 0){ res(); return; }
    const t = setTimeout(()=> res(), timeout);
    img.addEventListener('load', ()=>{ clearTimeout(t); res(); }, { once:true });
    img.addEventListener('error', ()=>{ clearTimeout(t); img.remove(); res(); }, { once:true });
  }))).then(() => {});
}

// NOTE: renderSlideToCanvas expects `buildSlideNode` to have been called to produce the DOM node.
// To use React components for export, we must either render them offscreen using React (e.g. createRoot)
// or just export the currently rendered DOM nodes from the preview track!
// However, the preview track is scaled. We need a 1080x1350 unscaled node.
// The easiest React way is to have an offscreen div that renders the exact slide unscaled, 
// wait for it, and then capture it.

export async function captureNodeToCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  await waitForImages(node, 6000);
  try {
    const canvas = await html2canvas(node, {
      width: 1080, height: 1350, scale: 1,
      useCORS: true, allowTaint: false, backgroundColor: null, logging: false
    });
    // Guard against silently-tainted canvas
    canvas.getContext('2d')?.getImageData(0, 0, 1, 1);
    return canvas;
  } catch(err) {
    throw new Error('Canvas tainted or failed to render: ' + err);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=> URL.revokeObjectURL(url), 2000);
}

export async function exportPDF(canvases: HTMLCanvasElement[], onProgress: (msg: string) => void) {
  const pdf = new jsPDF({ unit:'px', format:[1080,1350], orientation:'portrait', compress:true });

  for(let i=0; i<canvases.length; i++){
    onProgress(`Rendering slide ${i+1} of ${canvases.length}…`);
    const canvas = canvases[i];
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    if(i>0) pdf.addPage([1080,1350], 'portrait');
    pdf.addImage(imgData, 'JPEG', 0, 0, 1080, 1350);
  }

  onProgress('Done — downloading…');
  pdf.save('carousel.pdf');
}

export async function exportImageZip(canvases: HTMLCanvasElement[], format: 'png' | 'jpg', onProgress: (msg: string) => void) {
  const zip = new JSZip();
  const mime = format === 'png' ? 'image/png' : 'image/jpeg';
  const ext = format === 'png' ? 'png' : 'jpg';

  for(let i=0; i<canvases.length; i++){
    onProgress(`Rendering slide ${i+1} of ${canvases.length}…`);
    const canvas = canvases[i];
    const blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(resolve, mime, format === 'png' ? undefined : 0.92);
    });
    if (blob) {
      zip.file(`slide-${String(i+1).padStart(2,'0')}.${ext}`, blob);
    }
  }

  onProgress('Zipping files…');
  const zipBlob = await zip.generateAsync({ type:'blob' });
  onProgress('Done — downloading…');
  downloadBlob(zipBlob, `carousel-${ext}.zip`);
}
