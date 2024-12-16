const app = require("./app");

// var server = require('http').createServer(app);
// const port = 80;
// server.listen(port, () => console.log(`Listening on port ${port}..`));

const httpsPort = 5432;


app.listen(httpsPort, () => {
  console.log(`crash server is running at port ${httpsPort} as https.`);
});
