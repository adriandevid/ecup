const sharp = require('sharp');

// async function setDpi() {
//   await sharp('C:\\Users\\AdrianMS\\Downloads\\a.png')
//     .resize({ width: 2000 }) // Redimensione se precisar de mais resolução real
//     .withMetadata({ density: 300 }) // Define o DPI para 300
//     .toFile('output.png');
// }

async function prepareOCR(fontSize = 10) {

    let dpi;

    if (fontSize > 8) {
        dpi = 400;
    } else {
        dpi = 600; // dentro da faixa 400-600
    }

    // A4 proporcional
    const targetWidth = Math.round(8.27 * dpi);
    const targetHeight = Math.round(11.69 * dpi);

    const output = await sharp('C:\\Users\\AdrianMS\\Downloads\\test9.png')
        // .grayscale()

        // aumenta contraste
        .normalize()

        // redimensiona mantendo proporção
        .resize({
            width: targetWidth,
            height: targetHeight,
            fit: "inside",
            kernel: sharp.kernel.lanczos3
        })

        // melhora bordas dos caracteres
        .sharpen({
            sigma: 1.2,
            m1: 0.8,
            m2: 0.2
        })

        // remove ruído pequeno
        .median(1)

        .png({
            compressionLevel: 9
        })
        .toFile('output.png');
}

prepareOCR();