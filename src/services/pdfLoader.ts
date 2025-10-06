import type { PDFDocumentProxy } from 'pdfjs-dist'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?worker&inline'
import type { DocumentInitParameters, TypedArray } from 'pdfjs-dist/types/src/display/api'

let worker: Worker | null = null

/**
 * Ensures that the PDF.js worker is initialized.
 * Creates a new worker instance if one doesn't exist already.
 */
export function ensureWorker() {
  if (!worker) {
    worker = new (PdfWorker as unknown as { new(): Worker })()
    GlobalWorkerOptions.workerPort = worker
  }
}

/**
 * Loads a PDF document from the specified source.
 *
 * @param src - URL or string path to the PDF document.
 *
 * @returns Promise that resolves to the PDF document proxy.
 */
export async function loadPdf(src: string | URL | TypedArray | ArrayBuffer): Promise<PDFDocumentProxy> {
  ensureWorker()

  const params: DocumentInitParameters = {
    enableXfa: false,
  }

  if (typeof src === 'string' || src instanceof URL) {
    params.url = src
  }
  else if (ArrayBuffer.isView(src)) {
    params.data = src
  }
  else {
    throw new Error('Invalid source type')
  }

  const loadingTask = getDocument(params)
  return await loadingTask.promise
}

/**
 * Terminates the PDF.js worker if it exists.
 * This helps clean up resources when the worker is no longer needed.
 */
export function terminateWorker() {
  if (worker) {
    try {
      worker.terminate()
    }
    catch {}
    worker = null
  }
}
