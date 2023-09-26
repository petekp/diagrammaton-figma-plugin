const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'debug.ts');

const debugEnabled = process.argv[2] === 'true';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
  } else {
    const newDebugSettings = data.replace(/(enabled: )\w+/, `$1${debugEnabled}`);

    fs.writeFile(filePath, newDebugSettings, (err) => {
      if (err) {
        console.error(`Error writing file to disk: ${err}`);
      }
      console.info(`Debugging ${debugEnabled ? 'enabled' : 'disabled'}.`)
    });
  }
});