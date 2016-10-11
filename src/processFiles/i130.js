/* global Promise */
const hummus = require('hummus')
const path = require('path')
const fs = require('fs-extra')
const get = require('lodash/get')
const alignText = require('../utils/alignText')
const {
  formatAdmission,
  formatDate,
  formatName,
  formatCertificate } = require('../utils/format')
const { joinToString } = require('../utils/stringUtils')

const sortMarriages = (a, b) =>
  get(a, 'tDate') >= get(b, 'tDate') ? 1 : -1

const i130 = (folderPath, data = {}) =>
  new Promise((res, rej) => {
    try {
    const outputPath = path.resolve(folderPath, 'i-130.pdf')
    const pdfWriter = hummus.createWriterToModify(path.resolve('src/originalPDF/i-130.pdf'), {
      modifiedFilePath: outputPath
    })
    const pageModifier1 = new hummus.PDFPageModifier(pdfWriter, 0)
    pageModifier1.startContext()
    let context = pageModifier1.getContext()

    const ubuntuFont = pdfWriter.getFontForFile(path.resolve('src/fonts/UbuntuMono-Bold.ttf'))
    const text = {
      font: ubuntuFont,
      size: 10,
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

    /*
     * Petitioner
     */
    // Relationship
    switch (get(data, 'relationship')) {
      case 'spouse':
        context.writeText('õ', 29, 528, checkmark)
        break
      case 'parent':
        context.writeText('õ', 102, 528, checkmark)
        break
      case 'brother':
      case 'sister':
        context.writeText('õ', 149, 528, checkmark)
        break
      default:
        context.writeText('õ', 215.5, 526, checkmark)
    }
    const relByAdoption = get(data, 'relatedByAdoption', false)
    context.writeText('õ', relByAdoption ? 267 : 319, 528, checkmark)
    // Names
    context.writeText(get(data, 'petitioner.name.family', 'None').toUpperCase(), 35, 482, text)
    context.writeText(get(data, 'petitioner.name.first', 'None').toUpperCase(), 163, 482, text)
    context.writeText(get(data, 'petitioner.name.middle', 'None').toUpperCase(), 252, 482, text)
    context.writeText(get(data, 'petitioner.name.other', 'None').toUpperCase(), 35, 333, text)
    // Adress
    context.writeText(get(data, 'petitioner.address.street', 'None').toUpperCase(), 35, 453, text)
    context.writeText(get(data, 'petitioner.address.apt', 'None').toUpperCase(), 250, 453, text)
    context.writeText(get(data, 'petitioner.address.city', 'None').toUpperCase(), 35, 423, text)
    const pState = get(data, 'petitioner.address.state')
    const pCountry = get(data, 'petitioner.address.country')
    const sc = `${pState ? `${pState}, ` : ''}${pCountry ? pCountry : 'None'}`
    context.writeText(sc.toUpperCase(), 130, 423, text)
    context.writeText(get(data, 'petitioner.address.zip', 'None'), 245, 423, text)
    // Place of birth
    context.writeText(get(data, 'petitioner.birth.place.city', 'None').toUpperCase(), 35, 397, text)
    const pbState = get(data, 'petitioner.birth.place.state')
    const pbCountry = get(data, 'petitioner.birth.place.country')
    const bsc = `${pbState ? `${pbState}, ` : ''}${pbCountry ? pbCountry : 'None'}`
    context.writeText(bsc.toUpperCase(), 220, 397, text)
    // Date of birth
    context.writeText(formatDate(get(data, 'petitioner.birth.date')).toUpperCase(), 35, 361, text)
    // Gender
    const pGender = get(data, 'petitioner.gender', 'male')
    context.writeText('õ', 131.5, pGender === 'male' ? 372 : 359, checkmark)
    // Marital status
    switch (get(data, 'petitioner.maritalStatus')) {
      case 'married':
        context.writeText('õ', 193.5, 372, checkmark)
        break
      case 'single':
        context.writeText('õ', 246, 372, checkmark)
        break
      case 'widowed':
        context.writeText('õ', 194, 359, checkmark)
        break
      default:
        context.writeText('õ', 246, 359, checkmark)
    }
    // Present marriage
    if (get(data, 'petitioner.maritalStatus') === 'married') {
      context.writeText(get(data, 'petitioner.marriages.present.place', 'None').toUpperCase(), 110, 307, text)
      context.writeText(formatDate(get(data, 'petitioner.marriages.present.date')).toUpperCase(), 35, 307, text)
    } else {
      context.writeText('None'.toUpperCase(), 35, 307, text)
    }
    // SSN and A number
    context.writeText(get(data, 'petitioner.ssn', 'None').toUpperCase(), 35, 281, text)
    context.writeText(get(data, 'petitioner.alienNumber', 'None').toUpperCase(), 184, 281, text)
    // Prior spouses
    const priorMarieges = get(data, 'petitioner.marriages.prior', []).sort(sortMarriages)
    context.writeText(formatName(get(priorMarieges, '[0].spouse.name')).toUpperCase(), 37, 254, text)
    context.writeText(formatDate(get(priorMarieges, '[0].tDate')).toUpperCase(), 214, 254, text)
    context.writeText(formatName(get(priorMarieges, '[1].spouse.name')).toUpperCase(), 37, 236, text)
    context.writeText(formatDate(get(priorMarieges, '[1].tDate')).toUpperCase(), 214, 236, text)
    // Status
    if (get(data, 'petitioner.status.citizen')) {
      context.writeText('õ', 487, 528, checkmark)
      context.writeText('õ', 111, 46, checkmark)
      switch (get(data, 'petitioner.status.citizen.type')) {
        case 'birth':
          context.writeText('õ', 42, 196, checkmark)
          break
        case 'naturalization':
          context.writeText('õ', 42, 183, checkmark)
          context.writeText(formatCertificate(get(data, 'petitioner.status.citizen.certificate')).toUpperCase(), 67, 169, text)
          break
        default:
          context.writeText('õ', 39, 158, checkmark)
          if (get(data, 'petitioner.status.citizen.certificate')) {
            context.writeText('õ', 54.5, 146, checkmark)
            context.writeText(formatCertificate(get(data, 'petitioner.status.citizen.certificate')).toUpperCase(), 67, 132, text)
          } else {
            context.writeText('õ', 266, 146, checkmark)
          }
      }
    } else if (get(data, 'petitioner.status.resident')) {
      const pStatusByAdopition = get(data, 'petitioner.status.resident.getByAdoption')
      context.writeText('õ', pStatusByAdopition ? 445 : 487, 528, checkmark)
      const pStatusByMarriage = get(data, 'petitioner.status.resident.getByMarriage')
      context.writeText('õ', pStatusByMarriage ? 57.5 : 111, 46, checkmark)
      context.writeText(formatAdmission(get(data, 'petitioner.status.resident.admission')).toUpperCase(), 35, 81, text)
    }

    /*
     * Relative
     */
    // Names
    context.writeText(get(data, 'relative.name.family', 'None').toUpperCase(), 324, 482, text)
    context.writeText(get(data, 'relative.name.first', 'None').toUpperCase(), 447, 482, text)
    context.writeText(get(data, 'relative.name.middle', 'None').toUpperCase(), 530, 482, text)
    context.writeText(get(data, 'relative.name.other', 'None').toUpperCase(), 324, 333, text)
    // Adress
    context.writeText(get(data, 'relative.addresses.current.street', 'None').toUpperCase(), 324, 453, text)
    context.writeText(get(data, 'relative.addresses.current.apt', 'None').toUpperCase(), 551, 453, text)
    context.writeText(get(data, 'relative.addresses.current.city', 'None').toUpperCase(), 324, 423, text)
    const rState = get(data, 'relative.addresses.current.state')
    const rCountry = get(data, 'relative.addresses.current.country')
    const rsc = `${rState ? `${rState}, ` : ''}${rCountry ? rCountry : 'None'}`
    context.writeText(rsc.toUpperCase(), 425, 423, text)
    context.writeText(get(data, 'relative.addresses.current.zip', 'None'), 528, 423, text)
    // Place of birth
    context.writeText(get(data, 'relative.birth.place.city', 'None').toUpperCase(), 324, 397, text)
    const rbState = get(data, 'relative.birth.place.state')
    const rbCountry = get(data, 'relative.birth.place.country')
    const rbsc = `${rbState ? `${rbState}, ` : ''}${rbCountry ? rbCountry : 'None'}`
    context.writeText(rbsc.toUpperCase(), 510, 397, text)
    // Date of birth
    context.writeText(formatDate(get(data, 'relative.birth.date')).toUpperCase(), 324, 361, text)
    // Gender
    const rGender = get(data, 'relative.gender', 'male')
    context.writeText('õ', 417.5, rGender === 'male' ? 372.5 : 359, checkmark)
    // Marital status
    switch (get(data, 'relative.maritalStatus')) {
      case 'married':
        context.writeText('õ', 487, 372, checkmark)
        break
      case 'single':
        context.writeText('õ', 547, 373.5, checkmark)
        break
      case 'widowed':
        context.writeText('õ', 487, 359, checkmark)
        break
      default:
        context.writeText('õ', 545.5, 358.5, checkmark)
    }
    // Present marriage
    if (get(data, 'relative.maritalStatus') === 'married') {
      context.writeText(get(data, 'relative.marriages.present.place', 'None').toUpperCase(), 400, 307, text)
      context.writeText(formatDate(get(data, 'relative.marriages.present.date')).toUpperCase(), 324, 307, text)
    } else {
      context.writeText('None'.toUpperCase(), 324, 307, text)
    }
    // SSN and A number
    context.writeText(get(data, 'relative.ssn', 'None').toUpperCase(), 324, 281, text)
    context.writeText(get(data, 'relative.alienNumber', 'None').toUpperCase(), 474, 281, text)
    // Prior spouses
    const rPriorMarieges = get(data, 'relative.marriages.prior', []).sort(sortMarriages)
    context.writeText(formatName(get(rPriorMarieges, '[0].spouse.name')).toUpperCase(), 327, 254, text)
    context.writeText(formatDate(get(rPriorMarieges, '[0].tDate')).toUpperCase(), 504, 254, text)
    context.writeText(formatName(get(rPriorMarieges, '[1].spouse.name')).toUpperCase(), 327, 236, text)
    context.writeText(formatDate(get(rPriorMarieges, '[1].tDate')).toUpperCase(), 504, 236, text)
    // Visits
    const rPriorVisit = get(data, 'relative.usVisits.prior')
    context.writeText('õ', rPriorVisit ? 497.5 : 539, 220.5, checkmark)
    context.writeText(get(data, 'relative.usVisits.current.enterStatus', 'None').toUpperCase(), 502, 190, text)
    const ri94 = get(data, 'relative.usVisits.current.i94.number')
    if (typeof ri94 === 'string') {
      ri94.split('').map((char, index) => {
        if (index < 3) {
          context.writeText(char, 324 + index * 15, 163, text)
        } else {
          context.writeText(char, 380 + (index - 3) * 14, 163, text)
        }

      })
    }
    context.writeText(formatDate(get(data, 'relative.usVisits.current.i94.date')).toUpperCase(), 504, 159, text)
    context.writeText(formatDate(get(data, 'relative.usVisits.current.i94.expireDate')).toUpperCase(), 504, 132, text)
    // Employment
    const rEmployerName = get(data, 'relative.employment.employer.name')
    const rEmployerAddress = get(data, 'relative.employment.employer.address')
    const rEmployer = rEmployerName ? `${rEmployerName}, ${rEmployerAddress}` : 'None'
    context.writeText(rEmployer, 324, 104, text)
    context.writeText(formatDate(get(data, 'relative.employment.date')).toUpperCase(), 435, 82, text)
    // Immigration processing
    if (get(data, 'relative.immigrationProceeding')) {
      context.writeText('õ', 348.5, 57, checkmark)
      context.writeText(get(data, 'relative.immigrationProceeding.place', 'None'), 410, 58, text)
      context.writeText(formatDate(get(data, 'relative.immigrationProceeding.date')).toUpperCase(), 516, 59, text)
      switch (get(data, 'relative.immigrationProceeding.status')) {
        case 'removal':
          context.writeText('õ', 316.5, 44.5, checkmark)
          break
        case 'departation':
          context.writeText('õ', 367, 44.5, checkmark)
          break
        case 'rescission':
          context.writeText('õ', 460.5, 44.5, checkmark)
          break
        default:
          context.writeText('õ', 513.5, 44.5, checkmark)
      }
    } else {
      context.writeText('õ', 317, 57.5, checkmark)
    }

    pageModifier1.endContext().writePage()


/* Page 2
 * -----------------------------------------------------------------------------
 */
    const pageModifier2 = new hummus.PDFPageModifier(pdfWriter, 1)
    pageModifier2.startContext()
    context = pageModifier2.getContext()
    /*
     * Relative
     */
     // Family
    for (let i = 0; i < 5; i++) {
      if (get(data, `relative.family[${i}]`)) {
        context.writeText(formatName(get(data, `relative.family[${i}].name`)).toUpperCase(), 40, 684 - (i * 22), text)
        context.writeText(get(data, `relative.family[${i}].relashionship`, 'None').toUpperCase(), 283, 684 - (i * 22), text)
        context.writeText(formatDate(get(data, `relative.family[${i}].bDate`)).toUpperCase(), 374, 684 - (i * 22), text)
        context.writeText(get(data, `relative.family[${i}].bCountry`, 'None').toUpperCase(), 462, 684 - (i * 22), text)
      } else {
        context.writeText('None'.toUpperCase(), 40, 684 - (i * 22), text)
      }
    }
    // Address in US
    if (get(data, 'relative.addresses.us')) {
      context.writeText(get(data, 'relative.addresses.us.street', 'None').toUpperCase(), 40, 547, text)
      context.writeText(get(data, 'relative.addresses.us.city', 'None').toUpperCase(), 307, 547, text)
      context.writeText(get(data, 'relative.addresses.us.state', 'None').toUpperCase(), 478, 547, text)
    } else {
      context.writeText('None'.toUpperCase(), 40, 547, text)
    }
    // Address abroad
    if (get(data, 'relative.addresses.abroad')) {
      const raaStreet = get(data, 'relative.addresses.abroad.street')
      const raaCity = get(data, 'relative.addresses.abroad.city')
      const raaState = get(data, 'relative.addresses.abroad.state')
      const raaCountry = get(data, 'relative.addresses.abroad.country')
      const raaZip = get(data, 'relative.addresses.abroad.zip')
      const raa = joinToString([raaStreet, raaCity, raaState, raaCountry, raaZip], ', ')
      context.writeText(raa.toUpperCase(), 40, 505, text)
      context.writeText(get(data, 'relative.addresses.abroad.phone', 'None').toUpperCase(), 498, 505, text)
    } else {
      context.writeText('None'.toUpperCase(), 40, 505, text)
    }
    // Native address
    context.writeText(get(data, 'relative.name.native', 'None').toUpperCase(), 40, 457, text)
    context.writeText(get(data, 'relative.addresses.native', 'NONE').toUpperCase(), 192, 457, text)
    // Spouce address
    if (get(data, 'relative.addresses.spouse')) {
      const rsaStreet = get(data, 'relative.addresses.spouse.street')
      const rsaCity = get(data, 'relative.addresses.spouse.city')
      const rsaState = get(data, 'relative.addresses.spouse.state')
      const rsaCountry = get(data, 'relative.addresses.spouse.country')
      const rsaZip = get(data, 'relative.addresses.spouse.zip')
      const rsa = joinToString([rsaStreet, rsaCity, rsaState, rsaCountry, rsaZip], ', ')
      context.writeText(rsa.toUpperCase(), 40, 418, text)
      context.writeText(formatDate(get(data, 'relative.addresses.spouse.from')).toUpperCase(), 443, 418, text)
      const rsaToDate = get(data, 'relative.addresses.spouse.to')
      context.writeText(rsaToDate === 'current' ? 'Current time'.toUpperCase() : formatDate(rsaToDate).toUpperCase(), 521, 418, text)
    } else {
      context.writeText('None'.toUpperCase(), 40, 418, text)
    }
    // Application address
    context.writeText(get(data, 'relative.application.us.city', 'None').toUpperCase(), 40, 354, text)
    context.writeText(get(data, 'relative.application.us.state', 'None').toUpperCase(), 174, 354, text)
    context.writeText(get(data, 'relative.application.abroad.city', 'None').toUpperCase(), 283, 354, text)
    context.writeText(get(data, 'relative.application.abroad.country', 'None').toUpperCase(), 445, 354, text)

    /*
     * Petition
     */
    // Current
    if (Array.isArray(get(data, 'petitions.current'))) {
      const opArray = get(data, 'petitions.current').map(petition => {
        const { name, relashionship } = petition
        return joinToString([formatName(name), relashionship], ' ')
      })
      context.writeText(joinToString(opArray, ', ').toUpperCase(), 40, 272, text)
    } else {
      context.writeText('None'.toUpperCase(), 40, 272, text)
    }
    // Prior
    if (Array.isArray(get(data, 'petitions.prior'))) {
      context.writeText('õ', 314, 255.5, checkmark)
      const { name, date, place, result } = get(data, 'petitions.prior[0]')
      const pp = joinToString([formatName(name), formatDate(date), place, result], ', ')
      context.writeText(pp.toUpperCase(), 40, 227, text)
    } else {
      context.writeText('õ', 348, 255.5, checkmark)
      context.writeText('None'.toUpperCase(), 40, 227, text)
    }

    // Petitione phone
    if (get(data, 'petitioner.phone')) {
      context.writeText(get(data, 'petitioner.phone').slice(0, 3), 507, 93, text)
      context.writeText(get(data, 'petitioner.phone').slice(4), 535, 93, text)
    }


    pageModifier2.endContext().writePage()
    pdfWriter.end()
    fs.readFile(outputPath, (err, data) => {
      if (err) {
        rej(err)
      }
      res(data)
    })
  }
  catch (err) {
    console.log(err)
  }
  })

module.exports = i130
