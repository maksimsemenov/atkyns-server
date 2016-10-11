const joinToString = (array, separator) =>
  array.reduce((str, item) => item ? `${str}${separator}${item}` : str)

module.exports = {
  joinToString
}
