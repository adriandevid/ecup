const a = require("ppu-paddle-ocr");
const fs = require("fs");
const sharp = require("sharp");



const positionsPtBr = [
    "GO", // Goleiro
    "G0",
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

function isValidNumber(str) {
  return typeof str === 'string' && str.trim() !== '' && Number.isFinite(Number(str));
}

(async () => {
    const ocr = new a.PaddleOcrService();

    await ocr.initialize();

    const buffer = fs.readFileSync("./test-a.png");

    const processed = await sharp(buffer)
        .grayscale()          // remove cores
        .normalize()
        .resize({
            width: 4000,
            kernel: sharp.kernel.lanczos3
        })
        .sharpen()
        .toBuffer();

    const arrayBuffer = processed.buffer.slice(
        processed.byteOffset,
        processed.byteOffset + processed.byteLength
    );

    // await fs.writeFile("/test-a.png", processed.buffer);
    // const buffer2 = Buffer.from(arrayBuffer);
    // const writeStream = fs.createWriteStream("./test-a.png");
    
    // writeStream.write(buffer2);
    // writeStream.end();
    const result = await ocr.recognize(arrayBuffer);
    const datas = result.lines;

    var cardPersonSelected;
    var search = "Erling Haaland";
    var baseCard = datas.filter(x => x.filter(a => a.text == search).length > 0).map(x => x.filter(a => a.text == search)[0])[0];

    var positions = [];

    datas.forEach(x => {
        x.forEach(element => {
            if (positionsPtBr.includes(element.text.toUpperCase())) {
                positions.push(element);
            } else if (element.text.length <= 3) {
                if (positionsPtBr.filter(pos => element.text.toUpperCase().includes(pos)).length > 0) {
                    positions.push(element)
                }
            }
        })
    })
    var overhalls = datas.filter(x => x.filter(a => isValidNumber(a.text)).length > 0).map(x => x.filter(a => isValidNumber(a.text))[0]);

    // console.log("base card: ", baseCard);
    // console.log("positions", positions);
    // console.log(datas)
    console.log("overhalls", overhalls);


    await ocr.destroy();
})();