const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

function extractZip(zipFolderPath, unzipFolderPath, progressReporter = () => {}) {
  const zipFolderContents = fs.readdirSync(path.resolve(zipFolderPath)).filter((fileName) => {
    return fileName.indexOf('takeout-') === 0 && fileName.indexOf('.zip') === (fileName.length - 4);
  });

  if (zipFolderContents.length < 1) {
    progressReporter({
      error: true,
      message: `No Google Takeout .zip files found in ${zipFolderPath}`,
    });
  }

  const total = zipFolderContents.length;
  let filesUnzipped = 0;

  progressReporter({
    running: true,
    progress: 0,
    files: zipFolderContents,
  });
  const promises = zipFolderContents.map((fileName) => {
    return new Promise((resolve, reject) => {
      try {
        const fileStream = fs.createReadStream(path.resolve(zipFolderPath, fileName))
          .pipe(unzipper.Extract({ path: path.resolve(unzipFolderPath) }));
        fileStream.on('entry', (entry) => {
          console.log(entry.path);
        });
        fileStream.on('finish', () => {
          filesUnzipped++;
          progressReporter({
            running: true,
            progress: filesUnzipped / total,
            fileName,
          });
          resolve();
        });
        fileStream.on('error', (err) => {
          reject({
            error: err,
            fileName,
          });
        });
      } catch (err) {
        reject({
          error: err,
          fileName,
        });
      }
    }).catch(err => {
      console.error(err);
      progressReporter({
        error: err.error,
        message: `Error extracting ${err.filename}`,
      });
    });
  });

  Promise.all(promises).then(() => {
    progressReporter({
      running: false,
      progress: 1,
    });
  });
}

module.exports = extractZip;