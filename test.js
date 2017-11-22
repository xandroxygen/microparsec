const Microparsec = require("./index")

const regex = { regex: /#\w+/ }
const keywords = { keywords: ["test"] }

describe("constructor", () => {
  test("identifies parser with keyword", () => {
    const m = new Microparsec([{ name: "Parser 1", ...keywords }])
    expect(m.parsers).toMatchObject([{ ...keywords, isRegex: false }])
  })

  test("identifies parser with regex", () => {
    const m = new Microparsec([{ name: "Regex", ...regex }])
    expect(m.parsers).toMatchObject([{ ...regex, isRegex: true }])
  })

  test("rejects parser with both keyword and regex", () => {
    expect(() => {
      const m = new Microparsec([{ name: "Both", ...keywords, ...regex }])
    }).toThrow()
  })
})

describe("parse", () => {
  let m
  beforeEach(() => {
    m = new Microparsec([{ name: "Parser 1", ...keywords }])
  })
  test("returns text", () => {
    const text = "Hello World!"
    expect(m.parse(text)).toBe(text)
  })
})
