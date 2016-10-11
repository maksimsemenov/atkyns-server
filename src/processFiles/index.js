/* global Promise */
const fs = require('fs-extra')
const i130 = require('./i130')
const g325a = require('./g325a')
const g1145 = require('./g1145')
const i485 = require('./i485')

const instructions = {
  'i-130': i130,
  'g-325a': g325a,
  'g-1145': g1145,
  'i-485': i485
}

const testData = {
  name: 'Super Mike'
}

const processFile = (formName, folderPath, data = testData) => {
  return new Promise((res, rej) => {
    fs.mkdirs(folderPath, (err) => {
      if (err) {
        rej(err)
      }
      instructions[formName](folderPath, data)
        .then(file => res({
          fileName: `${formName}.pdf`,
          fileData: file
        }))
    })

  })
}

module.exports = processFile
