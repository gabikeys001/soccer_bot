const TelegramBot = require("node-telegram-bot-api");
const puppeteer = require("puppeteer");

const bot = new TelegramBot("6139652276:AAHk8k9T48au_qalk8_YjrEIkF5yAtXwAmo", {
  polling: false,
});

async function verificarJogos() {
  const navegador = await puppeteer.launch();
  const pagina = await navegador.newPage();
  await pagina.goto("https://www.sofascore.com/football/live-games");

  const jogos = await pagina.evaluate(() => {
    const linhasDeJogos = document.querySelectorAll(
      ".sfs-games-section > .sfs-games > .sfs-games-wrapper > .sfs-games-row"
    );

    return Array.from(linhasDeJogos).map((linhaDeJogo) => {
      const tituloDoJogo = linhaDeJogo
        .querySelector(".sfs-games-row__title > a")
        .textContent.trim();
      const urlDoJogo = linhaDeJogo.querySelector(
        ".sfs-games-row__title > a"
      ).href;
      const detalhesDoJogo = linhaDeJogo
        .querySelector(
          ".sfs-games-row_details > div.sfs-games-row_detail-value"
        )
        .textContent.trim();
      const statusDoJogo = linhaDeJogo
        .querySelector(".sfs-games-row__status")
        .textContent.trim();

      return {
        titulo: tituloDoJogo,
        url: urlDoJogo,
        detalhes: detalhesDoJogo,
        status: statusDoJogo,
      };
    });
  });

  for (const jogo of jogos) {
    if (
      jogo.detalhes.includes("Over 1.5 goals") &&
      parseFloat(jogo.detalhes.split(" ")[2]) <= 1.31 &&
      jogo.detalhes.includes("Match odds") &&
      parseFloat(jogo.detalhes.split(" ")[5].replace(/[$,]/g, "")) >= 5000 &&
      jogo.status.startsWith("0") &&
      jogo.detalhes.includes("Total shots") &&
      parseInt(jogo.detalhes.split(" ")[8]) >= 5 &&
      jogo.detalhes.includes("Dangerous attacks") &&
      parseInt(jogo.detalhes.split(" ")[11]) >= 15 &&
      jogo.detalhes.includes("Shots on target") &&
      parseInt(jogo.detalhes.split(" ")[14]) >= 2 &&
      jogo.detalhes.includes("Shots inside the box") &&
      parseInt(jogo.detalhes.split(" ")[17]) >= 1 &&
      jogo.detalhes.includes("xG (expected goals)") &&
      parseFloat(jogo.detalhes.split(" ")[21]) >= 2
    ) {
      console.log(`Jogo encontrado: ${jogo.titulo}`);
      bot.sendMessage(
        "937820810",
        `Jogo encontrado: ${jogo.titulo}\nTempo: ${jogo.status}\nPlacar: ${
          jogo.detalhes.split(" - ")[0]
        } - ${jogo.detalhes.split(" - ")[1]}\nLink: ${jogo.url}`
      );
    }
  }

  await navegador.close();
}

console.log("Scanner procurando...");

setInterval(verificarJogos, 60000);
