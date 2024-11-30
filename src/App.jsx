import { useState } from "react";

import PdfUploader from "./components/PdfUploader";
import PdfViewer from "./components/PdfViewer";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  return (
    <div className="p-4 m-2">
      <PdfUploader setPdfFile={setPdfFile} />
      {pdfFile && <PdfViewer pdfFile={pdfFile} />}
    </div>
  );
}

export default App;
