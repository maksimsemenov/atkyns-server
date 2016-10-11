/* global Promise */
const express = require('express')
const path = require('path')
const fs = require('fs-extra')
const bodyParser = require('body-parser')
const saveFile = require('./src/utils/saveFile')
const zipFiles = require('./src/zip')
const uniqueKey = require('./src/utils/uniqueKey')
const processFile = require('./src/processFiles')

const app = new express()

const defaultForms = ['i-130']

app.use(bodyParser.text())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})
app.post('/i-130', (req, res) => {
  const folderPath = path.resolve(`temp/${uniqueKey()}`)
  const resData = JSON.parse(req.body)
  console.log('recieve request: /i-130')
  processFile('i-130', folderPath, resData)
  .then(({ fileName }) => res.download(path.resolve(folderPath, fileName), (err) => {
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
  .catch(err => console.log(err))
})
app.post('/', (req, res) => {
  const folderPath = path.resolve(`temp/${uniqueKey()}`)
  const resData = JSON.parse(req.body)
  console.log('recieve request')
  const { forms = defaultForms, data = {} } = resData || {}
  Promise.all(forms.map(formName => processFile(formName, folderPath, data)))
    .then(files => zipFiles(files))
    .then(archive => saveFile(path.resolve(folderPath, 'download.zip'), archive))
    .then(data => res.download(data.filePath, (err) => {
      if (err) {
        console.log(err)  // eslint-disable-line no-console
        console.log('download file')
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
