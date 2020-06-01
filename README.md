# About

This package provides a function which will extract text color value from predefined array of color like values.

- Comparison of the words is case-insensitive.
- Word separators are space, start/end of strong, trailing plus sign.

## Example

**"My favourite color is purple"**
will result in
**"purple"**

## Usage

Default language to use is english

```javascript
const text = 'My favourite color is purple';
const color = extractColor(text); // purple

const text = 'No color specified';
const color = extractColor(text); // ''
```

Using different language is possible by providing second parameter to the _extractColor_ function.

```javascript
const text = 'My favourite color is goud';
const color = extractColor(text, 'be'); // goud
```

## Supported languages

- **en** - english, the default one
- **be** - belgium
