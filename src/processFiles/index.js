/* global Promise */
const get = require('lodash/get')
const path = require('path')
const fs = require('fs-extra')
const i130 = require('./i130')
const g325a = require('./g325a')
const g1145 = require('./g1145')
const i485 = require('./i485')
const normalizeData = require('../normalizeData')

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
      const outputPath = path.resolve(folderPath, `${formName}.pdf`)
      let inputPath = path.resolve(`src/originalPDF/${formName}.pdf`)
      switch (formName) {
        case 'g-325a-petitioner':
          inputPath = path.resolve('src/originalPDF/g-325a.pdf')
          instructions['g-325a'](inputPath, outputPath, get(data, 'petitioner', {}))
            .then(file => res({
              fileName: 'g-325a-petitioner.pdf',
              fileData: file
            }))
          break
        case 'g-325a-relative':
          inputPath = path.resolve('src/originalPDF/g-325a.pdf')
          instructions['g-325a'](inputPath, outputPath, get(data, 'relative', {}))
            .then(file => res({
              fileName: 'g-325a-relative.pdf',
              fileData: file
            }))
          break
        case 'i-485':
          inputPath = path.resolve('src/originalPDF/i-485.pdf')
          instructions['i-485'](inputPath, outputPath, normalizeData['i-485'](data))
            .then(file => res({
              fileName: 'i-485.pdf',
              fileData: file
            }))
          break
        default:
          instructions[formName](inputPath, outputPath, data)
            .then(file => res({
              fileName: `${formName}.pdf`,
              fileData: file
            }))
      }
    })

  })
}

module.exports = processFile
