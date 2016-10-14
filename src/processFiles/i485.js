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
      data.family.forEach((person, i) => {
        const y1 = 331 - i * 59
        const y2 = 302 - i * 59
        const y3 = i < 2 ? 302 - i * 59 : 301 - i * 59
        context.writeText(person.name.family, 54, y1, text)
        context.writeText(person.name.first, 230, y1, text)
        context.writeText(person.name.middle, 405, y1, text)

        context.writeText(person.birth.date, 467, y1, text)
        context.writeText(person.birth.country, 54, y2, text)

        context.writeText(person.relationship, 230, y2, text)
        context.writeText(person.aNumber, 371, y2, text)
        context.writeText('õ', person.applying ? 500.5 : 545.5, y3, checkmark)
      })
      pageModifier.endContext().writePage()

      /*
       * Page 3
       */
      pageModifier = new hummus.PDFPageModifier(pdfWriter, 2)
      pageModifier.startContext()
      context = pageModifier.getContext()
      // Organizations
      data.organizations.forEach((org, i) => {
        const y = 571 - i * 24
        if (org.name) {
          context.writeText(org.name, 54, y, text)
          context.writeText(org.location, 179, y, text)
          context.writeText(org.dateFrom, 394, y, text)
          context.writeText(org.dateTo, 490, y, text)
        } else {
          context.writeText('None', 54, y, text)
        }
      })
      // Checkboxes
      context.writeText('õ', data.checkboxes['1'].a ? 519 : 555.5, 354, checkmark)
      context.writeText('õ', data.checkboxes['1'].b ? 519 : 555.5, 326, checkmark)
      context.writeText('õ', data.checkboxes['1'].c ? 519 : 555.5, 298, checkmark)
      context.writeText('õ', data.checkboxes['1'].d ? 519 : 555.5, 281, checkmark)

      context.writeText('õ', data.checkboxes['2'] ? 519 : 555.5, 261, checkmark)

      context.writeText('õ', data.checkboxes['1'].a ? 519 : 555.5, 198, checkmark)
      context.writeText('õ', data.checkboxes['1'].b ? 519 : 555.5, 171, checkmark)
      context.writeText('õ', data.checkboxes['1'].c ? 519 : 555.5, 153, checkmark)
      context.writeText('õ', data.checkboxes['1'].d ? 519 : 555.5, 125, checkmark)

      context.writeText('õ', data.checkboxes['4'] ? 519 : 555.5, 94, checkmark)

      pageModifier.endContext().writePage()

      /*
       * Page 4
       */
      pageModifier = new hummus.PDFPageModifier(pdfWriter, 3)
      pageModifier.startContext()
      context = pageModifier.getContext()
      // Checkboxes
      context.writeText('õ', data.checkboxes['5'].a ? 519 : 555.5, 647, checkmark)
      context.writeText('õ', data.checkboxes['5'].b ? 519 : 555.5, 630, checkmark)
      context.writeText('õ', data.checkboxes['5'].c ? 519 : 555.5, 603, checkmark)

      context.writeText('õ', data.checkboxes['6'] ? 519 : 555.5, 569, checkmark)
      context.writeText('õ', data.checkboxes['7'] ? 519 : 555.5, 537, checkmark)
      context.writeText('õ', data.checkboxes['8'] ? 519 : 555.5, 480, checkmark)
      context.writeText('õ', data.checkboxes['9'] ? 519 : 555.5, 435, checkmark)
      context.writeText('õ', data.checkboxes['10'] ? 519 : 555.5, 378, checkmark)
      context.writeText('õ', data.checkboxes['11'] ? 519 : 555.5, 357, checkmark)
      context.writeText('õ', data.checkboxes['12'] ? 519 : 555.5, 323, checkmark)
      context.writeText('õ', data.checkboxes['13'] ? 519 : 555.5, 291, checkmark)

      context.writeText('õ', data.checkboxes['14'].a ? 519 : 555.5, 237, checkmark)
      context.writeText('õ', data.checkboxes['14'].b ? 519 : 555.5, 221, checkmark)
      context.writeText('õ', data.checkboxes['14'].c ? 519 : 555.5, 205, checkmark)
      context.writeText('õ', data.checkboxes['14'].d ? 519 : 555.5, 187, checkmark)
      context.writeText('õ', data.checkboxes['14'].e ? 519 : 555.5, 171, checkmark)

      context.writeText('õ', data.checkboxes['15'].a ? 519 : 555.5, 133, checkmark)
      context.writeText('õ', data.checkboxes['15'].b ? 519 : 555.5, 104, checkmark)

      context.writeText('õ', data.checkboxes['16'] ? 519 : 555.5, 72, checkmark)

      pageModifier.endContext().writePage()

      /*
       * Page 5
       */
      pageModifier = new hummus.PDFPageModifier(pdfWriter, 4)
      pageModifier.startContext()
      context = pageModifier.getContext()
      // Checkboxes
      context.writeText('õ', data.checkboxes['17'] ? 519 : 555.5, 664, checkmark)
      context.writeText('õ', data.checkboxes['18'] ? 519 : 555.5, 618, checkmark)
      // Accomodations
      if (data.accomodations) {
        context.writeText('õ', 519, 562, checkmark)
        if (data.accomodations.a) {
          context.writeText('õ', 55.5, 527.5, checkmark)
          context.writeText(data.accomodations.a, 93, 493, text)
        }
        if (data.accomodations.b) {
          context.writeText('õ', 55.5, 468.5, checkmark)
          context.writeText(data.accomodations.b, 93, 446, text)
        }
        if (data.accomodations.c) {
          context.writeText('õ', 55.5, 423.5, checkmark)
          context.writeText(data.accomodations.c, 93, 387, text)
        }
      } else {
        context.writeText('õ', 555.5, 562, checkmark)
      }

      pageModifier.endContext().writePage()

      /*
       * Page 6
       */
      pageModifier = new hummus.PDFPageModifier(pdfWriter, 5)
      pageModifier.startContext()
      context = pageModifier.getContext()
      // I can read english
      context.writeText('õ', 38, 646, checkmark)
      // Applicant info
      context.writeText(data.name.full, 217, 472, text),
      context.writeText(data.phone, 478, 472, text)
      //.Fill date
      context.writeText(data.fillDate, 411, 472, text)

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
