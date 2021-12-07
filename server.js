'use strict'

const server = require('./gkapi')({
  logger: {
    level: 'info',
    prettyPrint: true
  }
});

server.listen(3000, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});
