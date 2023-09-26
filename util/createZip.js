const fs = require('fs');
const archiver = require('archiver');

function zipDirectory(sourceDir, sourceFile, targetDir, version) {

  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(`${targetDir}/diagrammaton-${version}.zip`);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, sourceDir.split('/').pop()) 
      .file(sourceFile, { name: 'manifest.json' })
      .on('error', err => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize();
  });
}

const sourceDir = process.argv[2];
const sourceFile = process.argv[3];
const targetDir = process.argv[4];
const version = process.argv[5];

zipDirectory(sourceDir, sourceFile, targetDir, version)
  .then(() => console.log('Directory successfully zipped!'))
  .catch(console.error);