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

    const buffer = fs.readFileSync("C:\\Users\\AdrianMS\\Downloads\\test5.png");

    const processed = await sharp(buffer)
        .grayscale()          // remove cores
        .normalize()
        .resize({
            width: 4000,
            kernel: sharp.kernel.lanczos3
        })
        .composite([
            {
                input: "./template.png",
                blend: "over",
                opacity:0.25,
                left: 1000,
                top: 100
            },
            {
                input: "./template.png",
                blend: "over",
                opacity:0.25,
                left: 2000,
                top: 100
            }
        ])
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

    
    console.log(datas)

    await ocr.destroy();
})();