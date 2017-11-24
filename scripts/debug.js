const Microparsec = require("../index")

const text = "Hello World!?"
const parsers = [
  {
    name: "Goodbye",
    keywords: ["Hello", "Hi"],
  },
  {
    name: "What the",
    keywords: ["heck"],
  },
]
const parser = new Microparsec(parsers)

const result = parser.parse(text)
console.log({ result })
