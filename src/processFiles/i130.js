/* global Promise */
const hummus = require('hummus')
const path = require('path')
const fs = require('fs-extra')

const i130 = (folderPath, data = {}) => {
  return new Promise((res, rej) => {
    const outputPath = path.resolve(folderPath, 'i-130.pdf')
    try {
      const pdfWriter = hummus.createWriterToModify(path.resolve('src/originalPDF/i-485.pdf'), {
        modifiedFilePath: outputPath
      })
      const pageModifier = new hummus.PDFPageModifier(pdfWriter, 0)
      pageModifier.startContext()
      const context = pageModifier.getContext()
      const ubuntuFont = pdfWriter.getFontForFile(path.resolve('src/fonts/Ubuntu-Italic.ttf'))
      context.writeText(data.name || 'NONE', 34, 300, {
        font: ubuntuFont,
        size: 16,
        colorspace: 'rgb',
        color: 0xFC6621
      })
      pageModifier.endContext().writePage()
      pdfWriter.end()
      fs.readFile(outputPath, (err, data) => {
        res(data)
      })
    }
    catch (err) {
      rej(err)
    }
  })
}

module.exports = i130
