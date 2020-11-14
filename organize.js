const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

const requestedPath = path.resolve(args[0]);

renameFiles(requestedPath, 500);

function renameFiles (targetPath, limit) {
  const fileNames = fs.readdirSync(targetPath);
  if (fileNames) {
    console.log('Starting rename process');
    const number = limit < fileNames.length ? limit : fileNames.length;
    // for (let i = 0; i < 1; i++) {
    for (let i = 0; i < number; i++) {
      // console.log(fileNames[i]);
      if (processImage(fileNames[i], targetPath) === false) {
        continue;
      }
    }
  } else {
    console.log('no files found at', targetPath);
  }
}

async function processImage(origName, currentPath) {
  // If file is a directory, then go into it.
  const fullPath = path.resolve(currentPath, origName);
  if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
    console.log('Going deeper into ' + fullPath);
    return renameFiles(fullPath, 99999);
  }

  if (origName.indexOf('IMG') < 0 && origName.indexOf('PICT') < 0
    && origName.indexOf('DSC') < 0 && origName.indexOf('Photo') < 0
    && origName.indexOf('000') < 0 && origName.indexOf('100') < 0 && origName.indexOf('101') < 0) {
    console.log(origName, 'already renamed');
    return false;
  }

  let extension = origName.substr(origName.lastIndexOf('.'));
  extension = extension.toLowerCase();
  if (extension === '.json') {
    console.log('Skipping JSON file ' + origName);
    return false;
  }

  console.log('Renaming', origName);

  let modified;
  const metaPath = fullPath + '.json';
  if (!fs.existsSync(metaPath)) {
    console.log('Metadata for ' + fullpath + ' does not exist. Skipping file.');
    return false;
  }
  let meta = fs.readFileSync(metaPath, 'utf-8');
  meta = JSON.parse(meta);
  modified = meta.photoTakenTime.formatted;

  const date = new Date(modified);

  if (date.getFullYear() == NaN) {
    console.error(`Invalid date! ${modified}`);
    return false;
  }

  const year2Digit = date.getFullYear().toString().substr(2);

  function force2Digit(number) {
    number = number.toString();
    return number.length < 2 ? '0' + number : number;
  }

  const month = force2Digit(date.getMonth() + 1);
  const day = force2Digit(date.getDate());

  const dateFormatted = year2Digit + '-' + month + '-' + day;

  const hour = force2Digit(date.getHours());
  const minutes = force2Digit(date.getMinutes());
  const seconds = force2Digit(date.getSeconds());
  const timeFormatted = hour + '-' + minutes + '-' + seconds;
  const imageNumberLength = origName.indexOf('Photo') >= 0 ? 8 : 4;
  const imageNumber = origName.substr(-4 - imageNumberLength).substring(0, imageNumberLength);

  const newName = dateFormatted + ' ' + timeFormatted + ' ' + imageNumber + extension;
  const yearTargetPath = path.resolve(requestedPath, date.getFullYear().toString());
  if (!fs.existsSync(yearTargetPath)) {
    fs.mkdirSync(yearTargetPath);
  }

  const targetPath = path.resolve(yearTargetPath, month);
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath);
  }

  fs.rename(fullPath, path.resolve(targetPath, newName), (err) => {
    if (err) return console.log('Could not rename', origName);
    console.log('Renamed', origName, 'to', newName);
  });
}