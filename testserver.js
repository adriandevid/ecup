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
const taticalSetupNamespaces = [
    {
        title: "Posse de bola",
        splited: ["posse", "bola"]
    }
];

function isValidNumber(str) {
    return typeof str === 'string' && str.trim() !== '' && Number.isFinite(Number(str));
}

const loadCardsOfTeam = (datas) => {
    var cards = [];
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


const searhTraining = (datas) => {
    return datas.filter(x => x.text.split("-").length >= 3)[0].text
}

const searchTaticalSetup = (datas) => {
    var name = "";

    datas.forEach(x => {
        var nameSplited = x.text.split(" ");

        nameSplited.forEach(t => {
            var search = taticalSetupNamespaces.filter(s => s.splited.includes(t));
            if (search.length > 0) {
                name = search[0].title
            }
        })
    })

    return name;
}

const searchCard = (datas, playerName) => {
    var baseCard = datas.filter(x => x.text == playerName).sort((a, b) => a.score + b.score)[0];
    var card = {
        name: baseCard.text
    }

    try {
        var heigthRowCards = datas.filter(x => (baseCard.box.y - x.box.y) > 0);
        var heigthRowCardsAroundBaseCard = heigthRowCards.map(x => ({
            c: x,
            axisX: baseCard.box.x - x.box.x,
            axisY: baseCard.box.y - x.box.y,
            around: (baseCard.box.x - x.box.x) + (baseCard.box.y - x.box.y)
        })).filter(x => x.axisX > 0).sort((a, b) => a.around - b.around)

        var positionCoordinates = heigthRowCardsAroundBaseCard
            .filter(x => positionsPtBr.includes(x.c.text.toUpperCase()))[0];

        var overallCoordinates = heigthRowCardsAroundBaseCard
            .filter(x => isValidNumber(x.c.text))[0];

        if (positionCoordinates) {
            card.position = positionCoordinates.c.text;
        }
        if (overallCoordinates) {
            card.overall = parseInt(overallCoordinates.c.text);
        }
    } catch (ex) {
        // console.log("dados", datas)
        console.log("erro", baseCard)
    }

    return card;
}

async function process1(buffer, ocr) {
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

    const result = await ocr.recognize(arrayBuffer);
    const datas = [];

    result.lines.forEach(x => {
        x.forEach(a => {
            datas.push(a);
        })
    })

    return loadCardsOfTeam(datas);
}

async function process2(buffer, ocr) {
    const processed = await sharp(buffer)
        .normalize()
        .resize({
            width: 4000,
            kernel: sharp.kernel.lanczos3
        })
        .modulate({
            hue: 150
        })
        .toBuffer();

    const arrayBuffer = processed.buffer.slice(
        processed.byteOffset,
        processed.byteOffset + processed.byteLength
    );

    const result = await ocr.recognize(arrayBuffer);
    const datas = [];

    result.lines.forEach(x => {
        x.forEach(a => {
            datas.push(a);
        })
    })

    return loadCardsOfTeam(datas);
}

async function process3(buffer, ocr) {
    const { data, info } = await sharp(buffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });


    const threshold = 200;

    const mask = Buffer.alloc(data.length);

    for (let i = 0; i < data.length; i++) {
        mask[i] = data[i] > threshold ? 255 : 0;

    }


    const processed = await sharp(mask, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 1
        }
    })
        .png()
        .toBuffer();

    const arrayBuffer = processed.buffer.slice(
        processed.byteOffset,
        processed.byteOffset + processed.byteLength
    );

    const result = await ocr.recognize(arrayBuffer);
    const datas = [];

    result.lines.forEach(x => {
        x.forEach(a => {
            datas.push(a);
        })
    })

    return loadCardsOfTeam(datas);
}

(async () => {
    const ocr = new a.PaddleOcrService();

    await ocr.initialize();

    const buffer = fs.readFileSync("C:\\Users\\AdrianMS\\Downloads\\test1.png");

    

    console.log(
        await process1(buffer, ocr),
        await process2(buffer, ocr),
        await process3(buffer, ocr)
    );

    await ocr.destroy();
})();