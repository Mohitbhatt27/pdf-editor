import { useState } from "react";

const PdfUploader = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState("");

  const handleOnFileChange = (e) => {
    const file = e.target.files[0];
    if (file.type == "application/pdf") {
      setPdfFile(file);
      setError("");
    } else {
      setPdfFile(null);
      setError("Please only select a valid PDF file.");
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Upload a PDF file</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleOnFileChange}
        className="mb-2 p-2 border border-gray-300 rounded"
      />
      {error && <p className="text-red-400">{error}</p>}
      {pdfFile && (
        <div>
          <p className="text-gray-600">File name: {pdfFile.name}</p>
          <p className="text-gray-600">File size: {pdfFile.size} bytes</p>
        </div>
      )}
    </div>
  );
};

export default PdfUploader;
