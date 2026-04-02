const https = require('https');
const fs = require('fs');

const file = 'src/data/players.json';
const players = JSON.parse(fs.readFileSync(file, 'utf8'));

const dataMap = {
  "Marcus Rashford": { wiki: "Marcus_Rashford", team: "Manchester United", nat: "England" },
  "Luka Modric": { wiki: "Luka_Modrić", team: "Real Madrid", nat: "Croatia" },
  "Virgil van Dijk": { wiki: "Virgil_van_Dijk", team: "Liverpool", nat: "Netherlands" },
  "Thibaut Courtois": { wiki: "Thibaut_Courtois", team: "Real Madrid", nat: "Belgium" },
  "Jude Bellingham": { wiki: "Jude_Bellingham", team: "Real Madrid", nat: "England" },
  "Erling Haaland": { wiki: "Erling_Haaland", team: "Manchester City", nat: "Norway" },
  "Pedri González": { wiki: "Pedri", team: "Barcelona", nat: "Spain" },
  "Antonio Rüdiger": { wiki: "Antonio_Rüdiger", team: "Real Madrid", nat: "Germany" },
  "Marc-André ter Stegen": { wiki: "Marc-André_ter_Stegen", team: "Barcelona", nat: "Germany" },
  "Kylian Mbappé": { wiki: "Kylian_Mbappé", team: "Real Madrid", nat: "France" },
  "Gavi Páez": { wiki: "Gavi_(footballer)", team: "Barcelona", nat: "Spain" },
  "William Saliba": { wiki: "William_Saliba", team: "Arsenal", nat: "France" },
  "Alisson Becker": { wiki: "Alisson", team: "Liverpool", nat: "Brazil" },
  "Vinícius Júnior": { wiki: "Vinícius_Júnior", team: "Real Madrid", nat: "Brazil" },
  "Frenkie de Jong": { wiki: "Frenkie_de_Jong", team: "Barcelona", nat: "Netherlands" }
};

async function getWikiImage(wikiName) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(wikiName)}&pithumbsize=300&format=json`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const pages = JSON.parse(data).query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
  for (let p of players) {
    const meta = dataMap[p.name];
    if (meta) {
      p.team = meta.team;
      p.nationality = meta.nat;
      const img = await getWikiImage(meta.wiki);
      if (img) p.imageUrl = img;
    }
  }
  fs.writeFileSync(file, JSON.stringify(players, null, 2));
  console.log("Updated players.json successfully!");
})();
