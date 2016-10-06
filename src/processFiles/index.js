/* global Promise */
const fs = require('fs-extra')
const i130 = require('./i130')

const instructions = { i130 }

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
