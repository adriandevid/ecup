const a = require("ppu-paddle-ocr");
const fs = require("fs");
const sharp = require("sharp");

const positionsPtBr = [
    "GO", // Goleiro
    "ZC",  // Zagueiro Central

    "LE",  // Lateral Esquerdo
    "LD",  // Lateral Direito

    "VOL", // Volante
    "MC",  // Meio-Campista
    "MAT", // Meio-Atacante

    "MLE", // Meio Lateral Esquerdo
    "MLD", // Meio Lateral Direito
    "MLG",
    "PTE",  // Ponta Esquerda
    "PTD",  // Ponta Direita

    "SA",  // Segundo Atacante
    "CA"   // Centroavante
];


(async () => {
    const ocr = new a.PaddleOcrService();

    await ocr.initialize();

    const buffer = fs.readFileSync("/home/adriandevid/Downloads/test1.png");

    const processed = await sharp(buffer)
        .grayscale()          // remove cores
        .normalize()          // aumenta contraste
        .resize({
            width: 3000,
            kernel: sharp.kernel.lanczos3
        })
        .sharpen()            // melhora definição das letras
        .toBuffer();

    const arrayBuffer = processed.buffer.slice(
        processed.byteOffset,
        processed.byteOffset + processed.byteLength
    );

    const result = await ocr.recognize(arrayBuffer);
    const datas = result.lines;

    //console.log(datas);
    var cardPersonSelected;
    var search = "Johan Cruyff";
    var baseCard = datas.filter(x => x.filter(a => a.text == search).length > 0).map(x => x.filter(a => a.text == search)[0])[0];

    var positions = [];

    datas.forEach(x => {
        x.forEach(element => {
            if (positionsPtBr.includes(element.text.toUpperCase())) {
                positions.push(element);
            } else if (element.text.length <= 3) {
                if (positionsPtBr.filter(pos => element.text.includes(pos)).length > 0) {
                    positions.push(element)
                }
            }
        })
    })
    var overhalls = datas.filter(x => x.filter(a => /\d/.test(a.text)).length > 0).map(x => x.filter(a => /\d/.test(a.text))[0]);

    console.log("base card: ", baseCard);
    console.log("positions", positions);
    //console.log("overhalls", overhalls);

    await ocr.destroy();
})();