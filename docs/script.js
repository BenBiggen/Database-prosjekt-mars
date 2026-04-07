let deck = [ 
"As","Ks","Qs","Js","Ts","9s","8s","7s","6s","5s","4s","3s","2s",
"Ah","Kh","Qh","Jh","Th","9h","8h","7h","6h","5h","4h","3h","2h",
"Ad","Kd","Qd","Jd","Td","9d","8d","7d","6d","5d","4d","3d","2d",
"Ac","Kc","Qc","Jc","Tc","9c","8c","7c","6c","5c","4c","3c","2c" 
];

const deckValue = {
  "As": 11, "Ks": 10, "Qs": 10, "Js": 10, "Ts": 10, "9s": 9, "8s": 8, "7s": 7, "6s": 6, "5s": 5, "4s": 4, "3s": 3, "2s": 2,
  "Ah": 11, "Kh": 10, "Qh": 10, "Jh": 10, "Th": 10, "9h": 9, "8h": 8, "7h": 7, "6h": 6, "5h": 5, "4h": 4, "3h": 3, "2h": 2,
  "Ad": 11, "Kd": 10, "Qd": 10, "Jd": 10, "Td": 10, "9d": 9, "8d": 8, "7d": 7, "6d": 6, "5d": 5, "4d": 4, "3d": 3, "2d": 2,
  "Ac": 11, "Kc": 10, "Qc": 10, "Jc": 10, "Tc": 10, "9c": 9, "8c": 8, "7c": 7, "6c": 6, "5c": 5, "4c": 4, "3c": 3, "2c": 2
};

let hand = [];
let house = [];
const handDiv = document.getElementById("handDiv");
const houseDiv = document.getElementById("houseDiv");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const sumSide = {
  house: document.getElementById("houseSum"),
  hand: document.getElementById("handSum"),
};
const alertSide = document.getElementById("alert");
const essListe = ["As", "Ah", "Ad", "Ac"]

function inludererEss(position){
  return essListe.some(ess => position.includes(ess))
}

hitButton.addEventListener("click", () => {
  hit();
});

standButton.addEventListener("click", () => {
  stand();
});

function cardPull(position, positionDiv) {
  let randomHand = deck[Math.floor(Math.random() * deck.length)];
  let indexHand = deck.indexOf(randomHand);
  deck.splice(indexHand, 1);
  position.push(randomHand);

  let handSide = document.createElement("playing-card");
  handSide.setAttribute("cid", `${randomHand}`);
  positionDiv.appendChild(handSide);
}

cardPull(hand, handDiv);

cardPull(house, houseDiv);

cardPull(hand, handDiv);

let randomHouse = deck[Math.floor(Math.random() * deck.length)];
let indexHouse = deck.indexOf(randomHouse);
deck.splice(indexHouse, 1);
house.push(randomHouse);

let handSide = document.createElement("playing-card");
handSide.setAttribute("rank", `0`);
houseDiv.appendChild(handSide);

sumSide.house.innerText = sumHand(house) - deckValue[randomHouse];
sumSide.hand.innerText = sumHand(hand);

if ((sumHand(house) === 21) && (sumHand(house) === sumHand(hand))) {
  alertSide.innerText = "PUSH";
} else {
  if (sumHand(hand) === 21) {
    alertSide.innerText = "Blackjack!";
  } else {
    if (sumHand(house) === 21) {
      alertSide.innerText = "Huset vinner";
    }
  }
}

function sumHand(hand) {
  let sum = 0;
  let aceCount = 0;

  for (let card of hand) {
    sum += deckValue[card];

    // Count Aces
    if (card[0] === "A") {
      aceCount++;
    }
  }

  // Convert Aces from 11 → 1 if needed
  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }

  return sum;
}

function hit() {
  cardPull(hand, handDiv);

  if (sumHand(hand) > 21) {
    alertSide.innerText = "Bust";
  }

  sumSide.hand.innerText = sumHand(hand);
}

function stand() {
  houseDiv.removeChild(handSide);
  let houseSide = document.createElement("playing-card");
  houseSide.setAttribute("cid", `${randomHouse}`);
  houseDiv.appendChild(houseSide);

  while (sumHand(house) < 17) {
    cardPull(house, houseDiv);
  }

  sumSide.house.innerText = sumHand(house);

  if (sumHand(house) > 21 && sumHand(hand)<=21) {
    alertSide.innerText = "Du Vant!";
  }

  

//linjen under! For house bruk enten sumHouseEss eller sumHand(house) og samme for hand men hand i stedet for house
if (sumHand(house)===sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21) {
    alertSide.innerText = "PUSH"
    } else if (sumHand(house)>sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
        alertSide.innerText = "Huset vinner"
      } else if (sumHand(house)<sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
          alertSide.innerText = "Du Vant!"
        }
      }
