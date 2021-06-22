const requestUrl =
  'https://api.unsplash.com/search/photos?query=london&client_id=ozSSrsBNNbC6KZm4X9QCpRBlM_nm6PXursiuRyTPTYo';

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const defaultData = [
  {
    hash: window.location.hash || "#home",
    portfolio: params.portfolio || "all",
    view: params.view || "grid",
  },
  `page ${window.location.hash || "#home"}`,
  window.location.toString(),
]

async function loadData() {
  const images = await getImages(requestUrl.replace('london', defaultData[0].portfolio))

  update({ portfolio: defaultData[0].portfolio }, document.getElementById('filters').querySelector(`[data-value="${defaultData[0].portfolio}"]`))

  update({ view: defaultData[0].view }, document.getElementById('views').querySelector(`[data-value="${defaultData[0].view}"]`))
  console.log(document.getElementById('views'), document.getElementById('views').querySelector(`[data-value="${defaultData[0].view}"]`), defaultData[0].portfolio, defaultData[0].view)
  pushImage(images)
}

function loadEvents() {
  const filters = document.getElementsByClassName('filter')

  for (let index = 0; index < filters.length; index++) {
    filters[index].addEventListener("click", async function (e) {
      const { value } = e.target.dataset
      const data = getData(0)
      update({ ...data, portfolio: value }, e.target)
      const images = await getImages(requestUrl.replace('london', value))
      pushImage(images)
    })
  }

  const views = document.getElementsByClassName('view')

  for (let index = 0; index < views.length; index++) {
    views[index].addEventListener("click", function (e) {
      const { value } = e.target.dataset
      const data = getData(0)
      update({ ...data, view: value }, e.target)
    })
  }

  const bar = document.getElementById('bar')
  bar.addEventListener("click", function (e) {
    document.getElementById('bar-container').classList.toggle('d-flex')
  })

  document.addEventListener("mousedown", function (e) {
    if (e.target !== bar) {
      document.getElementById('bar-container').classList.remove('d-flex')
    }
  });

}

async function getImages(url) {
  loading()
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.results
    });
}

function getData(position, key) {
  const data = JSON.parse(localStorage.getItem("data"));
  if (position && key) return key[position][key];
  else if (position) return key[position];
  return key ? data[key] : data;
}

function setData(value, position, key) {
  if (position && key) {
    let beforeData = localStorage.getItem("data");
    beforeData[position] = { ...beforeData[position], [key]: value };
    localStorage.setItem("data", JSON.stringify(beforeData));
  } else if (position) {
    let beforeData = localStorage.getItem("data");
    beforeData[position] = { ...beforeData[position], ...value };
    localStorage.setItem("data", JSON.stringify(beforeData));
  } else {
    localStorage.setItem("data", JSON.stringify(value));
  }
}

function updateUrlParameter(uri, key, value) {
  var i = uri.indexOf("#");
  var hash = i === -1 ? "" : uri.substr(i);
  uri = i === -1 ? uri : uri.substr(0, i);

  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf("?") !== -1 ? "&" : "?";

  if (value === null) {
    uri = uri.replace(new RegExp("([?&]?)" + key + "=[^&]*", "i"), "");
    if (uri.slice(-1) === "?") {
      uri = uri.slice(0, -1);
    }
    if (uri.indexOf("?") === -1) uri = uri.replace(/&/, "?");
  } else if (uri.match(re)) {
    uri = uri.replace(re, "$1" + key + "=" + value + "$2");
  } else {
    uri = uri + separator + key + "=" + value;
  }
  return uri + hash;
}

function update(newData, target) {
  let { portfolio, view } = getData(0);
  let { portfolio: newPortfolio, view: newView } = newData;
  let url = window.location.toString();

  console.log(target)

  if (portfolio === newPortfolio && view === newView) {
    return;
  }

  if (portfolio !== newPortfolio) {
    url = updateUrlParameter(url, "portfolio", newPortfolio);
    changeActive(document.getElementById("filters"), "portfolio", target);
  }

  if (view !== newView) {
    url = updateUrlParameter(url, "view", newView);
    changeActive(document.getElementById("views"), "view", target);
  }

  const data = [
    {
      hash: window.location.hash,
      portfolio: newPortfolio,
      view: newView,
    },
    "page " + window.location.hash,
    url,
  ]

  setData(data);

  history.pushState(...data);
}

function pushImage(images) {
  const root = document.getElementById('images')

  const content = images.reduce((acc, curr, index) => acc + `
    <div class="portfolio-grid-item item-${index}">
      <div style="background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${curr.urls.regular})" data-label="${curr.alt_description}" class="responsive-img"></div>
    </div>
  `, '')

  root.innerHTML = content;
}

function loading() {
  const root = document.getElementById('images')

  const content = new Array(10).fill(0).reduce((acc, _, index) => acc + `
    <div class="portfolio-grid-item item-${index}">
      <div class="pulse"></div>
    </div>
  `, '')

  root.innerHTML = content;
}

function changeActive(root, key, target) {
  const selected = root.querySelector(".active");

  if (selected && selected.dataset.value === getData(0, key)) {
    return;
  }

  if (selected) {
    selected.ariaSelected = "false";
    selected.classList.remove("active");
  }

  target.ariaSelected = "true";
  target.classList.add("active");
}


loadEvents()
loadData()

