const formatDate = (dateString) => {
  if (!dateString) { return 'None' }
  const date = new Date(dateString)
  const options = {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}
const formatMonth = (dateString) => {
  if (!dateString) { return 'NA' }
  const date = new Date(dateString)
  const options = {
    month: '2-digit'
  }
  return date.toLocaleDateString('en-US', options)
}
const formatYear = (dateString) => {
  if (!dateString) { return 'NA' }
  const date = new Date(dateString)
  const options = {
    year: 'numeric'
  }
  return date.toLocaleDateString('en-US', options)
}
const formatSSN = (ssn) => {
  if (!ssn) {return 'None'}
  const ssnStr = ssn.toString()
  return `${ssnStr.slice(0, 3)}-${ssnStr.slice(3, 5)}-${ssnStr.slice(5)}`
}
const formatName = (name) => {
  if (!name) { return 'None' }
  const { first = '', family = '', maiden = '' } = name
  if (!first || (!family && !maiden)) {
    return 'None'
  }
  return `${first} ${maiden || family}`
}
const formatCertificate = (certificate) => {
  if (!certificate) { return '' }
  const { number, date, place } = certificate
  return `${number}, ${formatDate(date)}, ${place}`
}
const formatAdmission = (admission) => {
  if (!admission) { return 'None'}
  const { date, place, aClass } = admission
  return `${formatDate(date)}, ${place || 'None'}, ${aClass || 'None'}`
}

module.exports = {
  formatAdmission,
  formatCertificate,
  formatDate,
  formatMonth,
  formatYear,
  formatName,
  formatSSN,
}
