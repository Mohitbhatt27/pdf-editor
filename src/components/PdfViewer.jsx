import { jsPDF } from "jspdf";
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
  const [isDragging, setIsDragging] = useState(false);
  const [textBoxes, setTextBoxes] = useState([]); // Tracks all text boxes
  const overlayCanvasRef = useRef(null); // Canvas reference
  const pdfPageRef = useRef(null); // PDF container reference
  const [focusedId, setFocusedId] = useState(null);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const canvas = pdfPageRef.current.querySelector("canvas");
    const canvasContext = canvas.getContext("2d");
    const canvasImageData = canvasContext.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    doc.addImage(canvasImageData, "JPEG", 0, 0, 210, 297);

    textBoxes.forEach((textBox) => {
      if (textBox.hasText) {
        doc.text(textBox.text, textBox.x, textBox.y);
      }
    });

    doc.save("modified-pdf.pdf");
  };

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

  const handleAddTextClick = () => {
    setActiveMode("addText");
    const newTextBox = {
      id: Date.now(),
      x: 150, // Default X position
      y: 150, // Default Y position
      width: 100,
      height: 50,
      text: "",
      hasText: false,
      pageNumber,
    };

    setTextBoxes((prev) => [...prev, newTextBox]);
  };

  // Dragging Behavior for Text Boxes
  const handleMouseDown = (e, id) => {
    setIsDragging(id); // which text box is being dragged
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const rectangle = pdfPageRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rectangle.left;
      const mouseY = e.clientY - rectangle.top;

      setTextBoxes((prev) =>
        prev.map((box) =>
          box.id == isDragging
            ? { ...box, x: mouseX - 75, y: mouseY - 25 } // Update position
            : box
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Blur and Erase Modes
  const startDrawing = (e) => {
    const canvas = overlayCanvasRef.current;
    const rectangle = canvas.getBoundingClientRect();
    const x = e.clientX - rectangle.left;
    const y = e.clientY - rectangle.top;

    if (activeMode == "blur" || activeMode == "erase") {
      setStartPosition({ x, y });
      setIsDrawing(true);
    }
  };

  const drawingRectangle = (e) => {
    if (activeMode == "blur" || activeMode == "erase") {
      if (!isDrawing) return;
      const canvas = overlayCanvasRef.current;
      const context = canvas.getContext("2d");
      const rectangle = canvas.getBoundingClientRect();
      const x = e.clientX - rectangle.left;
      const y = e.clientY - rectangle.top;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "rgba(255, 0, 0, 0.5)";
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.rect(
        startPosition.x,
        startPosition.y,
        x - startPosition.x,
        y - startPosition.y
      );
      context.stroke();
    }
  };

  const finishDrawing = (e) => {
    if (activeMode == "blur" || activeMode == "erase") {
      if (!isDrawing || !startPosition) return;

      const canvas = overlayCanvasRef.current;
      const rectangle = canvas.getBoundingClientRect();
      const x = e.clientX - rectangle.left;
      const y = e.clientY - rectangle.top;
      const startX = startPosition.x;
      const startY = startPosition.y;
      const width = x - startX;
      const height = y - startY;

      if (activeMode == "blur") {
        applyBlur(
          pdfPageRef.current.querySelector("canvas"),
          canvas,
          startX,
          startY,
          width,
          height
        );
      } else if (activeMode == "erase") {
        eraseText(
          pdfPageRef.current.querySelector("canvas"),
          canvas,
          startX,
          startY,
          width,
          height
        );
      }
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      setIsDrawing(false);
      setStartPosition(null);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center relative">
      <h1 className="text-xl font-bold mb-4">PDF Viewer</h1>
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={handleAddTextClick}
          className={`px-4 py-2 ${
            activeMode == "addText" ? "bg-blue-500 text-white" : "bg-gray-300"
          } rounded`}
        >
          Add Text
        </button>
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
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Download
        </button>
      </div>
      <div
        className="relative"
        ref={pdfPageRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
          <Page
            pageNumber={pageNumber}
            onRenderSuccess={handlePageRenderSuccess}
          />
        </Document>
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0"
          style={{ pointerEvents: "auto", zIndex: 10 }}
          onMouseDown={startDrawing}
          onMouseMove={drawingRectangle}
          onMouseUp={finishDrawing}
        />
        {textBoxes
          .filter((textBox) => textBox.pageNumber == pageNumber)
          .map((textBox) => (
            <div
              key={textBox.id}
              style={{
                position: "absolute",
                left: textBox.x,
                top: textBox.y,
                border: focusedId == textBox.id ? "1px dashed blue" : "none",
                padding: "5px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                cursor: "move",
                zIndex: 20,
              }}
              contentEditable
              suppressContentEditableWarning
              onMouseDown={(e) => handleMouseDown(e, textBox.id)}
              onFocus={() => setFocusedId(textBox.id)}
              onBlur={(e) => {
                const updatedText = e.target.innerText.trim();
                setTextBoxes((prev) =>
                  prev.map((box) =>
                    box.id == textBox.id
                      ? { ...box, text: updatedText, hasText: true }
                      : box
                  )
                );
              }}
            >
              {textBox.text}
            </div>
          ))}
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
