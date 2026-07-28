'use client';

import { useEffect, useState } from "react";
import { PaddleOCR } from "@paddleocr/paddleocr-js";
import { Card, ObjectTextOCR } from "@/types";

function isValidNumber(str: string) {
  return typeof str === 'string' && str.trim() !== '' && Number.isFinite(Number(str));
}


export default function App() {

  const [ocr, setOcr] = useState<PaddleOCR | any | null>(null);
  const [textResult, setTextResult] = useState("");
  const [loadingConnectionWebgpu, isLoadingConnectionWebgpu] = useState<boolean>(false);

  const [loading, isLoading] = useState<boolean>(false);

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

  var taticalSetupNamespaces = [
    {
      title: "Posse de bola",
      splited: ["posse", "bola"]
    }
  ];

  const loadCardsOfTeam = (datas: ObjectTextOCR[]) : Card[] => {
    var cards: Card[] = [];
    var names = datas.filter(x => x.text.length > 4 && /^[\p{L}\s]+$/u.test(x.text.replaceAll(" ", "")));

    names.forEach(x => {
      if (x.text.split(" ").filter(t => taticalSetupNamespaces.filter(s => s.splited.includes(t)).length > 0).length == 0) {
        var card = searchCard(datas, x.text);
        if (card.overall) {
          cards.push(searchCard(datas, x.text));
        }
      }
    })

    return cards;
  }


  const searhTraining = (datas: ObjectTextOCR[]) => {
    return datas.filter(x => x.text.split("-").length == 4)[0].text
  }

  const searchTaticalSetup = (datas: ObjectTextOCR[]) => {
    var name;
    
    datas.forEach(x => {
      var nameSplited = x.text.split(" ");

      nameSplited.forEach(t => {
        var search = taticalSetupNamespaces.filter(s => s.splited.includes(t));
        if(search.length > 0) {
          name = search[0].title
        }
      })
    })

    return name;
  }

  const searchCard = (datas: ObjectTextOCR[], playerName: string) => {
    var baseCard = datas.filter(x => x.text == playerName).sort((a, b) => a.score + b.score)[0];
    var card: { name: string, position?: string | undefined, overall?: number | undefined } = {
      name: baseCard.text
    }

    var heigthRowCards = datas.filter(x => (baseCard.poly[0][1] - x.poly[0][1]) > 0);
    var heigthRowCardsAroundBaseCard = heigthRowCards.map(x => ({
      c: x,
      axisX: baseCard.poly[0][0] - x.poly[0][0],
      axisY: baseCard.poly[0][1] - x.poly[0][1],
      around: (baseCard.poly[0][0] - x.poly[0][0]) + (baseCard.poly[0][1] - x.poly[0][1])
    })).filter(x => x.axisX > 0).sort((a, b)=> a.around - b.around)

    var positionCoordinates = heigthRowCardsAroundBaseCard
      .filter(x => positionsPtBr.includes(x.c.text.toUpperCase()))[0];

    var overallCoordinates = heigthRowCardsAroundBaseCard
      .filter(x => isValidNumber(x.c.text))[0];

    card.position = positionCoordinates.c.text;
    card.overall = parseInt(overallCoordinates.c.text);

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
      console.log(searchTaticalSetup(result.items))
      setTextResult(JSON.stringify({
        players: loadCardsOfTeam(result.items),
        training: searhTraining(result.items),
        tactical_setup: searchTaticalSetup(result.items)
      }, null, 4));
    }
  };

  return (
    <div className="bg-white">
      {loadingConnectionWebgpu && (<p>conectando-se ao webgpu...</p>)}
      {loading && (<p>Carregamento...</p>)}
      <input type="file" onChange={handleImage} />
      <pre>{textResult}</pre>
    </div>
  )
}