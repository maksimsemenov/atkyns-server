/* global Promise */
const hummus = require('hummus')
const path = require('path')
const fs = require('fs-extra')
const get = require('lodash/get')

const g1145 = (inputPath, outputPath, data = {}) =>
  new Promise((res, rej) => {
    try {
      const pdfWriter = hummus.createWriterToModify(inputPath, {
        modifiedFilePath: outputPath
      })
      const pageModifier = new hummus.PDFPageModifier(pdfWriter, 0)
      pageModifier.startContext()
      const context = pageModifier.getContext()

      const ubuntuFont = pdfWriter.getFontForFile(path.resolve('src/fonts/UbuntuMono-Bold.ttf'))
      const text = {
        font: ubuntuFont,
        size: 10,
        colorspace: 'grey',
        color: 0x00
      }

      // Names
      context.writeText(get(data, 'petitioner.name.family', 'None'), 40, 126, text)
      context.writeText(get(data, 'petitioner.name.first', 'None'), 218, 126, text)
      context.writeText(get(data, 'petitioner.name.middle', 'None'), 403, 126, text)
      context.writeText(get(data, 'petitioner.email', 'None'), 40, 92, text)
      context.writeText(get(data, 'petitioner.phone', 'None'), 345, 92, text)


      pageModifier.endContext().writePage()
      pdfWriter.end()
      fs.readFile(outputPath, (err, data) => {
        if (err) {
          rej(err)
        }
        res(data)
      })
    }
    catch (err) {
      rej(err)
    }
  })

module.exports = g1145
