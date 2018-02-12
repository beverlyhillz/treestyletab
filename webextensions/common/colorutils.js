
const colorCache = new Map();

function getHostnameColor(hostname) {
  if (colorCache.size === 0) {
    rebuildColorCache();
  }
  return colorCache.has(hostname) ? colorCache.get(hostname) : null;
}


function getHostname(url) {
  const parsed = new URL(url);

  if (parsed.hostname) {
    const parts = parsed.hostname.split('.');
    if (parts.length === 1) {
      return parts[0];
    }
    else {
      return parts.slice(-2).join('.');
    }
  }
  else {
    return url;
  }
}


function rebuildColorCache() {
  colorCache.clear();

  const hosts = configs.hostnameColors
    .split('\n')
    .filter((line) => !line.startsWith('//'))
    .map((line) => line.split(';').map((item => item.trim())));

  for (let [color, hostname] of hosts) {
    if (color === undefined || hostname === undefined) {
      continue;
    }

    if (!color.startsWith('#')) {
      color = Number.parseInt(color);

      if (Number.isNaN(color)) {
        continue;
      }
    }
    colorCache.set(hostname, color);
  }
}


function onConfigChange(aChangedKey) {
  switch (aChangedKey) {
    case 'hostnameColors':
      rebuildColorCache();
      break;
  }
}

configs.$addObserver(onConfigChange);



// https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
function hashString(s) {
  let hash = 0;
  if (s.length === 0) {
    return hash;
  }
  for (let letter of s) {
    const char = letter.charCodeAt(0);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

// https://gist.github.com/mjackson/5311256
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h, s, l };
}

// https://stackoverflow.com/a/5624139
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}