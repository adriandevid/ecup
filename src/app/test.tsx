import { useEffect, useState } from "react";
import { PaddleOCR } from "@paddleocr/paddleocr-js";

export default function App() {
  const [ocr, setOcr] = useState<any>(null);
  const [textResult, setTextResult] = useState("");

  useEffect(() => {
    PaddleOCR.create({ lang: "ch", ocrVersion: "PP-OCRv5" }).then(setOcr);
  }, []);

  const handleImage = async (e: any) => {
    const file = e.target.files[0];
    const [result] = await ocr.predict(file);
    setTextResult(JSON.stringify(result.items));
  };

  return <input type="file" onChange={handleImage} />;
}