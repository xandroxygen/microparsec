# microparsec

> Bare-bones text processing using keywords and regex

Extract words, special characters, or regex matches from strings of test using
this simple text parser. Inspired by Todoist's Quick Add feature, which uses NLP
(Natural Language Processing) to extract dates, projects, and other keywords.

Give `microparsec` lists of keywords or regex you want
found and extracted, and some text to parse. It will return lists of keywords it
found or regex it matched, along with the rest of the string input.

## Installation

---

**yarn:**

```
yarn add microparsec
```

**npm:**

```
npm i --save microparsec
```

## Usage

---

`microparsec` takes the keywords it's given and searches for their last
occurrence, using this case-insensitive regular expresssion:
`/\bkeyword\b(?!.*\bkeyword\b)/i`. Keywords can have spaces in them. If a
regular expression is passed in place of a keyword, the input is matched
directly against that regex.

Initialize `microparsec` with the keywords you want parsed out, which can take
the form of:

* a string

```js
new Microparsec("keyword")
```

* a regex

```js
new Microparsec(/regex/)
```

* an array of strings or regexes

```js
new Microparsec(["key", "word", /regex/])
```

* a parser object, containing a name and list of keywords

```js
new Microparsec({ name: "What", keywords: ["the", /heck/] })
```

* an array of parser objects

```js
new Microparsec([
  { name: "What", keywords: ["the", /heck/] },
  { name: "Goodbye", keywords: ["hello", "hi"] },
])
```

Once initialized, you can parse any input string and expect a result like this:

```js
const parser = new Microparsec("Hello")
const result = parser.parse("Hello World!")
console.log(result)
/*
{
  matches: [
    {
      name: "Default",
      matches: [{
        match: "Hello",
        replaceWith: "%0"
      }]
    }
  ],
  leftovers: "World!",
  interpolated: "%0 World!"
}
*/
```

Any parser that had a match is returned with all its matches, and the rest of
the unmatched string is returned as `leftovers`, trimmed of excess whitespace.

The original parsed text is returned as `interpolated`, with the matched keywords
replaced by symbols such as `%0` or `%1`. These symbols correspond to the
`replaceWith` field in each match object.

Parsers without a match do not appear in the result. Matches against regex
keywords return the text that matched, not the regex itself.

```js
const parser = new Microparsec([
  { name: "One", keywords: [/ee+/] },
  { name: "Two", keywords: ["What", "the"] },
  { name: "Three", keywords: ["no", "matches"] },
])
const result = parser.parse("What the wheeeee is that?")
console.log(result)
/*
{
  matches: [
    {
      name: "One",
      matches: [{
        match: "eeeee",
        replaceWith: "%0"
      }]
    },
    {
      name: "Two",
      matches: [
      {
        match: "What",
        replaceWith: "%1"
      },
      {
        match: "the",
        replaceWith: "%2"
      }]
    }
  ],
  leftovers: "wh is that?",
  interpolated: "%1 %2 wh%0 is that?"
}
*/
```

## Development

---

```
yarn install
yarn test
```
