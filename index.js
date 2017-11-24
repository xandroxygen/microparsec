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
    return [result]
      .map(renameMatches)
      .map(removeEmptyMatches)
      .map(trimWhitespace)
      .reduce(result => result)
  }
}

removeEmptyMatches = result => ({
  ...result,
  matches: result.matches.filter(m => m.matches.length > 0),
})

trimWhitespace = result => ({
  ...result,
  leftovers: result.leftovers.trim().replace(/  +/g, " "),
})

renameMatches = ({ allMatches, leftovers }) => ({
  matches: allMatches,
  leftovers,
})

findMatches = ({ allMatches, leftovers }, parser) => {
  const result = parser.keywords.reduce(extractMatches, {
    matches: [],
    leftovers,
  })
  allMatches.push({ name: parser.name, matches: result.matches })
  return { allMatches, leftovers: result.leftovers }
}

extractMatches = ({ matches, leftovers }, keyword) => {
  const regex = buildRegex(keyword)
  const match = leftovers.match(regex)
  const text = match ? leftovers.replace(regex, "") : leftovers
  if (match) {
    matches.push(match.pop())
  }
  return { matches, leftovers: text }
}

buildRegex = keyword => {
  if (typeof keyword === "string") {
    const escaped = escapeRegex(keyword)
    return new RegExp(`\\b${escaped}\\b(?!.*\\b${escaped}\\b)`, "i")
  }
  return keyword
}

escapeRegex = s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
