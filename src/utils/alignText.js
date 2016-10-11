const alignText = (context, text, alignment, x, y, options) => {
  const { font, size } = options
  const { width } = font.calculateTextDimensions(text, size)
  switch (alignment) {
    case 'left':
      context.writeText(text, x, y, options)
      break
    case 'center':
      context.writeText(text, x - (width / 2), y, options)
      break
    default:
      context.writeText(text, x - width, y, options)
  }
}

module.exports = alignText
