const Microparsec = require("./index")

describe("constructor", () => {
  test("identifies keyword as string", () => {
    const keywords = "test"
    const m = new Microparsec(keywords)
    expect(m.parsers).toMatchObject([{ keywords: [keywords] }])
  })

  test("identifies keyword as regex", () => {
    const keywords = /test/
    const m = new Microparsec(/test/)
    expect(m.parsers).toMatchObject([{ keywords: [keywords] }])
  })

  test("identifies array of keywords as strings or regexes", () => {
    const keywords = ["test", /test/]
    const m = new Microparsec(keywords)
    expect(m.parsers).toMatchObject([{ keywords }])
  })

  test("identifies array of lists of keywords", () => {
    const keywords = { keywords: ["test", /test/] }
    const m = new Microparsec([{ ...keywords }])
    expect(m.parsers).toMatchObject([{ ...keywords }])
  })

  test("identifies object as list of keywords", () => {
    const parser = { keywords: ["test", /test/] }
    const m = new Microparsec(parser)
    expect(m.parsers).toMatchObject([parser])
  })

  test("names parser Default unless specified", () => {
    const parser = { name: "Parser", keywords: ["test", /test/] }
    const m = new Microparsec(parser)
    expect(m.parsers).toMatchObject([parser])
  })

  test("rejects parser with invalid input", () => {
    expect(() => {
      const m = new Microparsec(2)
    }).toThrow()
  })
})

describe("parse", () => {
  let m
  const expectParsedText = (m, input, output) => {
    const result = m.parse(input)
    expect(result.leftovers).toBe(output)
  }

  beforeEach(() => {
    m = new Microparsec([{ name: "Test 1", keywords: ["test", "?"] }])
  })

  test("returns text without matches", () => {
    expectParsedText(m, "Hello World!", "Hello World!")
  })

  test("trims whitespace from output", () => {
    expectParsedText(m, "the     test", "the")
  })

  test("recognizes one keyword", () => {
    expectParsedText(m, "This is a test", "This is a")
  })

  test("recognizes multiple keywords", () => {
    expectParsedText(m, "This? is a test", "This is a")
  })

  test("extracts last occurrence of keyword", () => {
    expectParsedText(m, "test hello test", "test hello")
  })
})
