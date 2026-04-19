const originalDeck = [ 
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

let wager = 0;
let hand = [];
let house = [];
let account = 0;
let user_id;
let currentSessionId = null;
let sessionStarted = false;
let randomHouse;
let handSide;
let change;
let gameActive = false;
const handDiv = document.getElementById("handDiv");
const houseDiv = document.getElementById("houseDiv");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const playButton = document.getElementById("play");
const betButton = {
  10: document.getElementById("10"),
  25: document.getElementById("25"),
  50: document.getElementById("50"),
  100: document.getElementById("100"),
}
const wageSide = document.getElementById("wager")
const accountSide = document.getElementById("account")
const sumSide = {
  house: document.getElementById("houseSum"),
  hand: document.getElementById("handSum"),
};
const alertSide = document.getElementById("alert");
const userConfirm = document.getElementById("userConfirm");


async function fetchBalance(user_id){
  try {
    const res = await fetch(`http://localhost:3000/api/balance/${user_id}`);

    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }

    const data = await res.json();

    account = data.balance;
    updateAccount();

  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

async function startSession() {
  if (!user_id) return null;

  try {
    const res = await fetch("http://localhost:3000/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, start_balance: account })
    });

    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }

    const data = await res.json();
    currentSessionId = data.session_id;
    sessionStarted = true;
    return currentSessionId;
  } catch (err) {
    console.error("Session start failed:", err);
    return null;
  }
}

async function logGame(bet, result, amount_change) {
  if (!currentSessionId) return;

  try {
    const res = await fetch("http://localhost:3000/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: currentSessionId,
        bet,
        result,
        amount_change
      })
    });

    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }

    return await res.json();
    const data = await res.json();
  } catch (err) {
    console.error("Log game failed:", err);
  }
}

async function endSession(end_balance) {
  if (!currentSessionId) return;

  try {
    const res = await fetch("http://localhost:3000/api/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: currentSessionId, end_balance })
    });

    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }

    await res.json();
    currentSessionId = null;
    sessionStarted = false;
  } catch (err) {
    console.error("End session failed:", err);
  }
}

hitButton.addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  hit();
});

standButton.addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  stand();
});

playButton.addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  play();
});

userConfirm.addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  console.log(document.getElementById("users").value)
  selectUser();
  updateAccount();
});


gameStartEnd(false, "grey");
updateAccount();

for (let n = 1; n <= 2; n++) {
    placeholderCards(houseDiv);
    placeholderCards(handDiv);
}

function selectUser() {
  const select = document.getElementById("users");
  user_id = select.value;
  fetchBalance(user_id);
  document.getElementById("currentUser").innerText = ("Current user: " + user_id)
  localStorage.setItem("user_id", user_id);
}

async function updateBalance(change) {
  try {
    const res = await fetch("http://localhost:3000/api/update_balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user_id,
        change
      })
    });

    if (!res.ok) {
      console.error("Server error:", res.status);
      return;
    }

    return await res.json();

  } catch (err) {
    console.error("Fetch crashed:", err);
  }
}
  
function placeholderCards(positionDiv) {
  let handSide = document.createElement("playing-card");
  handSide.setAttribute("rank", `0`);
  positionDiv.appendChild(handSide);
}

function updateAccount(){
  wageSide.innerText = "innsats: $" + wager;
  accountSide.innerText = "konto: $" + account;
}

function betting(bet) {
  if (account<bet) {
  alert("Du har ikke nok penger >:(");
  } else if (gameActive){
    alert("Du kan ikke vedde mens spillet er aktivt >:(")
  } else {
    account-=bet;
    wager+=bet;
    console.log(wager);
    updateAccount();
  }
}

betButton[10].addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  betting(10);
});

betButton[25].addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  betting(25);
});

betButton[50].addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  betting(50);
});

betButton[100].addEventListener("click", (event) => {
  event.preventDefault();  // Stopper form-submit og reload
  betting(100);
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
  if (handSide && houseDiv.contains(handSide)) {
    houseDiv.removeChild(handSide);
  }

  if (!randomHouse) return;

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

async function hit() {
  if (!gameActive) return;

  cardPull(hand, handDiv);

  if (sumHand(hand) > 21) {
    alertSide.innerText = "Bust";
    change=-wager;
    await updateBalance(change);
    await logGame(wager, "lose", change);
    wager=0;
    updateAccount();
    gameStartEnd(false, "grey");
    revealHouse();
    sumSide.house.innerText = sumHand(house);
  }

  sumSide.hand.innerText = sumHand(hand);
}

async function stand() {
  if (!gameActive) return;

  revealHouse();

  while (sumHand(house) < 17) {
    cardPull(house, houseDiv);
  }

  sumSide.house.innerText = sumHand(house);

  let outcome = "lose";
  let amountChange = 0;

  if (sumHand(house) > 21 && sumHand(hand)<=21) {
    alertSide.innerText = "Du Vant!";
    account+=(wager*2)
    change=wager
    amountChange = change;
    outcome = "win";
    await updateBalance(change); 
  } else if (sumHand(house)===sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21) {
    alertSide.innerText = "PUSH"
    account+=wager
    outcome = "push";
    amountChange = 0;
  } else if (sumHand(house)>sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
    alertSide.innerText = "Huset vinner"
    change=-wager
    amountChange = change;
    outcome = "lose";
    await updateBalance(change);
  } else if (sumHand(house)<sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
    alertSide.innerText = "Du Vant!"
    change=wager
    amountChange = change;
    outcome = "win";
    await updateBalance(change); 
    account+=(wager*2)
  }

  await logGame(wager, outcome, amountChange);
  gameStartEnd(false, "grey")
  wager = 0;
  updateAccount();
}

function gameStartEnd(boolean, color){
  gameActive = boolean;
  hitButton.style.backgroundColor = `${color}`
  standButton.style.backgroundColor = `${color}`
}

async function play(){
  if (!user_id) {
    alert("Velg bruker før du starter et spill.");
    return;
  }

  if (!sessionStarted) {
    await startSession();
  }

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
    account+=wager;
    await logGame(wager, "push", 0);
    wager=0;
    updateAccount();
    revealHouse();
    sumSide.house.innerText = sumHand(house);
    gameStartEnd(false, "grey");
  } else {
    if (sumHand(hand) === 21) {
      alertSide.innerText = "Blackjack!";
      account+=(wager*2.5);
      change=(wager*1.5)
      await updateBalance(change);
      await logGame(wager, "blackjack", change);
      wager=0;
      updateAccount();
      revealHouse();
      sumSide.house.innerText = sumHand(house);
      gameStartEnd(false, "grey");
    } else {
      if (sumHand(house) === 21) {
        alertSide.innerText = "Huset vinner";
        change=-wager
        await updateBalance(change);
        await logGame(wager, "lose", change);
        wager=0;
        updateAccount();
        revealHouse();
        sumSide.house.innerText = sumHand(house);
        gameStartEnd(false, "grey");
      }
    }
  }
}