const Microparsec = require("../index")

const text = "Hello World!? wheee wheee the what"
const parsers = [
  {
    name: "Goodbye",
    keywords: ["Hello", "wheee"],
  },
  {
    name: "Other",
    keywords: ["what"],
  },
]
const parser = new Microparsec(parsers)

const result = parser.parse(text)
console.log({ result })

const again = parser.parse(text)
console.log({ again })
