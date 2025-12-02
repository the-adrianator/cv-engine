/**
 * PDF to Image Conversion Utility
 * 
 * Converts PDF pages to PNG images using PDF.js
 * Can convert a single page or all pages
 */

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

export interface PdfMultiPageResult {
  images: Array<{
    imageUrl: string;
    file: File;
    pageNumber: number;
  }>;
  totalPages: number;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    // Set the worker source - use the worker from public folder
    // The worker file is copied from node_modules to public/ during build/setup
    // This ensures version matching - we use the same version as the installed package
    if (typeof window !== 'undefined') {
      // Client-side: use local worker file from public folder
      // This file should be copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs
      lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    } else {
      // Server-side fallback (shouldn't happen, but just in case)
      lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
    }
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

/**
 * Convert the first page of a PDF to an image
 */
export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }

    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}

/**
 * Convert all pages of a PDF to images
 */
export async function convertPdfToImages(
  file: File
): Promise<PdfMultiPageResult> {
  try {
    const lib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;

    const images: Array<{
      imageUrl: string;
      file: File;
      pageNumber: number;
    }> = [];

    // Convert each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 4 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }

      await page.render({ canvasContext: context!, viewport }).promise;

      // Convert canvas to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1.0);
      });

      if (blob) {
        const originalName = file.name.replace(/\.pdf$/i, "");
        const imageFile = new File(
          [blob],
          `${originalName}-page-${pageNum}.png`,
          {
            type: "image/png",
          }
        );

        images.push({
          imageUrl: URL.createObjectURL(blob),
          file: imageFile,
          pageNumber: pageNum,
        });
      }
    }

    return {
      images,
      totalPages,
    };
  } catch (err) {
    return {
      images: [],
      totalPages: 0,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}

