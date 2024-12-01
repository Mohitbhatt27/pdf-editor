export const adjustCanvasSize = (canvas, pdfPage) => {
  // Dynamically adjust canvas size to match currently rendered PDF page

  if (canvas && pdfPage) {
    const { width, height } = pdfPage.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }
};

export const applyBlur = (pdfCanvas, overlayCanvas, x, y, width, height) => {
  const pdfContext = pdfCanvas.getContext("2d");

  // transform coordinates to match the resolution of the PDF canvas
  const scaleX = pdfCanvas.width / overlayCanvas.width;
  const scaleY = pdfCanvas.height / overlayCanvas.height;

  const adjustedX = Math.min(x, x + width) * scaleX;
  const adjustedY = Math.min(y, y + height) * scaleY;
  const adjustedWidth = Math.abs(width) * scaleX;
  const adjustedHeight = Math.abs(height) * scaleY;

  pdfContext.save();
  pdfContext.filter = "blur(3px)";

  pdfContext.drawImage(
    pdfCanvas,
    adjustedX,
    adjustedY,
    adjustedWidth,
    adjustedHeight,
    adjustedX,
    adjustedY,
    adjustedWidth,
    adjustedHeight
  );

  pdfContext.filter = "none";

  pdfContext.restore();
};

export const eraseText = (pdfCanvas, overlayCanvas, x, y, width, height) => {
  const pdfContext = pdfCanvas.getContext("2d");

  // transform coordinates to match the resolution of the PDF canvas
  const scaleX = pdfCanvas.width / overlayCanvas.width;
  const scaleY = pdfCanvas.height / overlayCanvas.height;

  const adjustedX = Math.min(x, x + width) * scaleX;
  const adjustedY = Math.min(y, y + height) * scaleY;
  const adjustedWidth = Math.abs(width) * scaleX;
  const adjustedHeight = Math.abs(height) * scaleY;

  pdfContext.save();
  pdfContext.fillStyle = "white";

  pdfContext.fillRect(adjustedX, adjustedY, adjustedWidth, adjustedHeight);

  pdfContext.restore();
};
