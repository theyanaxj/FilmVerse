const API_KEY = "ec31861437ccd5379e2c1c78c01b2bce";
const API_ROOT = "https://api.themoviedb.org/3";
const IMG = (path, w=500) => path ? `https://image.tmdb.org/t/p/w${w}${path}` : "";


const heroEls = { title: document.getElementById("hero-title"), overview: document.getElementById("hero-overview"), link: document.getElementById("hero-link"), backdrop: document.getElementById("hero-backdrop") };
const rows = { trending: document.getElementById("row-trending"), popular: document.getElementById("row-popular"), toprated: document.getElementById("row-toprated"), now: document.getElementById("row-now"), genre: document.getElementById("row-genre"), search: document.getElementById("row-search"), news: document.getElementById("row-news") };
const genreMenu = document.getElementById("genreMenu");
const genreSection = document.getElementById("genre-result-section");
const genreTitle = document.getElementById("genre-result-title");
const searchSection = document.getElementById("search-result-section");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const newsSection = document.getElementById("news-section");
const newsTitle = document.getElementById("news-title");


const getJSON = async (endpoint, params={}) => {
  const url = new URL(API_ROOT + endpoint);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "th-TH");
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v));
  const res = await fetch(url);
  if(!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
};


const buildCardHTML = (item) => {
  const title = item.title || item.name || "Untitled";
  const date = (item.release_date || item.first_air_date || "").slice(0,4);
  const rating = (item.vote_average ?? 0).toFixed(1);
  const poster = item.poster_path ? IMG(item.poster_path,342) : "";
  let href = "#";
  if(item.id){ href = item.media_type==="tv"||item.first_air_date?`https://www.themoviedb.org/tv/${item.id}`:`https://www.themoviedb.org/movie/${item.id}`; }
  return `<a class="card" href="${href}" target="_blank" rel="noopener">${poster?`<img src="${poster}" alt="${title}">`:`<div style="height:220px;display:flex;align-items:center;justify-content:center;color:#888;background:#101018">No Poster</div>`}<div class="meta"><div class="title" title="${title}">${title}</div><div class="sub"><span>${date||"-"}</span><span class="badge">★ ${rating}</span></div></div></a>`;
};
const fillRow = (el, items=[]) => el.innerHTML = items.filter(x=>x.poster_path).map(buildCardHTML).join("");


const loadHero = async () => {
  const data = await getJSON("/trending/movie/week",{page:1});
  const movie = data.results?.[0];
  if(!movie) return;
  heroEls.title.textContent = movie.title;
  heroEls.overview.textContent = movie.overview||"";
  heroEls.link.href = `https://www.themoviedb.org/movie/${movie.id}`;
  if(movie.backdrop_path) heroEls.backdrop.style.backgroundImage = `url(${IMG(movie.backdrop_path,1280)})`;
};


const loadAllRows = async () => {
  const [trend,pop,top,nowPlaying,upcoming] = await Promise.all([
    getJSON("/trending/all/week",{page:1}),
    getJSON("/movie/popular",{page:1}),
    getJSON("/movie/top_rated",{page:1}),
    getJSON("/movie/now_playing",{page:1}),
    getJSON("/movie/upcoming",{page:1}),
  ]);
  fillRow(rows.trending,trend.results);
  fillRow(rows.popular,pop.results);
  fillRow(rows.toprated,top.results);
  fillRow(rows.now,[...nowPlaying.results,...upcoming.results]);
};


const loadGenres = async () => {
  const g = await getJSON("/genre/movie/list");
  genreMenu.innerHTML = g.genres.map(gn=>`<a href="#" data-genre="${gn.id}">${gn.name}</a>`).join("");
  genreMenu.querySelectorAll("a").forEach(a=>{
    a.addEventListener("click",async e=>{
      e.preventDefault();
      const id=a.dataset.genre;
      genreTitle.textContent = `หมวดหมู่: ${a.textContent}`;
      genreSection.hidden=false;
      const data = await getJSON("/discover/movie",{with_genres:id,sort_by:"popularity.desc",include_adult:"false",page:1});
      fillRow(rows.genre,data.results);
      window.scrollTo({top:genreSection.offsetTop-70,behavior:"smooth"});
    });
  });
};


document.querySelectorAll('[data-news]').forEach(btn=>{
  btn.addEventListener("click",async e=>{
    e.preventDefault();
    const type = btn.dataset.news;
    newsSection.hidden=false;
    newsTitle.textContent = type==="new-movies"?"ข่าวหนังใหม่":type==="actors"?"ข่าวนักแสดง":"บทความพิเศษ";
    let data;
    if(type==="new-movies") data = await getJSON("/movie/now_playing",{page:1});
    else if(type==="actors") data = await getJSON("/person/popular",{page:1});
    else data = await getJSON("/trending/all/week",{page:1});
    fillRow(rows.news,data.results||[]);
    window.scrollTo({top:newsSection.offsetTop-70,behavior:"smooth"});
  });
});


searchForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const q = searchInput.value.trim();
  if(!q) return;
  const data = await getJSON("/search/multi",{query:q,include_adult:"false",page:1});
  document.getElementById("search-result-section").hidden=false;
  fillRow(rows.search,data.results);
  window.scrollTo({top:document.getElementById("search-result-section").offsetTop-70,behavior:"smooth"});
});


(async function init(){
  try{
    await Promise.all([loadHero(),loadAllRows(),loadGenres()]);
  }catch(err){console.error(err);alert("เกิดข้อผิดพลาดในการดึงข้อมูลจาก TMDb");}
})();
