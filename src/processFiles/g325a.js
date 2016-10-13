/* global Promise */
const hummus = require('hummus')
const path = require('path')
const fs = require('fs-extra')
const get = require('lodash/get')
const {
  formatAdmission,
  formatDate,
  formatMonth,
  formatYear,
  formatName,
  formatCertificate } = require('../utils/format')

const sortMarriages = (a, b) =>
  get(a, 'tDate') >= get(b, 'tDate') ? 1 : -1

const g325a = (inputPath, outputPath, data) =>
  new Promise((res, rej) => {
    try {
      const pdfWriter = hummus.createWriterToModify(inputPath, {
        modifiedFilePath: outputPath
      })
      const pageModifier = new hummus.PDFPageModifier(pdfWriter, 0)
      pageModifier.startContext()
      const context = pageModifier.getContext()

      const textFont = pdfWriter.getFontForFile(path.resolve('src/fonts/Cousine-Regular.ttf'))
      const text = {
        font: textFont,
        size: 8,
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

      // Names
      context.writeText(get(data, 'name.family', 'None').toUpperCase(), 40, 686, text)
      context.writeText(get(data, 'name.family', 'None').toUpperCase(), 40, 52, text)
      context.writeText(get(data, 'name.first', 'None').toUpperCase(), 147, 686, text)
      context.writeText(get(data, 'name.first', 'None').toUpperCase(), 230, 52, text)
      context.writeText(get(data, 'name.middle', 'None').toUpperCase(), 236, 686, text)
      context.writeText(get(data, 'name.middle', 'None').toUpperCase(), 360, 52, text)
      context.writeText(get(data, 'name.other', 'None').toUpperCase(), 40, 656, text)
      context.writeText(get(data, 'name.native', '').toUpperCase(), 40, 115, text)
      // Gender
      const pGender = get(data, 'gender', 'male')
      context.writeText('õ', 303, pGender === 'male' ? 708 : 687, checkmark)
      // Date of birth
      context.writeText(formatDate(get(data, 'birth.date')).toUpperCase(), 354, 686, text)
      // Nationality
      context.writeText(get(data, 'citizenship', 'None').toUpperCase(), 422, 686, text)
      // Alien number
      context.writeText(get(data, 'alienNumber', 'None').toUpperCase(), 509, 686, text)
      context.writeText(get(data, 'alienNumber', 'None').toUpperCase(), 483, 52, text)
      // City and country of birth
      const pbCity = get(data, 'birth.place.city')
      const pbCountry = get(data, 'birth.place.country')
      const pbcc = `${pbCity ? `${pbCity}, ` : ''}${pbCountry ? pbCountry : 'None'}`
      context.writeText(pbcc.toUpperCase(), 295, 656, text)
      // SSN
      context.writeText(get(data, 'ssn', 'None').toUpperCase(), 476, 656, text)
      // Father
      const father = get(data, 'family', []).filter(r => r.relationship === 'father')[0]
      if (father) {
        context.writeText(get(father, 'name.family', 'None').toUpperCase(), 93, 614, text)
        context.writeText(get(father, 'name.first', 'None').toUpperCase(), 199, 614, text)
        context.writeText(formatDate(get(father, 'bDate')).toUpperCase(), 270, 614, text)
        context.writeText(get(father, 'bPlace', 'None').toUpperCase(), 335, 614, text)
        context.writeText(get(father, 'rPlace', 'None').toUpperCase(), 454, 614, text)
      } else {
        context.writeText('UNKNOWN', 93, 614, text)
      }
      // Mother
      const mother = get(data, 'family', []).filter(r => r.relationship === 'mother')[0]
      if (mother) {
        context.writeText(get(mother, 'name.family', 'None').toUpperCase(), 93, 597, text)
        context.writeText(get(mother, 'name.first', 'None').toUpperCase(), 199, 597, text)
        context.writeText(formatDate(get(mother, 'bDate')).toUpperCase(), 270, 597, text)
        context.writeText(get(mother, 'bPlace', 'None').toUpperCase(), 335, 597, text)
        context.writeText(get(mother, 'rPlace', 'None').toUpperCase(), 454, 597, text)
      } else {
        context.writeText('UNKNOWN', 93, 597, text)
      }
      // Spouse
      const spouse = get(data, 'family', []).filter(r => r.relationship === 'spouse')[0]
      context.writeText(get(spouse, 'name.family', 'None').toUpperCase(), 40, 556, text)
      context.writeText(get(spouse, 'name.first', 'None').toUpperCase(), 199, 556, text)
      context.writeText(formatDate(get(spouse, 'bDate')).toUpperCase(), 279, 556, text)
      context.writeText(get(spouse, 'bPlace', 'None').toUpperCase(), 338, 556, text)
      context.writeText(formatDate(get(data, 'marriages.present.date')).toUpperCase(), 429, 556, text)
      context.writeText(get(data, 'marriages.present.place', 'None').toUpperCase(), 488, 556, text)
      // Prior spouses
      const priorMarriages = get(data, 'marriages.prior', []).sort(sortMarriages)
      for (let i = 0; i < 2; i++) {
        context.writeText(get(priorMarriages, `[${i}].spouse.name.family`, 'None').toUpperCase(), 40, 514 - (i * 18), text)
        context.writeText(get(priorMarriages, `[${i}].spouse.name.first`, 'None').toUpperCase(), 188, 514 - (i * 18), text)
        context.writeText(formatDate(get(priorMarriages, `[${i}].spouse.bDate`)).toUpperCase(), 265, 514 - (i * 18), text)
        const mDate = formatDate(get(priorMarriages, `[${i}].date`))
        const mPlace = get(priorMarriages, `[${i}].place`, 'None')
        const mdp = mPlace !== 'None' ? `${mDate}, ${mPlace}` : 'None'
        context.writeText(mdp.toUpperCase(), 332, 514 - (i * 18), text)
        const tDate = formatDate(get(priorMarriages, `[${i}].tDate`))
        const tPlace = get(priorMarriages, `[${i}].tPlace`, 'None')
        const tdp = tPlace !== 'None' ? `${tDate}, ${tPlace}` : 'None'
        context.writeText(tdp.toUpperCase(), 446, 514 - (i * 18), text)
      }
      // Current address
      context.writeText(get(data, 'addresses.current.street', 'None').toUpperCase(), 40, 443, text)
      context.writeText(get(data, 'addresses.current.city', 'None').toUpperCase(), 193, 443, text)
      context.writeText(get(data, 'addresses.current.state', 'None').toUpperCase(), 274, 443, text)
      context.writeText(get(data, 'addresses.current.country', 'None').toUpperCase(), 346, 443, text)
      context.writeText(formatMonth(get(data, 'addresses.current.from')), 438, 443, text)
      context.writeText(formatYear(get(data, 'addresses.current.from')), 477, 443, text)

      // Prior addresses
      const pAddresses = get(data, 'addresses.prior', [])
      /*pAddresses.forEach((address, i) => {
        const y = 426 - (16 * i)
        const { street, city, state, country, fMonth, fYear, tMonth, tYear } = address
        context.writeText(street, 40, y, text)
        context.writeText(city, 193, y, text)
        context.writeText(state, 274, y, text)
        context.writeText(country, 346, y, text)
        context.writeText(fMonth, 438, y, text)
        context.writeText(fYear, 477, y, text)
        context.writeText(tMonth, 508, y, text)
        context.writeText(tYear, 548, y, text)
      })*/
      for (let j = 0; j < 4; j++) {
        const y = 426 - (16 * j)
        context.writeText(get(pAddresses, `[${j}].street`, 'None').toUpperCase(), 40, y, text)
        context.writeText(get(pAddresses, `[${j}].city`, 'None').toUpperCase(), 193, y, text)
        context.writeText(get(pAddresses, `[${j}].state`, 'None').toUpperCase(), 274, y, text)
        context.writeText(get(pAddresses, `[${j}].country`, 'None').toUpperCase(), 346, y, text)
        context.writeText(formatMonth(get(pAddresses, `[${j}].from`)), 438, y, text)
        context.writeText(formatYear(get(pAddresses, `[${j}].from`)), 477, y, text)
        context.writeText(formatMonth(get(pAddresses, `[${j}].to`)), 508, y, text)
        context.writeText(formatYear(get(pAddresses, `[${j}].to`)), 548, y, text)
      }
      // Outside address address
      context.writeText(get(data, 'addresses.outside.street', 'None').toUpperCase(), 40, 325, text)
      context.writeText(get(data, 'addresses.outside.city', 'None').toUpperCase(), 193, 325, text)
      context.writeText(get(data, 'addresses.outside.state', 'None').toUpperCase(), 274, 325, text)
      context.writeText(get(data, 'addresses.outside.country', 'None').toUpperCase(), 346, 325, text)
      context.writeText(formatMonth(get(data, 'addresses.outside.from')), 438, 325, text)
      context.writeText(formatYear(get(data, 'addresses.outside.from')), 477, 325, text)
      context.writeText(formatMonth(get(data, 'addresses.outside.to')), 508, 325, text)
      context.writeText(formatYear(get(data, 'addresses.outside.to')), 548, 325, text)

      // Current employer
      context.writeText(get(data, 'employment.current.employer', 'None').toUpperCase(), 40, 271, text)
      context.writeText(get(data, 'employment.current.occupation', 'None').toUpperCase(), 304, 271, text)
      context.writeText(formatMonth(get(data, 'employment.current.from')), 432, 271, text)
      context.writeText(formatYear(get(data, 'employment.current.from')), 471, 271, text)

      // Prior addresses
      const pEmployment = get(data, 'employment.prior', [])
      for (let j = 0; j < 4; j++) {
        const y = 256 - (16 * j)
        context.writeText(get(pEmployment, `[${j}]employer`, 'None').toUpperCase(), 40, y, text)
        context.writeText(get(pEmployment, `[${j}]occupation`, 'None').toUpperCase(), 304, y, text)
        context.writeText(formatMonth(get(pEmployment, `[${j}]from`)), 432, y, text)
        context.writeText(formatYear(get(pEmployment, `[${j}]from`)), 471, y, text)
        context.writeText(formatMonth(get(pEmployment, `[${j}].to`)), 502, y, text)
        context.writeText(formatYear(get(pEmployment, `[${j}].to`)), 548, y, text)
      }
      // Outside address employment
      context.writeText(get(data, 'employment.outside.employer', 'None').toUpperCase(), 40, 180, text)
      context.writeText(get(data, 'employment.outside.occupation', 'None').toUpperCase(), 304, 180, text)
      context.writeText(formatMonth(get(data, 'employment.outside.from')), 432, 180, text)
      context.writeText(formatYear(get(data, 'employment.outside.from')), 471, 180, text)
      context.writeText(formatMonth(get(data, 'employment.outside.to')), 502, 180, text)
      context.writeText(formatYear(get(data, 'employment.outside.to')), 548, 180, text)


      // Connection
      if (get(data, 'connection') === 'resident') {
        context.writeText('õ', 40, 135, checkmark)
      } else {
        context.writeText('õ', 151.5, 153, checkmark)
        context.writeText(get(data, 'connection', '').toUpperCase(), 155, 137, text)
      }


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

module.exports = g325a
