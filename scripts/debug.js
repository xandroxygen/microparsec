const Microparsec = require("../index")

const text = "Hello World!"
const parser = new Microparsec(["Hello", "!"])

const result = parser.parse(text)
console.log({ result })
