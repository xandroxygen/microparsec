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
    const result = this.parsers.reduce(findMatches, {
      allMatches: [],
      leftovers: text,
    })
    return shapeResult(result)
  }
}

shapeResult = ({ allMatches, leftovers }) => {
  return {
    matches: allMatches.filter(m => m.matches.length > 0),
    leftovers: leftovers.trim().replace(/  +/g, " "),
  }
}

findMatches = ({ allMatches, leftovers }, parser) => {
  const result = parser.keywords.reduce(extractMatches, {
    matches: [],
    leftovers,
  })
  allMatches.push({ name: parser.name, matches: result.matches })
  return { allMatches, leftovers: result.leftovers }
}

extractMatches = ({ matches, leftovers }, keyword) => {
  const index = findLastInString(leftovers, keyword)
  let text = leftovers
  if (index !== -1) {
    matches.push(keyword)
    text = extractWord(leftovers, index, keyword.length)
  }
  return { matches, leftovers: text }
}

findLastInString = (haystack, needle) => {
  const escaped = escapeRegex(needle)
  const regex = new RegExp(`\\b${escaped}\\b(?!.*\\b${escaped}\\b)`, "i")
  const match = haystack.match(regex)
  return match ? match.index : -1
}

escapeRegex = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")

extractWord = (str, index, length) => {
  return str.substr(0, index) + str.substr(index + length)
}
