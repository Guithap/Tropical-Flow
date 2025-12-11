const loginBtn = document.getElementById("loginBtn");
const loginSection = document.getElementById("loginSection");
const userSection = document.getElementById("userSection");
const guildsSection = document.getElementById("guildsSection");
const userInfo = document.getElementById("userInfo");
const guildsList = document.getElementById("guildsList");
const appHeader = document.getElementById("appHeader");
const sidebar = document.getElementById("sidebar");
const serverList = document.getElementById("serverList");
const menuToggle = document.getElementById("menuToggle");

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

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    window.location.href = `${window.BACKEND_URL}/login`;
  });
}

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: SESSION ? { "Authorization": `Bearer ${SESSION}` } : {}
  });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

async function init() {
  if (!SESSION) {
    loginSection.classList.remove("hidden");
    appHeader.classList.add("hidden");
    sidebar.classList.add("hidden");
    userSection.classList.add("hidden");
    guildsSection.classList.add("hidden");
    return;
  }

  try {
    loginSection.classList.add("hidden");
    appHeader.classList.remove("hidden");
    sidebar.classList.remove("hidden");
    userSection.classList.remove("hidden");
    guildsSection.classList.remove("hidden");

    const me = await fetchJSON(`${window.BACKEND_URL}/me`);
    userInfo.innerHTML = `
      <p><strong>Nome:</strong> ${me.username}#${me.discriminator}</p>
      <p><strong>ID:</strong> ${me.id}</p>
    `;

    const guilds = await fetchJSON(`${window.BACKEND_URL}/me/guilds`);
    serverList.innerHTML = "";
    guildsList.innerHTML = "";

    guilds.filter(g => g.owner).forEach(g => {
      const iconURL = g.icon
        ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64`
        : "https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/discord.svg";

      const botPresent = g.bot_in_server ? "✅ Bot presente" : "❌ Bot ausente";

      const liSidebar = document.createElement("li");
      liSidebar.innerHTML = `
        <img src="${iconURL}" alt="Ícone">
        <div>
          <strong>${g.name}</strong><br>
          <span class="status">${botPresent}</span>
        </div>
      `;
      serverList.appendChild(liSidebar);

      const liGuild = document.createElement("li");
      liGuild.innerHTML = `<strong>${g.name}</strong> — Owner: ${g.owner}`;
      guildsList.appendChild(liGuild);
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar dados. Faça login novamente.");
    localStorage.removeItem("tf_session");
    loginSection.classList.remove("hidden");
  }
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

init();