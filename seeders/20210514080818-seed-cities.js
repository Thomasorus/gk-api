'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Entries', [{
      guid: "https://www.gamekult.com/actualite/final-fantasy-14-endwalker-l-embouteillage-sera-inevitable-previent-square-enix-3050845043.html",
      title: "Final Fantasy 14 Endwalker : l'embouteillage sera inévitable, prévient Square Enix",
      creator: "Jarod",
      link: 'https://www.gamekult.com/actualite/final-fantasy-14-endwalker-l-embouteillage-sera-inevitable-previent-square-enix-3050845043.html',
      pubDate: 'Wed, 01 Dec 2021 15:02:00 +0100',
      description: "Victime de son succès et de la pénurie de semi-conducteurs, Square Enix s'apprête à vivre un lancement contrasté avec la sortie de l'extension Endwalker. D'un côté l'éditeur peut se satisfaire du vif succès que rencontre son MMORPG, mais de l'autre il sait que la congestion des mondes s'annonce inévitable et ne manquera pas de perturber le lancement.",
      image: 'https://d3isma7snj3lcx.cloudfront.net/optim/images/news/30/3050845043/final-fantasy-14-endwalker-l-embouteillage-sera-inevitable-previent-square-enix-546865ff__930_300__0-167-1920-789.jpg',
      content: 'null',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Entries', null, {});
  }
};
