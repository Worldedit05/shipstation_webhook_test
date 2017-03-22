'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: true,
}));
router.use(bodyParser.text());
router.use(bodyParser.json({
  type: 'application/vnd.api+json',
}));

app.use('/', router);

app.listen(PORT, () => {
  console.log('Server started on port: ' + PORT);
});

router.post('/', (req, res) => {
  let timeStamp = new Date();
  let timeStampUtc = timeStamp.toUTCString().replace(/,/g, '');
  let logStream = fs.createWriteStream('webhook_debug.txt', { flags: 'a' });
  logStream.on('open', () => {
    console.log(timeStampUtc + ' - Write Stream Open');
  });
  logStream.on('close', () => {
    console.log(timeStampUtc + ' - Write Stream Closed');
  });

  //logStream.write('Open Stream\n');
  logStream.write('-'.repeat(30) + 'New Webhook Request' + '-'.repeat(30) + '\n');
  logStream.write('TimeStamp (local): ' + timeStamp + '\nTimeStamp (UTC)  : ' + timeStampUtc);
  logStream.write('\n\n[Headers]\n');

  for (var h in req.headers) {
    logStream.write('\n' + h + '->' + req.headers[h]);
  };

  logStream.write('\n\n[Body]\n');

  for (var b in req.body) {
    logStream.write('\n' + b + '->' + req.body[b]);
  }

  logStream.end('\n\n\n\n');

  res.json();
});

router.get('/webhook', (req, res) => {
  let debugFile = __dirname + '/webhook_debug.txt';
  fs.open(debugFile, 'r', (err, fd) => {
    if (err) {
      console.log('File does not exist');
      res.status(404).send('File not found because no calls have been made to the endpoint');
    }else {
      res.sendFile(debugFile);
    }
  });
});
