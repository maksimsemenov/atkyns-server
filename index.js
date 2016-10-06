/* global Promise */
const express = require('express')
const path = require('path')
const fs = require('fs-extra')
const saveFile = require('./src/utils/saveFile')
const zipFiles = require('./src/zip')
const uniqueKey = require('./src/utils/uniqueKey')
const processFile = require('./src/processFiles')

const app = new express()

const defaultForms = ['i130']

app.get('/', (req, res) => {
  const folderPath = path.resolve(`temp/${uniqueKey()}`)
  const { forms = defaultForms, data = {} } = req.body || {}
  Promise.all(forms.map(formName => processFile(formName, folderPath, data)))
    .then(files => zipFiles(files))
    .then(archive => saveFile(path.resolve(folderPath, 'download.zip'), archive))
    .then(data => res.download(data.filePath, (err) => {
      if (err) {
        console.log(err)  // eslint-disable-line no-console
        res.status(err.status).end()
      }
      fs.remove(folderPath, (err) => {
        if (err) {
          console.log(err) // eslint-disable-line no-console
        }
      })
    }))
    .catch(err => console.log(err))  // eslint-disable-line no-console
})

app.listen(5000, () => {
  console.log('Listening port 5000...')  // eslint-disable-line no-console
})
