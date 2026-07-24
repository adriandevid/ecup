const datas = require("./ee.json");

var baseCard = datas.filter(x => x.text == "Minanda").sort((a, b) => a.score + b.score)[0];
var coordenates = [
    [baseCard.poly[0][0], baseCard.poly[0][1] - (baseCard.poly[0][1] * 0.5)],
    [baseCard.poly[1][0], baseCard.poly[1][1] - (baseCard.poly[1][1] * 0.5)],
    [baseCard.poly[2][0], baseCard.poly[2][1]],
    [baseCard.poly[3][0], baseCard.poly[3][1]]
]

console.log(baseCard);
console.log(coordenates);

const positionsPtBr = [
    "GOL", // Goleiro

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

var rowCards = datas.filter(x => {
    var sourceCoordinates = x.poly;
    if (
        sourceCoordinates[0][1] >= coordenates[0][1] &&
        sourceCoordinates[0][1] <= coordenates[3][1]
    ) {
        return true
    } {
        return false
    }
});


var positionsAround = rowCards.filter(x => positionsPtBr.includes(x.text.toUpperCase())).map((x, index) => {
    var position = x.poly;

    return {
        data: x,
        between: coordenates[0][0] - position[0][0]
    }
}).sort((a, b) => a.between - b.between)

console.log(positionsAround[2].data);