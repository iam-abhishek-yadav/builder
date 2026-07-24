const STYLE_PROPS = [
  "color",
  "backgroundColor",
  "backgroundImage",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
  "borderRadius",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "lineHeight",
  "textAlign",
  "textTransform",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "display",
  "flexDirection",
  "alignItems",
  "justifyContent",
  "gap",
  "opacity",
  "whiteSpace",
  "wordBreak",
] as const;

function inlineComputedStyles(source: Element, target: HTMLElement) {
  const computed = window.getComputedStyle(source);
  for (const prop of STYLE_PROPS) {
    target.style.setProperty(prop, computed.getPropertyValue(prop));
  }

  const sourceChildren = Array.from(source.children);
  const targetChildren = Array.from(target.children);
  sourceChildren.forEach((child, index) => {
    const targetChild = targetChildren[index];
    if (child instanceof Element && targetChild instanceof HTMLElement) {
      inlineComputedStyles(child, targetChild);
    }
  });
}

function slugifyFilename(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "resume"
  );
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load export image"));
    img.src = dataUrl;
  });
}

/**
 * Capture the live preview and download a Letter PDF.
 * Uses content height only (ignores the UI min-height), so short
 * resumes stay on a single page with no blank trailing page.
 */
export async function exportResumePdf(name?: string) {
  const source = document.getElementById("resume-preview");
  if (!source) {
    throw new Error("Resume preview not found");
  }

  const [{ domToPng }, { jsPDF }] = await Promise.all([
    import("modern-screenshot"),
    import("jspdf"),
  ]);

  const width = Math.ceil(source.getBoundingClientRect().width);
  const clone = source.cloneNode(true) as HTMLElement;
  clone.id = "resume-preview-export-clone";
  clone.dataset.resumeRoot = "true";

  Object.assign(clone.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${width}px`,
    maxWidth: `${width}px`,
    minHeight: "0",
    height: "auto",
    margin: "0",
    boxShadow: "none",
    transform: "none",
    transition: "none",
    backgroundColor: "#ffffff",
    zIndex: "-1",
    pointerEvents: "none",
  });

  document.body.appendChild(clone);
  inlineComputedStyles(source, clone);

  // Re-assert content sizing after inlining computed min-height.
  clone.style.minHeight = "0";
  clone.style.height = "auto";
  clone.style.boxShadow = "none";

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

  const contentHeight = Math.ceil(
    Math.max(clone.scrollHeight, clone.getBoundingClientRect().height),
  );

  try {
    const dataUrl = await domToPng(clone, {
      width,
      height: contentHeight,
      scale: 2,
      backgroundColor: "#ffffff",
      style: {
        transform: "none",
        boxShadow: "none",
        minHeight: "0",
        height: `${contentHeight}px`,
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "letter",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const image = await loadImage(dataUrl);

    const widthFitHeight = pageWidth * (image.height / image.width);

    // Prefer a single page whenever content nearly fits Letter.
    if (widthFitHeight <= pageHeight * 1.02) {
      const scale = Math.min(1, pageHeight / widthFitHeight);
      const drawWidth = pageWidth * scale;
      const drawHeight = widthFitHeight * scale;
      const offsetX = (pageWidth - drawWidth) / 2;
      pdf.addImage(
        dataUrl,
        "PNG",
        offsetX,
        0,
        drawWidth,
        drawHeight,
        undefined,
        "FAST",
      );
    } else {
      const pageCanvas = document.createElement("canvas");
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      const pxPageHeight = Math.floor(image.width * (pageHeight / pageWidth));
      pageCanvas.width = image.width;
      pageCanvas.height = pxPageHeight;

      let rendered = 0;
      let pageIndex = 0;
      const minUsefulPixels = Math.floor(pxPageHeight * 0.08);

      while (rendered < image.height) {
        const remaining = image.height - rendered;
        // Skip a trailing mostly-blank slice.
        if (pageIndex > 0 && remaining < minUsefulPixels) break;

        const sliceHeight = Math.min(pxPageHeight, remaining);
        pageCanvas.height = sliceHeight;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, sliceHeight);
        ctx.drawImage(
          image,
          0,
          rendered,
          image.width,
          sliceHeight,
          0,
          0,
          image.width,
          sliceHeight,
        );

        const slice = pageCanvas.toDataURL("image/png");
        const drawHeight = pageWidth * (sliceHeight / image.width);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(slice, "PNG", 0, 0, pageWidth, drawHeight, undefined, "FAST");

        rendered += sliceHeight;
        pageIndex += 1;
      }
    }

    pdf.save(`${slugifyFilename(name || "resume")}-resume.pdf`);
  } finally {
    clone.remove();
  }
}
