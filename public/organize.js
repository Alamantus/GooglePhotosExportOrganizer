const fs = require('fs');
const path = require('path');
const { utimes } = require('utimes');
const piexif = require('piexifjs');

function organize(currentPath, organizeIntoPath, renameStrategy = 'KEEP', insertExif, progressReporter = () => {}) {
  // Figure out a better way to do this... I know there's a better way, I just can't think of it right now.
  let totalFiles  = 0;
  let processedFiles = 0;
  let erroredFiles = [];
  let reports = 0;
  const promises = organizeFolder(currentPath, organizeIntoPath, renameStrategy, insertExif, (report) => {
    reports++;
    if (report.addFileToProcess) {
      totalFiles++;
    }
    if (report.removeFileToProcess) {
      totalFiles--;
    }
    if (report.addFileProcessed) {
      processedFiles++;
    }
    if (report.error) {
      progressReporter(report);
      if (report.errored) {
        erroredFiles.push(report.errored);
      }
    }
    if (reports % 100 === 0) {    // Send report every 100 reports
      const reportToSend = {
        running: true,
        // totalFiles,
        // processedFiles,
        progress: processedFiles / totalFiles,
        errored: erroredFiles,
      };
      // console.log('sending', reportToSend);
      progressReporter(reportToSend);
    }
  });

  Promise.all(promises).then(() => {
    progressReporter({
      running: false,
      progress: 1,
      errored: erroredFiles,
    });
  });
  
}

function organizeFolder(currentPath, organizeIntoPath, renameStrategy = 'KEEP', insertExif, progressReporter = () => {}) {
  const fileNames = fs.readdirSync(currentPath)
    .filter((fileName) => fileName.substr(fileName.lastIndexOf('.')) !== '.json');
  
  if (fileNames.length < 1) {
    progressReporter({
      error: true,
      message: `No media files found in ${currentPath}`,
    });
  }
  
  return fileNames.map((origName, index) => {
    // If file is a directory, then go into it.
    const fullPath = path.resolve(currentPath, origName);
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
      // console.log('Going deeper into ' + fullPath);
      return organizeFolder(fullPath, organizeIntoPath, renameStrategy, insertExif, progressReporter);
    }
    return new Promise((resolve, reject) => {
      try {
        progressReporter({
          addFileToProcess: true,
        });

        let extension = origName.substr(origName.lastIndexOf('.')).toLowerCase();

        let photoTakenTime;
        const metaPath = fullPath + '.json';
        if (!fs.existsSync(metaPath)) {
          // console.log('Metadata for ' + fullPath + ' does not exist. Skipping file.');
          return reject({
            removeFileToProcess: true,
          });
        }
        let meta = fs.readFileSync(metaPath, 'utf-8');
        meta = JSON.parse(meta);
        if (typeof meta.photoTakenTime === 'undefined') {
          return reject({
            removeFileToProcess: true,
          });
        }
        photoTakenTime = meta.photoTakenTime.formatted;

        const date = new Date(photoTakenTime);

        if (isNaN(date.getFullYear())) {
          // console.error(`Invalid date! ${photoTakenTime}`);
          return false;
        }

        const year = date.getFullYear().toString();

        const month = force2Digit(date.getMonth() + 1);
        
        let newName = origName;
        if (renameStrategy === 'DATE') {
          newName = formatDateTime(date) + ' ' + (index + 1).toString().padStart(4, '0') + extension;
        }
        const yearTargetPath = path.resolve(organizeIntoPath, year);
        if (!fs.existsSync(yearTargetPath)) {
          fs.mkdirSync(yearTargetPath);
        }

        const targetPath = path.resolve(yearTargetPath, month);
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath);
        }

        const newFileName = path.resolve(targetPath, newName);
        fs.rename(fullPath, newFileName, (err) => {
          if (err) {
            return reject({
              error: true,
              errored: fullPath,
            });
          } else {
            // Insert dates (Linux cannot update created, only modified and accessed times)
            utimes(newFileName, {
              btime: date.getTime(),
              atime: Date.now(),
              mtime: typeof meta.modificationTime !== 'undefined'
                ? new Date(meta.modificationTime.formatted).getTime()
                : date.getTime(),
            }).then(() => {
              if (typeof meta.geoData !== 'undefined' && ['.jpg', '.jpeg'].includes(extension) && insertExif) {
                // If GPS is available and desired, insert GPS into image.
                const fileData = fs.readFileSync(newFileName, { encoding: 'binary' });
                const exifData = piexif.load(fileData);
  
                const formattedDate = formatDateTime(date).replace('-', ':');
                const timeSplit = formattedDate.split(' ')[1].split(':');
                
                exifData['0th'][piexif.ImageIFD.DateTime] = formattedDate;
                if (meta.description) {
                  exifData['0th'][piexif.ImageIFD.ImageDescription] = meta.description;
                }
                
                exifData.Exif[piexif.ExifIFD.ExifVersion] = '0230';
                exifData.Exif[piexif.ExifIFD.DateTimeOriginal] = formattedDate;
  
                if (typeof meta.geoData !== 'undefined') {
                  const lat = meta.geoData.latitude;
                  const lng = meta.geoData.longitude;
                  const alt = meta.geoData.altitude;
                  if (lat) {
                    exifData.GPS[piexif.GPSIFD.GPSVersionID] = [2, 3, 0, 0];
                    exifData.GPS[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
                    exifData.GPS[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
                  }
                  if (lng) {
                    exifData.GPS[piexif.GPSIFD.GPSLongitudeRef] = lng < 0 ? 'W' : 'E';
                    exifData.GPS[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lng);
                  }
                  if (alt) {
                    const altRatio = approxRatio(0.0001)(Math.abs(alt));
                    exifData.GPS[piexif.GPSIFD.GPSAltitudeRef] = alt < 0 ? 1 : 0; // If altitude is below 0, set to 1 which means "below sea level"
                    exifData.GPS[piexif.GPSIFD.GPSAltitude] = [altRatio.numerator, altRatio.denominator];
                  }
                  if (lat || lng || alt) {
                    exifData.GPS[piexif.GPSIFD.GPSTimeStamp] = [[timeSplit[0], 1], [timeSplit[1], 1], [timeSplit[2] * 100, 100]];
                    exifData.GPS[piexif.GPSIFD.GPSDateStamp] = formattedDate;
                  }
                }
  
                const exifbytes = piexif.dump(exifData);
  
                const newData = piexif.insert(exifbytes, fileData);
                fs.writeFile(newFileName, newData, { encoding: 'binary' }, (err) => {
                  if (err) {
                    return reject({
                      error: true,
                      errored: fullPath,
                    });
                  } else {
                    progressReporter({
                      addFileProcessed: true,
                    })
                    // console.log('moved ' + fullPath + ' to ' + path.resolve(targetPath, newName));
                    resolve();
                  }
                });
              } else {
                progressReporter({
                  addFileProcessed: true,
                })
                // console.log('moved ' + fullPath + ' to ' + path.resolve(targetPath, newName));
                resolve();
              }
            }).catch((err) => {
              reject({
                error: true,
                message: err,
              });
            });
          }
        });
      } catch (err) {
        reject({
          error: true,
          message: err,
        });
      }
    }).catch((rejected) => {
      console.error(rejected);
      progressReporter(rejected);
    });
  });
}

function formatDateTime(date) {
  const year = date.getFullYear();

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const day = date.getDate().toString().padStart(2, '0');
  const dateFormatted = year + '-' + month + '-' + day;

  const hour = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const timeFormatted = hour + '-' + minutes + '-' + seconds;

  return dateFormatted + ' ' + timeFormatted;
}

function force2Digit(number) {
  number = number.toString();
  return number.length < 2 ? '0' + number : number;
}

function approxRatio(eps) {
  // Adapted from https://rosettacode.org/wiki/Convert_decimal_number_to_rational#JavaScript
  return function(n) {
    const gcde = (e, x, y) => {
      const _gcd = (a, b) => (b < e ? a : _gcd(b, a % b));
      return _gcd(Math.abs(x), Math.abs(y));
    },
      c = gcde(Boolean(eps) ? eps : (1 / 10000), 1, n);
    return {
      numerator: Math.floor(n / c), // numerator
      denominator: Math.floor(1 / c) // denominator
    };
  }
}

module.exports = organize;
