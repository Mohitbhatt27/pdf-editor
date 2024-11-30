import { useState } from "react";

const PdfUploader = ({ setPdfFile }) => {
  const [error, setError] = useState("");

  const handleOnFileChange = (e) => {
    const file = e.target.files[0];
    if (file.type == "application/pdf") {
      setPdfFile(URL.createObjectURL(file));
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
    </div>
  );
};

export default PdfUploader;
