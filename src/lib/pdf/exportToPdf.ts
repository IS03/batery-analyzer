import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type ExportOptions = {
  fileName?: string;
  includeMetadata?: boolean;
  anonymize?: boolean;
  metadata?: {
    appName?: string;
    version?: string;
    generatedAt?: Date;
  };
  // si se quiere forzar orientación
  orientation?: "p" | "l"; // p: portrait, l: landscape
  targetId: string; // id del contenedor a exportar
};

// Constante para conversión de píxeles a mm (no usada en esta implementación)
// const PX_PER_MM = 3.7795275591; // ~96 dpi → px/mm (para html2canvas)

export async function exportNodeToPdf(opts: ExportOptions) {
  const {
    targetId,
    fileName = "battery-report.pdf",
    includeMetadata = true,
    anonymize = false,
    metadata = { appName: "Battery Report", version: "MVP", generatedAt: new Date() },
    orientation = "p",
  } = opts;

  const node = document.getElementById(targetId);
  if (!node) throw new Error(`No se encontró el nodo con id "${targetId}"`);

  // Aplicar flags temporales (p.ej. anonimizar)
  if (anonymize) node.setAttribute("data-anonymize", "true");

  // Forzar fondo blanco y modo print-friendly mientras capturamos
  node.setAttribute("data-pdf-capture", "true");

  const canvas = await html2canvas(node, {
    scale: 2, // mayor escala = mejor calidad
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
    // Evita cortar sombras y elementos fuera del flow
    windowWidth: document.documentElement.clientWidth,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 en mm
  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Márgenes
  const margin = 10; // mm
  const contentWidth = pageWidth - margin * 2;

  // Convertir el canvas a mm manteniendo proporción
  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Encabezado opcional
  const drawHeader = () => {
    if (!includeMetadata) return;
    const title = metadata.appName ?? "Battery Report";
    const ver = metadata.version ? `v${metadata.version}` : "";
    const dateStr = (metadata.generatedAt ?? new Date()).toLocaleString();
    pdf.setFontSize(10);
    pdf.text(`${title} ${ver}`.trim(), margin, 8);
    pdf.text(`Generado: ${dateStr}`, pageWidth - margin, 8, { align: "right" });
    pdf.setDrawColor(200);
    pdf.line(margin, 9, pageWidth - margin, 9);
  };

  // Espacio ocupado por header
  const headerOffset = includeMetadata ? 10 : 0;

  // Dibujar header en la primera página
  drawHeader();

  // Calcular si necesitamos múltiples páginas
  const availableHeight = pageHeight - margin * 2 - headerOffset;
  
  if (imgHeight <= availableHeight) {
    // Una sola página
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin + headerOffset,
      imgWidth,
      imgHeight
    );
  } else {
    // Múltiples páginas - simplificado
    const pagesNeeded = Math.ceil(imgHeight / availableHeight);
    
    for (let page = 0; page < pagesNeeded; page++) {
      if (page > 0) {
        pdf.addPage();
        drawHeader();
      }
      
      const yOffset = page * availableHeight;
      const heightOnThisPage = Math.min(availableHeight, imgHeight - yOffset);
      
      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin + headerOffset,
        imgWidth,
        heightOnThisPage,
        undefined,
        "FAST",
        yOffset
      );
    }
  }

  // Revertir flags
  node.removeAttribute("data-pdf-capture");
  if (anonymize) node.removeAttribute("data-anonymize");

  pdf.save(fileName);
}
