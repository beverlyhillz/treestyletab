const factor = 15;

// https://stackoverflow.com/a/13419367
function parseQuery(queryString) {
  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

document.querySelector('#color').addEventListener('change', (event) => {
  console.log(event)
  document.querySelector('#preview').style.backgroundColor = event.target.value;
}, true);

document.querySelector('#submit').addEventListener('click', () => {
  const color = document.querySelector('#color').value;
  console.log(query, tabId, color, window);

  browser.runtime.sendMessage({
    type: kCOMMAND_SET_COLOR,
    tab: tabId,
    color: color
  })
});

document.querySelectorAll('.preset').forEach((preset) => preset.addEventListener('click', (e) => {
  browser.runtime.sendMessage({
    type: kCOMMAND_SET_COLOR,
    tab: tabId,
    color: e.target.dataset.value * factor,
  });
}));


document.querySelectorAll('.preset').forEach((element) => {
  element.style.backgroundColor = `hsl(${element.dataset.value * factor}, 50%, 50%)`;
  element.textContent = element.dataset.value * factor;
});

const query = parseQuery(window.location.search);
const tabId = query['tab'];
