const sharp = require("sharp");

async function detectBrightAreas(path) {

    const { data, info } = await sharp(path)
        .resize({
                    width: 4000,
                    kernel: sharp.kernel.lanczos3
                })
        .modulate({ 
            hue: 150
         })
         .sharpen()
        // .toBuffer({ resolveWithObject: true })
        .png()
        .toFile("./mask.png");


    // const threshold = 200;

    // const mask = Buffer.alloc(data.length);


    // for (let i = 0; i < data.length; i++) {

    //     // pixels claros viram branco
    //     // pixels escuros viram preto
    //     mask[i] = data[i] > threshold ? 255 : 0;

    // }


    // await sharp(mask, {
    //     raw: {
    //         width: info.width,
    //         height: info.height,
    //         channels: 1
    //     }
    // })


    console.log("Gerado mask.png");
}


detectBrightAreas("C:\\Users\\AdrianMS\\Downloads\\test7.png");