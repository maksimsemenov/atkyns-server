const JSZip = require('jszip')

const zipFiles = (files = []) => {
  const aZip = new JSZip().folder('Atkyns')
  aZip.file('New File.txt', 'test file for archive')
  files.forEach(({ fileData, fileName }) => aZip.file(`${fileName}.pdf`, fileData))
  return aZip.generateAsync({ type: 'nodebuffer' })
}

module.exports = zipFiles
