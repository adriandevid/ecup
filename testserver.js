const a = require("ppu-paddle-ocr");
const fs = require("fs");

(async () => {
    const ocr = new a.PaddleOcrService();

    await ocr.initialize();

    const buffer = fs.readFileSync("/home/adriandevid/Downloads/WhatsApp Image 2026-07-24 at 01.48.50.png");

    const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
    );

    const result = await ocr.recognize(arrayBuffer);

    console.log(result.lines[0]);

    await ocr.destroy();
})();