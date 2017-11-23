buildParser = data => {
  const { name, keywords } = data
  return {
    name,
    keywords,
    matches: [],
  }
}

isStringOrRegex = s => {
  return typeof s === "string" || s instanceof RegExp
}

module.exports = class Microparsec {
  constructor(parsers) {
    // can accept:
    // string - "keyword"
    // regex - "regex"
    // array of strings - ["key", "word"]
    // array of regex - ["reg", "ex"]
    // keyword object, containing keywords: ["word", "regex"]
    // array of keyword objects, containing keywords: strings or regex
    //   - [{ name: "Key", keywords: ["word", "regex"] }]

    let data
    if (isStringOrRegex(parsers)) {
      data = { name: "Default", keywords: [parsers] }
    } else if (Array.isArray(parsers) && parsers.every(isStringOrRegex)) {
      data = { name: "Default", keywords: parsers }
    } else if (typeof parsers === "object" && parsers.keywords) {
      data = parsers
    }
    if (data) {
      this.parsers = [buildParser(data)]
    } else if (Array.isArray(parsers)) {
      this.parsers = parsers.map(buildParser)
    } else {
      throw new Error("invalid parser input")
    }
  }

  parse(text) {
    const result = this.parsers.reduce(findMatches, { leftovers: text })
    return shapeResult(result)
  }
}

shapeResult = ({ matches, leftovers }) => {
  return {
    matches,
    leftovers: leftovers.trim(),
  }
}

findMatches = ({ leftovers }, parser) => {
  return parser.keywords.reduce(extractMatches, {
    matches: [],
    leftovers,
  })
}

extractMatches = ({ matches, leftovers }, keyword) => {
  const index = leftovers.lastIndexOf(keyword)
  let text = leftovers
  if (index !== -1) {
    matches.push(keyword)
    text = extractWord(leftovers, index, keyword.length)
  }
  return { matches, leftovers: text }
}

extractWord = (str, index, length) => {
  return str.substr(0, index) + str.substr(index + length)
}
