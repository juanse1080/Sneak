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
  setData(defaultData)

  const { portfolio, view } = defaultData[0]

  const images = await getImages(requestUrl.replace('london', portfolio))

  update({ portfolio }, document.getElementById('filters').querySelector(`[data-value="${portfolio}"]`))

  update({ view }, document.getElementById('views').querySelector(`[data-value="${view}"]`))
  pushImage(images)
}

function loadEvents() {
  const filters = document.getElementsByClassName('filter')

  for (let index = 0; index < filters.length; index++) {
    filters[index].addEventListener("click", async function (e) {
      const { value } = e.target.dataset
      update({ portfolio: value }, e.target)
      const images = await getImages(requestUrl.replace('london', value))
      pushImage(images)
    })
  }

  const views = document.getElementsByClassName('view')

  for (let index = 0; index < views.length; index++) {
    views[index].addEventListener("click", function (e) {
      const { value } = e.target.dataset
      update({ view: value }, e.target)
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

function getData() {
  const data = JSON.parse(localStorage.getItem("data"));
  return data;
}

function setData(value) {
  localStorage.setItem("data", JSON.stringify(value));
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
  let data = getData();
  let { portfolio: newPortfolio, view: newView } = newData;
  let url = window.location.toString();
  const hash = window.location.hash || data[0].hash

  data[0].hash = hash

  if (newPortfolio) {
    url = updateUrlParameter(url, "portfolio", newPortfolio);
    changeActive(document.getElementById("filters"), target);
    data[0].portfolio = newPortfolio;
  }

  if (newView) {
    url = updateUrlParameter(url, "view", newView);
    changeActive(document.getElementById("views"), target);
    data[0].view = newView;
  }

  const temp = [
    data[0],
    "page " + hash,
    url,
  ]

  setData(temp);

  history.pushState(...temp);
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

function changeActive(root, target) {
  const selected = root.querySelector(".active");

  if (selected) {
    selected.ariaSelected = "false";
    selected.classList.remove("active");
  }

  target.ariaSelected = "true";
  target.classList.add("active");
}


loadEvents()
loadData()

