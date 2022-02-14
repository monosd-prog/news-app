// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
// Init http module
const http = customHttp();

//Самовызывающая функция с парметрами для NewsAPI
const newsService = (function (){
    const apiKey = 'ced64c430f3144988c19782a481c5d26'
    const apiUrl = 'https://newsapi.org/v2'

    return {
        topHeadlines(country = 'ru', cb){
            http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb)
        },
        everything(query, cb){
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
        }
    }
})()

//Elements
const form = document.forms['newsControls']
const countrySelect = form.elements['country']
const searchInput = form.elements['search']

form.addEventListener('submit', (e) => {
    e.preventDefault()
    loadNews()
})


//  init selects
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews()
});

//Load News Function
function loadNews(){
    const country = countrySelect.value
    const searchText = searchInput.value
    showPreloader()
    if (!searchText){
        newsService.topHeadlines(country, onGetResponse)
    }else{
        newsService.everything(searchText, onGetResponse)
    }
}

//Function on get response from server
function onGetResponse(error, res){
    removePreloader()
    if (error){
        showAlert(error,'error-msg rounded')
        return
    }
    //Проверка на пустые новости
    if (!res.articles.length){
        showAlert('Нет новостей')
        return
    }
    renderNews(res.articles)
}

//Function render news
function renderNews(news){
    const newsContainer = document.querySelector(".news-container .row")
    if (newsContainer.children.length){
        clearContainer(newsContainer)
    }
    let fragment = ''
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem)
        fragment += el
    })
    newsContainer.insertAdjacentHTML('afterbegin', fragment)
}

//FUNCTION cleat container
function clearContainer(container){
    //container.innerHTML = ''
    let child = container.lastElementChild
    while (child){
        container.removeChild(child)
        child = container.lastElementChild
    }
}

// News Item template function (Принимает деструктурированый объект news)
function newsTemplate({urlToImage, url, title, description}){
    return `
        <div class = "col s12">
            <div class = "card">
                <div class="card-image">
                    <img src="${urlToImage}" alt="${title}">
                </div>                
                <div class="card-content">
                    <span class="card-title">${title || ''}</span>
                    <p>${description || ''}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Перейти на источник</a>
                </div>
            </div>
        </div>
    `
}

//Function show alert
function showAlert(msg,type = 'success'){
    M.toast({html: msg, classes: type})
}

function showPreloader(){
    document.body.insertAdjacentHTML('afterbegin',`
    <div class="progress">
        <div class="indeterminate"></div>
    </div>
    `)
}

function removePreloader(){
    const loader = document.querySelector('.progress')
    if (loader){
        loader.remove()
    }
}