'use client';

import { useEffect, useState } from "react";
import { PaddleOCR } from "@paddleocr/paddleocr-js";

export default function App() {

  const [ocr, setOcr] = useState<PaddleOCR | any |  null>(null);
  const [textResult, setTextResult] = useState("");
  const [loading, isLoading] = useState<boolean>(false);

  const pipelineConfig = `
    pipeline_name: OCR
    SubModules:
      TextDetection:
        model_name: PP-OCRv5_mobile_det
        batch_size: 2
      TextRecognition:
        model_name: PP-OCRv5_mobile_rec
        batch_size: 6
  `;

  useEffect(() => {
    if(ocr == null) {
      console.error = (...args) => {
        if (
          typeof args[0] === "string" &&
          args[0].includes("CleanUnusedInitializersAndNodeArgs")
        ) {
          return;
        }

        return window.console.warn(...args);
      };


      PaddleOCR.create({ pipelineConfig, lang: "ch", ocrVersion: "PP-OCRv5", ortOptions: { backend: "auto" } }).then((e) => {
          setOcr(e)
      });
    }
  }, []);

  const handleImage = async (e: any) => {
    if(ocr != null) {
        isLoading(true);

        const file = e.target.files[0];
        const [result] = await ocr.predict(file);

        isLoading(false);
        setTextResult(JSON.stringify(result.items));
    }
  };

  return (
    <div className="bg-white">
        {loading && (<p>Carregamento...</p>)}
        <input type="file" onChange={handleImage} />
        <p>{textResult}</p>
    </div>
  )
}