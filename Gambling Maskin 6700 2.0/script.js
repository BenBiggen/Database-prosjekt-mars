/*let deck = [
  { card: "As", value: 11 }, { card: "Ks", value: 10 }, { card: "Qs", value: 10 }, { card: "Js", value: 10 }, { card: "Ts", value: 10 }, { card: "9s", value: 9 }, { card: "8s", value: 8 }, { card: "7s", value: 7 }, { card: "6s", value: 6 }, { card: "5s", value: 5 }, { card: "4s", value: 4 }, { card: "3s", value: 3 }, { card: "2s", value: 2 },

  { card: "Ah", value: 11 }, { card: "Kh", value: 10 }, { card: "Qh", value: 10 }, { card: "Jh", value: 10 }, { card: "Th", value: 10 }, { card: "9h", value: 9 }, { card: "8h", value: 8 }, { card: "7h", value: 7 }, { card: "6h", value: 6 }, { card: "5h", value: 5 }, { card: "4h", value: 4 }, { card: "3h", value: 3 }, { card: "2h", value: 2 },

  { card: "Ad", value: 11 }, { card: "Kd", value: 10 }, { card: "Qd", value: 10 }, { card: "Jd", value: 10 }, { card: "Td", value: 10 }, { card: "9d", value: 9 }, { card: "8d", value: 8 }, { card: "7d", value: 7 }, { card: "6d", value: 6 }, { card: "5d", value: 5 }, { card: "4d", value: 4 }, { card: "3d", value: 3 }, { card: "2d", value: 2 },

  { card: "Ac", value: 11 }, { card: "Kc", value: 10 }, { card: "Qc", value: 10 }, { card: "Jc", value: 10 }, { card: "Tc", value: 10 }, { card: "9c", value: 9 }, { card: "8c", value: 8 }, { card: "7c", value: 7 }, { card: "6c", value: 6 }, { card: "5c", value: 5 }, { card: "4c", value: 4 }, { card: "3c", value: 3 }, { card: "2c", value: 2 }
];*/

let deck = [
  "As","Ks","Qs","Js","Ts","9s","8s","7s","6s","5s","4s","3s","2s",
  "Ah","Kh","Qh","Jh","Th","9h","8h","7h","6h","5h","4h","3h","2h",
  "Ad","Kd","Qd","Jd","Td","9d","8d","7d","6d","5d","4d","3d","2d",
  "Ac","Kc","Qc","Jc","Tc","9c","8c","7c","6c","5c","4c","3c","2c"
];

let hand = [];
let house = [];
const handDiv = document.getElementById("handDiv");
const houseDiv = document.getElementById("houseDiv");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand")

hitButton.addEventListener("click", () => {
    hit();
});

standButton.addEventListener("click", () => {
    stand();
});

function cardPull(position, positionDiv){
    let randomHand = deck[Math.floor(Math.random()*deck.length)];
    let indexHand = deck.indexOf(randomHand);
    deck.splice(indexHand, 1);
    position.push(randomHand);

    let handSide = document.createElement("playing-card");
    handSide.setAttribute("cid", `${randomHand}`);
    positionDiv.appendChild(handSide);
}

cardPull(hand, handDiv);

cardPull(house, houseDiv)

cardPull(hand, handDiv);

function hit(){
    cardPull(hand, handDiv);
};

function stand(){
    cardPull(house, houseDiv)
}

console.log("hand: "+hand);
console.log("house: "+house);
console.log(deck);