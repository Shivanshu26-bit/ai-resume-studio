import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Resume } from "../types";

/**
 * Returns a standardized, sanitized filename based on candidate's name.
 * Example: "Alex_Chen_Resume.pdf" or "Candidate_Resume.pdf"
 */
export function getResumePdfFilename(resume: Resume): string {
  const firstName = resume.personal?.firstName?.trim() || "";
  const lastName = resume.personal?.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  if (!fullName) {
    const roleTitle = resume.targetRole ? resume.targetRole.replace(/[^a-zA-Z0-9]/g, "_") : "Professional";
    return `${roleTitle}_Resume.pdf`;
  }

  // Sanitize name for clean filesystem usage
  const cleanName = fullName
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .trim()
    .split(/\s+/)
    .join("_");

  return cleanName ? `${cleanName}_Resume.pdf` : "Professional_Resume.pdf";
}

/**
 * Wait for all images and custom fonts to finish loading
 */
async function waitForAssets(element: HTMLElement): Promise<void> {
  // 1. Wait for document fonts
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (err) {
    console.warn("Font loading ready check failed:", err);
  }

  // 2. Wait for all <img> tags inside element
  const images = Array.from(element.querySelectorAll("img"));
  if (images.length === 0) return;

  const imagePromises = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn("Image failed to load in PDF export:", img.src);
        resolve(); // Continue even if image failed
      };
      // Timeout fallback after 2.5 seconds
      setTimeout(resolve, 2500);
    });
  });

  await Promise.all(imagePromises);
}

/**
 * Adjust element margins to prevent awkward cuts across page breaks
 */
function adjustForPageBreaks(container: HTMLElement, pageWidthPx: number, pageHeightPx: number): () => void {
  // Find all indivisible sections/items marked with data-page-item or standard section elements
  const items = Array.from(
    container.querySelectorAll<HTMLElement>("[data-page-item], section, header")
  );

  const originalMargins: { el: HTMLElement; marginTop: string }[] = [];
  const containerRect = container.getBoundingClientRect();

  items.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const relativeTop = itemRect.top - containerRect.top;
    const relativeBottom = itemRect.bottom - containerRect.top;

    const pageIndexStart = Math.floor(relativeTop / pageHeightPx);
    const pageIndexEnd = Math.floor(relativeBottom / pageHeightPx);

    // If an item spans across a page cut boundary and isn't the entire page itself
    if (pageIndexStart !== pageIndexEnd && itemRect.height < pageHeightPx * 0.75) {
      const nextPageTop = (pageIndexStart + 1) * pageHeightPx;
      const pushDown = nextPageTop - relativeTop + 16; // Add small breathing room
      originalMargins.push({ el: item, marginTop: item.style.marginTop });
      item.style.marginTop = `${pushDown}px`;
    }
  });

  // Return cleanup function to restore DOM
  return () => {
    originalMargins.forEach(({ el, marginTop }) => {
      el.style.marginTop = marginTop;
    });
  };
}

export interface ExportPdfOptions {
  fileName?: string;
  onProgress?: (step: string) => void;
}

/**
 * Reliable, high-resolution A4 multi-page PDF exporter for resume elements.
 */
export async function exportResumeToPdf(
  element: HTMLElement,
  resume: Resume,
  options?: ExportPdfOptions
): Promise<boolean> {
  const fileName = options?.fileName || getResumePdfFilename(resume);

  // Create an overlay capture container positioned cleanly in viewport but transparent to user
  const captureHost = document.createElement("div");
  captureHost.id = "pdf-export-temp-host";
  captureHost.style.position = "fixed";
  captureHost.style.top = "0";
  captureHost.style.left = "0";
  captureHost.style.width = "794px"; // Standard A4 width at 96 DPI
  captureHost.style.minHeight = "1123px"; // Standard A4 height at 96 DPI
  captureHost.style.backgroundColor = "#ffffff";
  captureHost.style.zIndex = "-9999";
  captureHost.style.opacity = "0.01"; // Keep rendered by layout engine
  captureHost.style.pointerEvents = "none";
  captureHost.style.overflow = "visible";
  captureHost.style.boxSizing = "border-box";

  try {
    options?.onProgress?.("Preparing resume document layout...");

    // Clone element
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "794px";
    clone.style.maxWidth = "794px";
    clone.style.minWidth = "794px";
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.style.borderRadius = "0";
    clone.style.border = "none";
    clone.style.overflow = "visible";
    clone.style.backgroundColor = "#ffffff";
    clone.style.display = "block";
    clone.style.visibility = "visible";
    clone.style.opacity = "1";

    captureHost.appendChild(clone);
    document.body.appendChild(captureHost);

    // Wait for fonts & assets
    options?.onProgress?.("Loading typography and assets...");
    await waitForAssets(captureHost);

    // Allow browser layout engine to paint
    await new Promise((r) => setTimeout(r, 120));

    // A4 dimensions in px at 96 DPI: 794w x 1123h
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;

    // Adjust page cuts
    const cleanupBreaks = adjustForPageBreaks(clone, A4_WIDTH_PX, A4_HEIGHT_PX);

    // Let adjusted layout settle
    await new Promise((r) => setTimeout(r, 80));

    options?.onProgress?.("Rendering high-resolution print canvas...");
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x scale for sharp, crystal-clear 192 DPI print output
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: A4_WIDTH_PX,
      width: A4_WIDTH_PX,
      height: Math.max(clone.scrollHeight, A4_HEIGHT_PX),
      scrollX: 0,
      scrollY: 0,
      onclone: (_clonedDoc, clonedEl) => {
        clonedEl.style.opacity = "1";
        clonedEl.style.visibility = "visible";
        clonedEl.style.display = "block";
      },
    });

    // Cleanup adjustments and host DOM
    cleanupBreaks();
    if (document.body.contains(captureHost)) {
      document.body.removeChild(captureHost);
    }

    options?.onProgress?.("Compiling multi-page PDF...");

    // Create jsPDF instance
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidthMm = 210;
    const pdfHeightMm = 297;

    // Dimensions in canvas scale (scale = 2)
    const pageHeightInCanvasPx = Math.floor(canvas.width * (297 / 210));
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightInCanvasPx));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage("a4", "portrait");
      }

      const srcY = page * pageHeightInCanvasPx;
      const remainingHeight = canvas.height - srcY;
      const sliceHeight = Math.min(pageHeightInCanvasPx, remainingHeight);

      // Create single page canvas slice
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightInCanvasPx;

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.98);
      pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidthMm, pdfHeightMm, undefined, "FAST");
    }

    options?.onProgress?.("Downloading file...");

    // Trigger download using Blob fallback for guaranteed iframe download capability
    try {
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (saveErr) {
      console.warn("Blob trigger failed, falling back to pdf.save():", saveErr);
      pdf.save(fileName);
    }

    return true;
  } catch (error) {
    console.error("PDF generation failed:", error);
    if (document.body.contains(captureHost)) {
      document.body.removeChild(captureHost);
    }
    throw error;
  }
}
