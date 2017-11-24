const Microparsec = require("../index")

const text = "Hello World!? wheee wheee"
const parsers = [
  {
    name: "Goodbye",
    keywords: [/ee+/],
  },
]
const parser = new Microparsec(parsers)

const result = parser.parse(text)
console.log({ result })
