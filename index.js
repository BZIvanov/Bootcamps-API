const englishColors = [
  'antra blue',
  'anthracite grey',
  'anthracite blue',
  'ark blue',
  'aura glow',
  'aura black',
  'breathing crystal',
  'carbon grey',
  'charcoal grey',
  'cloud pink',
  'cosmic black',
  'crystal pink',
  'cyan green',
  'dark blue',
  'denim grey',
  'glacier blue',
  'midnight black',
  'midnight green',
  'misty lavender',
  'prism black',
  'prism white',
  'rose gold',
  'space blue',
  'space grey',
  'steel black',
  'anthracite',
  'black',
  'blue',
  'brown',
  'charcoal',
  'crystal',
  'coral',
  'gold',
  'graphite',
  'green',
  'grey',
  'gunmetal',
  'ice',
  'iron',
  'pink',
  'red',
  'orange',
  'oxygen',
  'purple',
  'sand',
  'silver',
  'spacegrey',
  'steel',
  'white',
  'wit',
  'yellow',
];

const belgiumColors = [
  'antra blue',
  'anthracite grey',
  'anthracite blue',
  'ark blue',
  'aura glow',
  'aura black',
  'breathing crystal',
  'carbon grey',
  'charcoal grey',
  'cloud pink',
  'cosmic black',
  'crystal pink',
  'cyan green',
  'dark blue',
  'denim grey',
  'glacier blue',
  'midnight black',
  'midnight green',
  'misty lavender',
  'prism black',
  'prism white',
  'rose gold',
  'rosé goud',
  'space blue',
  'space grey',
  'steel black',
  'anthracite',
  'black',
  'blue',
  'brown',
  'charcoal',
  'crystal',
  'coral',
  'gold',
  'goud',
  'graphite',
  'green',
  'grey',
  'gunmetal',
  'ice',
  'iron',
  'koraal',
  'pink',
  'red',
  'roségoud',
  'rozegoud',
  'orange',
  'oxygen',
  'purple',
  'sand',
  'silver',
  'spacegrey',
  'steel',
  'white',
  'wit',
  'yellow',
  'zwart',
];

function selectColorsLanguage(language) {
  switch (language) {
    case 'en':
      return englishColors;
    case 'be':
      return belgiumColors;
    default:
      return englishColors;
  }
}

function extractColor(text, language = 'en') {
  const chosenColors = selectColorsLanguage(language);

  for (const color of chosenColors) {
    const re = new RegExp(`(?<=\\s|^)${color}(?=\\s|$|\\+)`, 'i');

    const match = text.match(re);
    if (match) {
      return match[0];
    }
  }
  return '';
}
