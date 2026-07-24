'use client';

import { useEffect, useState } from "react";
import { PaddleOCR } from "@paddleocr/paddleocr-js";

export default function App() {

  const [ocr, setOcr] = useState<PaddleOCR | any |  null>(null);
  const [textResult, setTextResult] = useState("");

  useEffect(() => {
    PaddleOCR.create({ lang: "ch", ocrVersion: "PP-OCRv5" }).then((e) => {
        setOcr(e)
    });
  }, []);
  
  console.log(ocr);

  const handleImage = async (e: any) => {
    if(ocr != null) {
        const file = e.target.files[0];
        const [result] = await ocr.predict(file);
        setTextResult(JSON.stringify(result.items));
    }
  };

  return (
    <div className="bg-white">
        <input type="file" onChange={handleImage} />
        <p>{textResult}</p>
    </div>
  )
}