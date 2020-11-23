const fs = require('fs');
const path = require('path');

function organize(currentPath, organizeIntoPath, renameStrategy = 'KEEP', progressReporter = () => {}) {
  // Figure out a better way to do this... I know there's a better way, I just can't think of it right now.
  let totalFiles  = 0;
  let processedFiles = 0;
  let filesErrored = [];
  const promises = organizeFolder(currentPath, organizeIntoPath, renameStrategy, (report) => {
    if (report.addFileToProcess) {
      totalFiles++;
    }
    if (report.removeFileToProcess) {
      totalFiles--;
    }
    if (report.addFileProcessed) {
      processedFiles++;
    }
    if (report.error && report.errored) {
      filesErrored.push(report.errored);
    }
    const reportToSend = {
      running: true,
      progress: processedFiles / totalFiles,
      errored: filesErrored,
    };
    console.log(reportToSend);
    progressReporter(reportToSend);
  });

  Promise.all(promises).then(() => {
    progressReporter({
      running: false,
      progress: 1,
    })
  })
}

function organizeFolder(currentPath, organizeIntoPath, renameStrategy = 'KEEP', progressReporter = () => {}) {
  const fileNames = fs.readdirSync(currentPath)
    .filter((fileName) => fileName.substr(fileName.lastIndexOf('.')) !== '.json');
  
  if (fileNames.length < 1) {
    progressReporter({
      error: true,
      message: `No media files found in ${currentPath}`,
    });
  }
  
  return fileNames.map((origName, index) => {
    return new Promise((resolve, reject) => {
      try {
        // If file is a directory, then go into it.
        const fullPath = path.resolve(currentPath, origName);
        if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
          // console.log('Going deeper into ' + fullPath);
          return resolve(organizeFolder(fullPath, organizeIntoPath, renameStrategy, progressReporter));
        }
        progressReporter({
          addFileToProcess: true,
        });

        let extension = origName.substr(origName.lastIndexOf('.')).toLowerCase();

        let modified;
        const metaPath = fullPath + '.json';
        if (!fs.existsSync(metaPath)) {
          // console.log('Metadata for ' + fullPath + ' does not exist. Skipping file.');
          reject({
            removeFileToProcess: true,
          });
        }
        let meta = fs.readFileSync(metaPath, 'utf-8');
        meta = JSON.parse(meta);
        modified = meta.photoTakenTime.formatted;

        const date = new Date(modified);

        if (isNaN(date.getFullYear())) {
          // console.error(`Invalid date! ${modified}`);
          return false;
        }

        const year = date.getFullYear().toString();

        const month = force2Digit(date.getMonth() + 1);
        
        let newName = origName;
        if (renameStrategy === 'DATE') {
          const imageNumberLength = origName.indexOf('Photo') >= 0 ? 8 : 4;
          const imageNumber = origName.substr(-4 - imageNumberLength).substring(0, imageNumberLength);

          newName = formatDateTime(date) + ' ' + imageNumber + extension;
        }
        const yearTargetPath = path.resolve(organizeIntoPath, year);
        if (!fs.existsSync(yearTargetPath)) {
          fs.mkdirSync(yearTargetPath);
        }

        const targetPath = path.resolve(yearTargetPath, month);
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath);
        }

        fs.rename(fullPath, path.resolve(targetPath, newName), (err) => {
          if (err) {
            reject({
              error: true,
              errored: fullPath,
            });
          } else {
            progressReporter({
              addFileProcessed: true,
            })
            console.log('moved ' + fullPath + ' to ' + path.resolve(targetPath, newName));
            resolve();
          }
        });
      } catch (err) {
        reject({
          error: true,
          message: err
        });
      }
    }).catch((rejected) => {
      console.log(rejected);
      progressReporter(rejected);
    });
  });
}

function formatDateTime(date) {
  const year = date.getFullYear();

  const month = force2Digit(date.getMonth() + 1);
  
  const day = force2Digit(date.getDate());
  const dateFormatted = year + '-' + month + '-' + day;

  const hour = force2Digit(date.getHours());
  const minutes = force2Digit(date.getMinutes());
  const seconds = force2Digit(date.getSeconds());
  const timeFormatted = hour + '-' + minutes + '-' + seconds;

  return dateFormatted + ' ' + timeFormatted;
}

function force2Digit(number) {
  number = number.toString();
  return number.length < 2 ? '0' + number : number;
}

module.exports = organize;