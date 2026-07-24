const datas = require("./ee.json");

var baseCard = datas.filter(x => x.text == "Minanda").sort((a, b) => a.score + b.score)[0];
var coordenates = [
    [baseCard.poly[0][0] - 20, baseCard.poly[0][1] - 300],
    [baseCard.poly[1][0] + 20, baseCard.poly[1][1]  - 300],
    [baseCard.poly[2][0], baseCard.poly[2][1]],
    [baseCard.poly[3][0], baseCard.poly[3][1]]
]

console.log(baseCard);
console.log(coordenates);

var areaCard = datas.filter(x => {
    var sourceCoordinates = x.poly;
    if(
        (
            sourceCoordinates[0][0] > coordenates[0][0] && 
            sourceCoordinates[0][0] < coordenates[3][0]
        )
        &&
        (
            sourceCoordinates[0][1] > coordenates[0][1] && 
            sourceCoordinates[0][1] < coordenates[3][1]
        )
         &&
        (
            sourceCoordinates[1][0] > coordenates[1][0] && 
            sourceCoordinates[1][0] < coordenates[2][0]
        ) &&
        (
            sourceCoordinates[1][1] > coordenates[1][1] && 
            sourceCoordinates[1][1] < coordenates[2][1]
        )
    ) {
        return true
    } {
        return false
    }
})

console.log(areaCard)