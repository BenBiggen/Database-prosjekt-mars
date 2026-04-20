//definerer konstanter for forskjellige IDer i html filen
const usernameInfo = document.getElementById("usernameInfo");
const gameswonInfo = document.getElementById("gameswonInfo");
const gameslostInfo = document.getElementById("gameslostInfo");
const updateInfo = document.getElementById("updateInfo");
let user_id = localStorage.getItem('user_id'); //Definerer user id som IDen i localstorage i nettleseren

//henter brukernavn, total vunnet eller total tapt fra databasen basert på hva du setter parameterene i funksjonen som
async function fetchVariable(user_id, variable){
  try {
    const res = await fetch(`http://localhost:3000/api/${variable}/${user_id}`);

    if (!res.ok) {
      throw new Error("API error: " + res.status);
    }

    const data = await res.json();

    return data[variable];  // Returner verdien basert på variable-parameteren

  } catch (err) {
    console.error("Fetch failed:", err);
    return null;
  }
}

//oppdaterer infoen som blir vist på siden
async function updateAccountInfo(){
  if (!user_id) {
    usernameInfo.innerText = "Ingen bruker valgt";
  } else {
    const username = await fetchVariable(user_id, "username");
    const total_won = await fetchVariable(user_id, "total_won");
    const total_lost = await fetchVariable(user_id, "total_lost");
    if (username) {
      usernameInfo.innerText = "Brukernavn: " + username;
      gameswonInfo.innerText = "Total vunnet: $" + total_won;
      gameslostInfo.innerText = "Total tapt: $" + total_lost;
    } else {
      usernameInfo.innerText = "Kunne ikke hente brukernavn";
      gameswonInfo.innerText = "Ingen info";
      gameslostInfo.innerText = "Ingen info";
    }
  }
}

//eventlistener for knappen som oppdaterer infoen på siden
updateInfo.addEventListener("click", (event) => {
  updateAccountInfo();
});