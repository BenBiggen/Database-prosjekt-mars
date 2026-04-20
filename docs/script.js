//definerer dekkene og verdiene av de forskjellige kortene
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

//definerer alle variabler og konstanter
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
let outcome;
let resultTotal = 0;
let resultValue;
const handDiv = document.getElementById("handDiv"); //definerer konstanter for elementer i html som jeg henter ut med id
const houseDiv = document.getElementById("houseDiv");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const playButton = document.getElementById("play");
const betButton = {
  10: document.getElementById("10"),
  25: document.getElementById("25"),
  50: document.getElementById("50"),
  100: document.getElementById("100"),
};
const endSessionButton = document.getElementById("endSessionButton");
const wageSide = document.getElementById("wager");
const accountSide = document.getElementById("account");
const sumSide = {
  house: document.getElementById("houseSum"),
  hand: document.getElementById("handSum"),
};
const alertSide = document.getElementById("alert");
const userConfirm = document.getElementById("userConfirm");

async function fetchBalance(user_id){ //henter pengeverdien fra kontoen til valgt bruker
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

async function startSession() { //starter en session og begynner tracking av games under den session
  if (!user_id) return null;

  try {
    const res = await fetch("http://localhost:3000/api/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, start_balance: account + wager })
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

async function logGame(bet, result, amount_change) { //logger runden av blackjack, med hvor mye som var veddet, resultatet og endring i penger
  if (!sessionStarted || !currentSessionId) {
    console.warn("Ingen aktive");
    return;
  }

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

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Log game failed:", err);
  }
}

async function endSession(end_balance) { //Ender session når funksjonen blir kallt
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

async function endSessionNow(){ //funksjon som kjører funksjonen for å ende session og reloader siden, i egen funksjon sånn at jeg kan ha await på endSession()
  await endSession(account);
  location.reload();
}


function totalWinLoss(){ //regner ut om du har vunnet eller tapt og tar absolutt verdien av endring i penger for å logge total vunnet og total tapt
  if (change>0) {
    resultTotal = Math.abs(change);
    resultValue = "total_won";
  } else if (change<=0) {
    resultTotal = Math.abs(change);
    resultValue = "total_lost";
  } 
}

async function updateTotalResult(change, result) {//Oppdaterer hvor mye en bruker har vunnet/tapt totalt i databasen
  try {
    const res = await fetch(`http://localhost:3000/api/${result}`, {
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

//listenerevents for alle knappene i html filen som har en funksjon når de trykkes
hitButton.addEventListener("click", (event) => {
  hit();
});

standButton.addEventListener("click", (event) => {
  stand();
});

playButton.addEventListener("click", (event) => {
  play();
});

userConfirm.addEventListener("click", (event) => {
  selectUser();
  updateAccount();
});

endSessionButton.addEventListener("click", (event) => {
  endSessionNow();
});

//gjør at kortene er snudd når siden først lastes inn
gameStartEnd(false, "grey");
updateAccount();

for (let n = 1; n <= 2; n++) {
    placeholderCards(houseDiv);
    placeholderCards(handDiv);
}

function selectUser() {//funksjonen som confirmer hva user man velger etter man har valgt fra dropdown menyen
  const select = document.getElementById("users");
  user_id = select.value;
  fetchBalance(user_id);
  document.getElementById("currentUser").innerText = ("Current user: " + user_id)
  localStorage.setItem("user_id", user_id);
  wager=0;
}

async function updateBalance(change) {//oppdaterer pengekontoen i databasen til å matche pengekontoen fra frontend
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
  
function placeholderCards(positionDiv) {//trekker tomme kort for å ha som placeholder før første runde startes
  let handSide = document.createElement("playing-card");
  handSide.setAttribute("rank", `0`);
  positionDiv.appendChild(handSide);
}

function updateAccount(){//Oppdaterer visningen av innsats og konto på siden
  wageSide.innerText = "innsats: $" + wager;
  accountSide.innerText = "konto: $" + account;
}

function betting(bet) { //Vedder en viss sum penger og trekker fra kontoen og legger til wager
  if (account<bet) {
  alert("Du har ikke nok penger >:(");
  } else if (gameActive){
    alert("Du kan ikke vedde mens spillet er aktivt >:(");
  } else {
    account-=bet;
    wager+=bet;
    updateAccount();
  }
}

//listenerevents for knappene til betting
betButton[10].addEventListener("click", (event) => {
  betting(10);
});

betButton[25].addEventListener("click", (event) => {
  betting(25);
});

betButton[50].addEventListener("click", (event) => {
  betting(50);
});

betButton[100].addEventListener("click", (event) => {
  betting(100);
});

function cardPull(position, positionDiv) {//trekker et tilfeldig kort fra kortstokken og fjerner kortet fra kortstokken etter det er blitt trukket, så bruker funksjonen createelement og appenchild for å vise kortet på siden
  let randomHand = deck[Math.floor(Math.random() * deck.length)];
  let indexHand = deck.indexOf(randomHand);
  deck.splice(indexHand, 1);
  position.push(randomHand);

  let handSide = document.createElement("playing-card");
  handSide.setAttribute("cid", `${randomHand}`);
  positionDiv.appendChild(handSide);
}

function revealHouse() {//Snur det skjulte kortet fra hånden til huset 
  if (handSide && houseDiv.contains(handSide)) {
    houseDiv.removeChild(handSide); //fjerner det snudde kortet fra dom, men verdien til kortet er lagret i en variabel
  }

  if (!randomHouse) return;

  let houseSide = document.createElement("playing-card");
  houseSide.setAttribute("cid", `${randomHouse}`);
  houseDiv.appendChild(houseSide); //appender kortet fra verdien som var trukket tidligere
}

function sumHand(hand) { //regner ut summen av hånden
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

async function hit() {//Gjør at du trekker et til kort til hånden din
  if (!gameActive) return; //sørger for at spillet er aktivt

  cardPull(hand, handDiv);

  if (sumHand(hand) > 21) { //hvis verdien av hånden er mer enn 21 så går du bust og taper, så oppdateres nødvendige variabler
    alertSide.innerText = "Bust";
    change=-wager;
    await updateBalance(change);
    await logGame(wager, "lose", change);
    totalWinLoss();
    await updateTotalResult(resultTotal, resultValue);
    wager=0;
    updateAccount();
    gameStartEnd(false, "grey");
    revealHouse();
    sumSide.house.innerText = sumHand(house);
  }

  sumSide.hand.innerText = sumHand(hand);
}

async function stand() {//Gjør at du står, altså at du er ferdig å trekke kort 
  if (!gameActive) return; //sørger for at spillet er aktivt

  revealHouse(); 

  while (sumHand(house) < 17) { //så lenge huset er under 17 så trekker den et nytt kort
    cardPull(house, houseDiv);
  }

  sumSide.house.innerText = sumHand(house);

  if (sumHand(house) > 21 && sumHand(hand)<=21) {//om huset overstiger 21 etter at du står så vinner du
    alertSide.innerText = "Du Vant!";
    account+=(wager*2);
    change=wager;
    outcome = "win";
    await updateBalance(change); 
    //Så sjekker elseif løkken her om huset er mer, mindre eller likt hånden din og endrer resultatet basert på det
    } else if (sumHand(house)===sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21) {
      alertSide.innerText = "PUSH" 
      account+=wager;
      outcome = "push";
      change=0;
      } else if (sumHand(house)>sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
        alertSide.innerText = "Huset vinner";
        change=-wager;
        outcome = "lose";
        await updateBalance(change);
        } else if (sumHand(house)<sumHand(hand) && sumHand(house)<=21 && sumHand(hand)<=21){
          alertSide.innerText = "Du Vant!";
          change=wager;
          outcome = "win";
          await updateBalance(change); 
          account+=(wager*2);
        }

  //nødvendige funksjonskallinger for å oppdatere resultatene
  await logGame(wager, outcome, change);
  totalWinLoss();
  await updateTotalResult(resultTotal, resultValue);
  gameStartEnd(false, "grey");
  wager = 0;
  updateAccount();
}

function gameStartEnd(boolean, color){ //Starte eller ende en runde, endrer også fargen på knappene som ikke fungerer når spillet ikke er aktivt til grått
  gameActive = boolean;
  hitButton.style.backgroundColor = `${color}`;
  standButton.style.backgroundColor = `${color}`;
}

async function play(){//funksjonen for å starte en runde
  if (!user_id) {//sørger for at en bruker er valgt
    alert("Velg bruker før du starter et spill.");
    return;
  }

  if (!sessionStarted) {//hvis en session ikke er startet allerede så blir det startet en session
    await startSession();
  }

  gameStartEnd(true, "whitesmoke");
  deck=[...originalDeck];//bytter dekket til original deck (dekket går tilbake til alle 52 kort)

  //dom resettes
  handDiv.innerHTML = "";
  houseDiv.innerHTML = "";
  alertSide.innerText = "";
  hand = [];
  house = [];

  //Første to kortene til hånden blir trukket og huset får trukket et kort
  cardPull(hand, handDiv);

  cardPull(house, houseDiv);

  cardPull(hand, handDiv);

  //trekker et kortverdi for det andre kortet til huset men viser et tomt kort sånn at det ikke vises før revealHouse() blir kallt
  randomHouse = deck[Math.floor(Math.random() * deck.length)];
  let indexHouse = deck.indexOf(randomHouse);
  deck.splice(indexHouse, 1);
  house.push(randomHouse);

  handSide = document.createElement("playing-card");
  handSide.setAttribute("rank", `0`);
  houseDiv.appendChild(handSide);

  //gjør at summen som vises er bare kortet som er vist og oppdaterer summen som vises ved siden av kortene på siden
  sumSide.house.innerText = sumHand(house) - deckValue[randomHouse];
  sumSide.hand.innerText = sumHand(hand);

  //Sjekker om spilleren eller huset har blackjack, altså om man starter med 21, oppdaterer resultater basert på hva som skjedde
  if ((sumHand(house) === 21) && (sumHand(house) === sumHand(hand))) {
    alertSide.innerText = "PUSH";
    account+=wager;
    await logGame(wager, "push", 0);
    totalWinLoss();
    await updateTotalResult(resultTotal, resultValue);
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
      totalWinLoss();
      await updateTotalResult(resultTotal, resultValue);
      wager=0;
      updateAccount();
      revealHouse();
      sumSide.house.innerText = sumHand(house);
      gameStartEnd(false, "grey");
    } else {
      if (sumHand(house) === 21) {
        alertSide.innerText = "Huset vinner";
        change=-wager;
        await updateBalance(change);
        await logGame(wager, "lose", change);
        totalWinLoss();
        await updateTotalResult(resultTotal, resultValue);
        wager=0;
        updateAccount();
        revealHouse();
        sumSide.house.innerText = sumHand(house);
        gameStartEnd(false, "grey");
      }
    }
  }
}