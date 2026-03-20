let deck = [
  "As","Ks","Qs","Js","Ts","9s","8s","7s","6s","5s","4s","3s","2s",
  "Ah","Kh","Qh","Jh","Th","9h","8h","7h","6h","5h","4h","3h","2h",
  "Ad","Kd","Qd","Jd","Td","9d","8d","7d","6d","5d","4d","3d","2d",
  "Ac","Kc","Qc","Jc","Tc","9c","8c","7c","6c","5c","4c","3c","2c"
];

let hand = []
let house = []

for (let n = 0; n<2; n++) {
    let tilfeldigHand = deck[Math.floor(Math.random()*deck.length)]
    let indexHand = deck.indexOf(tilfeldigHand)
    console.log(indexHand)
    deck.splice(indexHand, 1)
    hand.push(tilfeldigHand)

    let tilfeldigHouse = deck[Math.floor(Math.random()*deck.length)]
    let indexHouse = deck.indexOf(tilfeldigHouse)
    console.log(indexHouse)
    deck.splice(indexHouse, 1)
    house.push(tilfeldigHouse)


    let handSide = document.createElement("playing-card")
    handSide.setAttribute("cid", `${hand[n]}`)

    
}


console.log("hand: "+hand)
console.log("house: "+house)
console.log(deck)