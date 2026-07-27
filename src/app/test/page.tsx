'use client';

import { useEffect, useState } from "react";
import { PaddleOCR } from "@paddleocr/paddleocr-js";

function isValidNumber(str: string) {
  return typeof str === 'string' && str.trim() !== '' && Number.isFinite(Number(str));
}

export type ObjectTextOCR = { poly: number[][], text: string, score: number };
export type Card = { name: string, position?: string | undefined, overall?: number | undefined };

export default function App() {

  const [ocr, setOcr] = useState<PaddleOCR | any | null>(null);
  const [textResult, setTextResult] = useState("");
  const [loadingConnectionWebgpu, isLoadingConnectionWebgpu] = useState<boolean>(false);

  const [loading, isLoading] = useState<boolean>(false);

  var namesCase = ["posse", "bola"];

  const loadCardsOfTeam = (datas: ObjectTextOCR[]) => {
    var cards: Card[] = [];
    var names = datas.filter(x => x.text.length > 4 && /^[\p{L}\s]+$/u.test(x.text.replaceAll(" ", "")));

    names.forEach(x => {
      if (x.text.split(" ").filter(t => namesCase.includes(t)).length == 0) {
        var card = searchCard(datas, x.text);
        if (card.overall) {
          cards.push(searchCard(datas, x.text));
        }
      }
    })

    console.log(cards)
  }

  const searchCard = (datas: ObjectTextOCR[], playerName: string) => {
    var baseCard = datas.filter(x => x.text == playerName).sort((a, b) => a.score + b.score)[0];
    var card: { name: string, position?: string | undefined, overall?: number | undefined } = {
      name: baseCard.text
    }

    const positionsPtBr = [
      "GOL", // Goleiro
      "GO",
      "ZC",  // Zagueiro Central
      "LE",  // Lateral Esquerdo
      "LD",  // Lateral Direito
      "VOL", // Volante
      "MC",  // Meio-Campista
      "MAT", // Meio-Atacante
      "MLE", // Meio Lateral Esquerdo
      "MLD", // Meio Lateral Direito
      "PE",  // Ponta Esquerda
      "PD",  // Ponta Direita
      "SA",  // Segundo Atacante
      "CA"   // Centroavante
    ];

    var rowCards: any[] = datas.map((element) => ({
      data: element,
      betweenAxisY: baseCard.poly[0][1] - element.poly[0][1]
    }))
      .filter(x => x.betweenAxisY > 0 && x.data.text.length >= 2);

    rowCards = rowCards.map(x => ({
      data: x.data,
      betweenAxisY: x.betweenAxisY,
      betweenAxisX: baseCard.poly[0][0] - x.data.poly[0][0]
    })).filter(x => x.betweenAxisX > 0)

    const tolerance = 10;

    rowCards = rowCards.sort((a, b) => {
      if (Math.abs(a.betweenAxisY - b.betweenAxisY) <= tolerance) {
        return a.betweenAxisX - b.betweenAxisX;
      }

      return a.betweenAxisY - b.betweenAxisY;
    })

    var positionCoordinates = rowCards.filter(x => positionsPtBr.includes(x.data.text.toUpperCase()))[0];
    var overallCoordinates = rowCards.filter(x => isValidNumber(x.data.text))[0];

    card.position = positionCoordinates.data.text;
    card.overall = parseInt(overallCoordinates.data.text);

    return card;
  }

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
    if (ocr == null) {
      console.error = (...args) => {
        if (
          typeof args[0] === "string" &&
          args[0].includes("CleanUnusedInitializersAndNodeArgs")
        ) {
          return;
        }

        return window.console.warn(...args);
      };

      isLoadingConnectionWebgpu(true);

      PaddleOCR.create({
        pipelineConfig,
        lang: "ch",
        ocrVersion: "PP-OCRv5",
        ortOptions: { backend: "auto" },
        textDetectionModelAsset: {
          url: "/models/PP-OCRv5_mobile_det_onnx.tar"
        },
        textRecognitionModelAsset: {
          url: "/models/PP-OCRv5_mobile_rec_onnx.tar"
        },
        textDetectionModelName: "PP-OCRv5_mobile_det",
        textRecognitionModelName: "PP-OCRv5_mobile_rec"
      }).then((e) => {
        e.initialize().then(x => {
          console.log(x)
          setOcr(e);
          isLoadingConnectionWebgpu(false);
        })
      });
    }
  }, []);

  const handleImage = async (e: any) => {
    if (ocr != null) {
      isLoading(true);

      const file = e.target.files[0];
      const [result] = await ocr.predict(file);

      isLoading(false);
      loadCardsOfTeam(result.items)
      setTextResult(JSON.stringify(result.items));
    }
  };

  return (
    <div className="bg-white">
      {loadingConnectionWebgpu && (<p>conectando-se ao webgpu...</p>)}
      {loading && (<p>Carregamento...</p>)}
      <input type="file" onChange={handleImage} />
      <p>{textResult}</p>
    </div>
  )
}