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

  const expectInterpolatedText = (m, input, output) => {
    const result = m.parse(input)
    expect(result.interpolated).toBe(output)
  }

  const expectKeywords = (m, input, ...keywords) => {
    const result = m.parse(input)
    const matches = result.matches.map(m => m.matches.map(n => n.match))
    expect(matches).toEqual(expect.arrayContaining(keywords))
  }

  describe("one parser", () => {
    beforeEach(() => {
      m = new Microparsec([{ name: "Test 1", keywords: ["test", "heck"] }])
    })

    test("returns text without matches", () => {
      expectParsedText(m, "Hello World!", "Hello World!")
    })

    test("trims whitespace from output", () => {
      expectParsedText(m, "the     test", "the")
    })

    test("recognizes one keyword", () => {
      expectParsedText(m, "This is a test", "This is a")
      expectInterpolatedText(m, "This is a test", "This is a %0")
    })

    test("recognizes multiple keywords", () => {
      expectParsedText(m, "This heck is a test", "This is a")
      expectInterpolatedText(m, "This heck is a test", "This %1 is a %0")
    })

    test("extracts last occurrence of keyword", () => {
      expectParsedText(m, "test hello test", "test hello")
    })

    test("only extracts keywords that are words", () => {
      expectParsedText(m, "testing", "testing")
    })

    test("recognizes case-insensitive keywords", () => {
      expectParsedText(m, "Test this", "this")
    })

    test("returns keywords when matched", () => {
      expectKeywords(m, "test hello", ["test"])
    })
  })

  describe("multiple parsers", () => {
    beforeEach(() => {
      m = new Microparsec([
        {
          name: "Testing",
          keywords: ["test"],
        },
        {
          name: "Goodbye",
          keywords: ["hello", "hi"],
        },
        {
          name: "What the",
          keywords: ["heck"],
        },
      ])
    })

    test("returns text without matches", () => {
      expectParsedText(m, "This text doesn't match", "This text doesn't match")
      expectParsedText(m, "testing doesn't count", "testing doesn't count")
    })

    test("recognizes keywords from multiple parsers", () => {
      expectParsedText(m, "Hello it's test heck", "it's")
      expectParsedText(m, "test test hello test", "test test")
    })

    test("returns keywords in lists when matched", () => {
      expectKeywords(m, "test hello hi", ["test"], ["hello", "hi"])
      expectKeywords(m, "hello I like to test things", ["test"], ["hello"])
      expectKeywords(m, "heckin heck", ["heck"])
    })
  })

  describe("regex keywords", () => {
    beforeEach(() => {
      m = new Microparsec([
        { name: "Regex", keywords: [/test/, /^Hello/, /ee+/] },
      ])
    })

    test("returns text without matches", () => {
      expectParsedText(m, "Doesn't match", "Doesn't match")
    })

    test("matches regex keywords directly", () => {
      expectParsedText(m, "test this", "this")
      expectParsedText(m, "Hello Hello World", "Hello World")
      expectParsedText(m, "Wheeeee", "Wh")
    })

    test("returns keywords match, not keywords themselves", () => {
      expectKeywords(m, "Wheee", ["eee"])
    })
  })
})
