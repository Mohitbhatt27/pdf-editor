import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { adjustCanvasSize, applyBlur, eraseText } from "../utils/canvas.utils";
pdfjs.GlobalWorkerOptions.workerSrc = "../public/pdf.worker.min.mjs";

const PdfViewer = ({ pdfFile }) => {
  const [activeMode, setActiveMode] = useState(null); // Modes: "blur", "erase", "addText"
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [startPosition, setStartPosition] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const overlayCanvasRef = useRef(null); // where user draws rectangle
  const pdfPageRef = useRef(null); // to calculate drawing coordinates

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handlePageRenderSuccess = () => {
    adjustCanvasSize(overlayCanvasRef.current, pdfPageRef.current);
  };

  useEffect(() => {
    handlePageRenderSuccess();
  }, [pageNumber, numPages]);

  const startDrawing = (e) => {
    // convert mouse coordinates to canvas coordinates
    // store canvas coordinates in startPosition
    const canvas = overlayCanvasRef.current;
    const rectangle = canvas.getBoundingClientRect();
    const x = e.clientX - rectangle.left;
    const y = e.clientY - rectangle.top;
    setStartPosition({ x, y });
    setIsDrawing(true);
  };

  const drawingRectangle = (e) => {
    //continuously draw a dashed rectangle onMouseMove
    if (!isDrawing) return;

    const canvas = overlayCanvasRef.current;
    const context = canvas.getContext("2d");
    const rectangle = canvas.getBoundingClientRect();
    const x = e.clientX - rectangle.left;
    const y = e.clientY - rectangle.top;

    // clear any existing rectangle
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = "rgba(255, 0, 0, 0.5)";
    context.lineWidth = 2;
    context.setLineDash([5, 5]); // dashed rectangle
    context.beginPath();
    // drawing rectangle
    context.rect(
      startPosition.x,
      startPosition.y,
      x - startPosition.x,
      y - startPosition.y
    );
    context.stroke();
  };

  const finishDrawing = (e) => {
    if (!isDrawing || !startPosition) return;

    const canvas = overlayCanvasRef.current;
    const rectangle = canvas.getBoundingClientRect();
    const x = e.clientX - rectangle.left;
    const y = e.clientY - rectangle.top;

    const startX = startPosition.x;
    const startY = startPosition.y;
    const width = x - startX;
    const height = y - startY;

    if (activeMode == "blur")
      applyBlur(
        pdfPageRef.current.querySelector("canvas"),
        canvas,
        startX,
        startY,
        width,
        height
      );
    else if (activeMode == "erase")
      eraseText(
        pdfPageRef.current.querySelector("canvas"),
        canvas,
        startX,
        startY,
        width,
        height
      );
    // clear the rectangle drawn
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    setIsDrawing(false);
    setStartPosition(null);
  };

  return (
    <div className="p-4 flex flex-col items-center relative">
      <h1 className="text-xl font-bold mb-4">PDF Viewer</h1>
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setActiveMode("blur")}
          className={`px-4 py-2 ${
            activeMode == "blur" ? "bg-blue-500 text-white" : "bg-gray-300"
          } rounded`}
        >
          Blur
        </button>
        <button
          onClick={() => setActiveMode("erase")}
          className={`px-4 py-2 ${
            activeMode == "erase" ? "bg-blue-500 text-white" : "bg-gray-300"
          } rounded`}
        >
          Erase
        </button>
        <button
          onClick={() => setActiveMode("addText")}
          className={`px-4 py-2 ${
            activeMode == "addText" ? "bg-blue-500 text-white" : "bg-gray-300"
          } rounded`}
        >
          Add Text
        </button>
      </div>
      <div className="relative">
        <div className="relative" ref={pdfPageRef}>
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page
              pageNumber={pageNumber}
              onRenderSuccess={handlePageRenderSuccess}
            />
          </Document>
        </div>
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0"
          style={{ pointerEvents: "auto", zIndex: 10 }}
          onMouseDown={startDrawing}
          onMouseMove={drawingRectangle}
          onMouseUp={finishDrawing}
        />
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          disabled={pageNumber == 1}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >
          Previous
        </button>
        <p className="text-gray-700">
          Page {pageNumber} of {numPages}
        </p>
        <button
          onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
          disabled={pageNumber == numPages}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PdfViewer;
