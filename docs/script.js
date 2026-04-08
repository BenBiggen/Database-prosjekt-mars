let originalDeck = [ 
"As","Ks","Qs","Js","Ts","9s","8s","7s","6s","5s","4s","3s","2s",
"Ah","Kh","Qh","Jh","Th","9h","8h","7h","6h","5h","4h","3h","2h",
"Ad","Kd","Qd","Jd","Td","9d","8d","7d","6d","5d","4d","3d","2d",
"Ac","Kc","Qc","Jc","Tc","9c","8c","7c","6c","5c","4c","3c","2c" 
];

let deck = [];

const deckValue = {
  "As": 11, "Ks": 10, "Qs": 10, "Js": 10, "Ts": 10, "9s": 9, "8s": 8, "7s": 7, "6s": 6, "5s": 5, "4s": 4, "3s": 3, "2s": 2,
  "Ah": 11, "Kh": 10, "Qh": 10, "Jh": 10, "Th": 10, "9h": 9, "8h": 8, "7h": 7, "6h": 6, "5h": 5, "4h": 4, "3h": 3, "2h": 2,
  "Ad": 11, "Kd": 10, "Qd": 10, "Jd": 10, "Td": 10, "9d": 9, "8d": 8, "7d": 7, "6d": 6, "5d": 5, "4d": 4, "3d": 3, "2d": 2,
  "Ac": 11, "Kc": 10, "Qc": 10, "Jc": 10, "Tc": 10, "9c": 9, "8c": 8, "7c": 7, "6c": 6, "5c": 5, "4c": 4, "3c": 3, "2c": 2
};

let hand = [];
let house = [];
let randomHouse;
let handSide;
let gameActive = false;
const handDiv = document.getElementById("handDiv");
const houseDiv = document.getElementById("houseDiv");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const playButton = document.getElementById("play");
const sumSide = {
  house: document.getElementById("houseSum"),
  hand: document.getElementById("handSum"),
};
const alertSide = document.getElementById("alert");

hitButton.addEventListener("click", () => {
  hit();
});

standButton.addEventListener("click", () => {
  stand();
});

playButton.addEventListener("click", () => {
  play();
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

function revealHouse() {
  houseDiv.removeChild(handSide);
  let houseSide = document.createElement("playing-card");
  houseSide.setAttribute("cid", `${randomHouse}`);
  houseDiv.appendChild(houseSide);
}

function sumHand(hand) {
  let sum = 0;
  let aceCount = 0;

  for (let card of hand) {
    sum += deckValue[card];

    // teller esser
    if (card[0] === "A") {
      aceCount++;
    }
  }

  // Konverterer esser til 1 om summen stiger over 21
  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }

  return sum;
}

function hit() {
  if (!gameActive) return;

  cardPull(hand, handDiv);

  if (sumHand(hand) > 21) {
    alertSide.innerText = "Bust";
  }

  sumSide.hand.innerText = sumHand(hand);
}

function stand() {
  if (!gameActive) return;

  revealHouse();

  while (sumHand(house) < 17) {
    cardPull(house, houseDiv);
  }

  sumSide.house.innerText = sumHand(house);

  if (sumHand(house) > 21 && sumHand(hand)<=21) {
    alertSide.innerText = "Du Vant!";
  }

  if (sumHand(house)===sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21) {
    alertSide.innerText = "PUSH"
    } else if (sumHand(house)>sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
        alertSide.innerText = "Huset vinner"
      } else if (sumHand(house)<sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
          alertSide.innerText = "Du Vant!"
        }
  gameStartEnd(false, "grey")
      }

function gameStartEnd(boolean, color){
  gameActive = boolean;
  hitButton.style.backgroundColor = `${color}`
  standButton.style.backgroundColor = `${color}`
}

function play(){
  gameStartEnd(true, "whitesmoke")
  deck=[...originalDeck]

  handDiv.innerHTML = "";
  houseDiv.innerHTML = "";
  alertSide.innerText = "";
  hand = [];
  house = [];

  cardPull(hand, handDiv);

  cardPull(house, houseDiv);

  cardPull(hand, handDiv);

  randomHouse = deck[Math.floor(Math.random() * deck.length)];
  let indexHouse = deck.indexOf(randomHouse);
  deck.splice(indexHouse, 1);
  house.push(randomHouse);

  handSide = document.createElement("playing-card");
  handSide.setAttribute("rank", `0`);
  houseDiv.appendChild(handSide);

  sumSide.house.innerText = sumHand(house) - deckValue[randomHouse];
  sumSide.hand.innerText = sumHand(hand);

  if ((sumHand(house) === 21) && (sumHand(house) === sumHand(hand))) {
    alertSide.innerText = "PUSH";
    revealHouse();
    sumSide.house.innerText = sumHand(house);
    gameStartEnd(false, "grey")
  } else {
    if (sumHand(hand) === 21) {
      alertSide.innerText = "Blackjack!";
      revealHouse();
      sumSide.house.innerText = sumHand(house);
      gameStartEnd(false, "grey")
    } else {
      if (sumHand(house) === 21) {
        alertSide.innerText = "Huset vinner";
        revealHouse();
        sumSide.house.innerText = sumHand(house);
        gameStartEnd(false, "grey")
      }
    }
  }
}

play();
