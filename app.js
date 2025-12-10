const loginBtn = document.getElementById("loginBtn");
const userSection = document.getElementById("userSection");
const guildsSection = document.getElementById("guildsSection");
const userInfo = document.getElementById("userInfo");
const guildsList = document.getElementById("guildsList");

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

const sessionTokenFromURL = getQueryParam("session");
if (sessionTokenFromURL) {
  localStorage.setItem("tf_session", sessionTokenFromURL);
  window.history.replaceState({}, document.title, window.location.pathname);
}
const SESSION = localStorage.getItem("tf_session");

loginBtn.addEventListener("click", () => {
  window.location.href = `${window.BACKEND_URL}/login`;
});

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: SESSION ? { "Authorization": `Bearer ${SESSION}` } : {}
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

async function init() {
  if (!SESSION) return;
  try {
    const me = await fetchJSON(`${window.BACKEND_URL}/me`);
    userInfo.innerHTML = `
      <p><strong>Nome:</strong> ${me.username}#${me.discriminator}</p>
      <p><strong>ID:</strong> ${me.id}</p>
    `;
    userSection.classList.remove("hidden");

    const guilds = await fetchJSON(`${window.BACKEND_URL}/me/guilds`);
    guildsList.innerHTML = "";
    guilds.forEach(g => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${g.name}</strong> — Owner: ${g.owner}`;
      guildsList.appendChild(li);
    });
    guildsSection.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar dados. Faça login novamente.");
    localStorage.removeItem("tf_session");
  }
}
init();