/* global Promise */

const fs = require('fs-extra')
const path = require('path')

const saveFile = (filePath, data) =>
  new Promise((res, rej) => {
    fs.mkdirs(path.dirname(filePath), (err) => {
      if (err) {
        rej(err)
      }
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          rej(rej)
        }
        res({ filePath, fileData: data })
      })
    })
  })

module.exports = saveFile
