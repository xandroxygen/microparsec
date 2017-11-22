buildParser = data => {
  const { name, keywords, regex } = data
  if (keywords && regex) {
    throw new Error("Keyword list and regex are mutually exclusive")
  }
  return {
    name,
    keywords,
    regex,
    isRegex: !!regex,
    matches: [],
  }
}

module.exports = class Microparsec {
  constructor(parsers) {
    this.parsers = parsers.map(buildParser)
  }

  parse(text) {
    return text
  }
}
