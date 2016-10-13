/* global Promise */
const hummus = require('hummus')
const path = require('path')
const fs = require('fs-extra')
const get = require('lodash/get')

const i485 = (inputPath, outputPath, data) =>
  new Promise((res, rej) => {
    try {
      const pdfWriter = hummus.createWriterToModify(inputPath, {
        modifiedFilePath: outputPath
      })
      let pageModifier = new hummus.PDFPageModifier(pdfWriter, 0)
      pageModifier.startContext()
      let context = pageModifier.getContext()

      const ubuntuFont = pdfWriter.getFontForFile(path.resolve('src/fonts/Cousine-Regular.ttf'))
      const text = {
        font: ubuntuFont,
        size: 9,
        colorspace: 'grey',
        color: 0x00
      }
      const symbolFont = pdfWriter.getFontForFile(path.resolve('src/fonts/symbol.ttf'))
      const checkmark = {
        font: symbolFont,
        size: 12,
        colorspace: 'grey',
        color: 0x00
      }
      // Name
      context.writeText(data.name.family, 39, 651, text)
      context.writeText(data.name.first, 162, 651, text)
      context.writeText(data.name.middle, 284, 651, text)
      // Address
      context.writeText(data.address.street, 39, 623, text)
      context.writeText(data.address.apt, 354, 623, text)
      context.writeText(data.address.co, 39, 596, text)
      context.writeText(data.address.city, 39, 568, text)
      context.writeText(data.address.state, 207, 568, text)
      context.writeText(data.address.zip, 332, 568, text)
      // Birth
      context.writeText(data.birth.date, 39, 541, text)
      context.writeText(data.birth.country, 223, 541, text)
      // Citizenship
      context.writeText(data.citizenship, 39, 513, text)
      // SSN
      context.writeText(data.ssn, 188, 513, text)
      // Alien number
      context.writeText(data.aNumber, 316, 513, text)
      // Arrival
      context.writeText(data.entry.date, 39, 484, text)
      context.writeText(data.entry.i94, 223, 484, text)
      // Current status
      context.writeText(data.currentStatus.status, 39, 457, text)
      context.writeText(data.currentStatus.expires, 223, 457, text)
      // Application type
      context.writeText('õ', 47, data.aplicationStatus === 'a' ? 411 : 366, checkmark)
      pageModifier.endContext().writePage()

      /*
       * Page 2
       */
      pageModifier = new hummus.PDFPageModifier(pdfWriter, 1)
      pageModifier.startContext()
      context = pageModifier.getContext()

      // Birth
      context.writeText(data.birth.city, 54, 658, text)
      // Occupation
      context.writeText(data.occupation, 327, 658, text)
      // Parents names
      context.writeText(data.motherName, 54, 624, text)
      context.writeText(data.fatherName, 327, 624, text)
      // I94 name
      context.writeText(data.name.i94, 54, 590, text)
      // Entry
      context.writeText(data.entry.place, 54, 543, text)
      context.writeText(data.entry.status, 327, 543, text)
      context.writeText('õ', data.entry.inspected ? 297 : 343, 523, checkmark)
      context.writeText(data.entry.visa.number, 54, 491, text)
      context.writeText(data.entry.visa.consulate, 327, 491, text)
      context.writeText(data.entry.visa.issueDate, 54, 457, text)
      // Gender
      context.writeText('õ', data.gender === 'male' ? 199.5 : 251, 454.5, checkmark)
      // Marital status
      switch (data.maritalStatus) {
        case 'married':
          context.writeText('õ', 333.5, 456, checkmark)
          break
        case 'single':
          context.writeText('õ', 396, 456, checkmark)
          break
        case 'divorced':
          context.writeText('õ', 449.5, 456, checkmark)
          break
        default:
          context.writeText('õ', 514, 456, checkmark)
      }
      // Prior application
      if (data.priorApplication) {
        context.writeText('õ', 323, 432, checkmark)
        context.writeText(data.priorApplication, 54, 403, text)
      } else {
        context.writeText('õ', 519.5, 432, checkmark)
      }
      // Family
      /*data.family.forEach((person, i) => {

      })*/
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

module.exports = i485
