import { ids } from './enums';

export async function render(): Promise<void> {
    const baseURL  = 'https://api.themoviedb.org/3/';
    const APIKEY  = '1ea13be12fc8832818b31d5f22470b9c';
    let baseImageURL : any = null;
    let configData = null;

    let page = 1;

    const filmContainer = <HTMLDivElement>document.getElementById('film-container');
    const cardContainer = <HTMLDivElement>document.querySelector('.movie-card');
    const radiosDiv = <HTMLDivElement>document.getElementById('button-wrapper');
    let cards = filmContainer.querySelectorAll('.card');
    const cardsText = <HTMLCollectionOf<HTMLParagraphElement>>document.getElementsByClassName('card-text');
    const date = document.getElementsByClassName('text-muted');
    const submit = <HTMLButtonElement>document.getElementById('submit');
    const more = <HTMLButtonElement>document.getElementById('load-more');
    let svg = <NodeListOf<SVGSVGElement>>document.querySelectorAll('svg');

    const getConfig = function () {
        const url = ''.concat(baseURL, 'configuration?api_key=', APIKEY);
        fetch(url)
            .then((result)=>{
                return result.json();
            })
            .then((data)=>{
                baseImageURL = data.images.secure_base_url.toString();
                configData = data.images;
                console.log('config:', data);
                console.log('config fetched');
                loadFilms('movie/popular?api_key=');
                randomFilm();
            })
            .catch(function(err){
                alert(err);
            });
    }

    const loadFilms = function (link: string) {
        const url = ''.concat(baseURL, link, APIKEY, '&language=en-US&page=', page.toString());
        fetch(url)
            .then(result=>result.json())
            .then((data)=>{
                console.log(data);
                changePosters(data);
            });
    }

    const randomFilm = function () {
        const random = Math.floor(Math.random() * 20);
        const url = ''.concat(baseURL, 'find/', random.toString(), '?api_key=', APIKEY, '&language=en-US&external_source=imdb_id');
        fetch(url)
            .then(result=>result.json())
            .then((data)=>{
                console.log(data);
            });
    }


    more.addEventListener('click', function(){
        page++;
        checkRadioButton();
    });

    const searchFilm = function (filmName: string) {
        const url = ''.concat(baseURL, 'search/movie?api_key=', APIKEY, '&query=', filmName);
        fetch(url)
            .then(result=>result.json())
            .then((data)=>{
                console.log(data);
                changePosters(data);
            })
    }

    submit.addEventListener('click', function(){
        const filmInput = <HTMLInputElement>document.getElementById('search');
        searchFilm(filmInput.value);
    });


    radiosDiv.addEventListener('change', function(){
        page = 1;
        if(filmContainer.querySelectorAll('.movie-card').length > 20){
            const containerChildNodes = filmContainer.querySelectorAll('.movie-card');
            for(let  i = 20; i < containerChildNodes.length; i ++){
                containerChildNodes[i].remove()
            }
        }
        checkRadioButton();
    });

    function checkRadioButton(){
        const radios = radiosDiv.querySelectorAll('input[type="radio"]');

        for(const radio of radios){
            if(radio.checked){
                switch (radio.id){
                    case ids.popular:
                        loadFilms('movie/popular?api_key=');
                        break
                    case ids.upcoming:
                        loadFilms('movie/upcoming?api_key=')
                        break
                    case ids.top_rated:
                        loadFilms('movie/top_rated?api_key=')
                        break
                }
            }
        }
    }


    function changePosters(data: any){
        const item = data.results[Math.floor(Math.random() * data.results.length)];
        header(item);
        if(page != 1){
            for(let i = 0 ; i < 20; i++){
                filmContainer.appendChild(cardContainer.cloneNode(true));
            }
        }

        cards = filmContainer.querySelectorAll('.card');
        svg = <NodeListOf<SVGSVGElement>>document.querySelectorAll('svg');

        let index = 0;
        for (let i = (page - 1) * 20; i < cards.length; i++) {
            const children = cards[i].children;
            for (const child of children) {
                if(child.nodeName == 'IMG'){
                    child.setAttribute('src', ''.concat((baseImageURL as string), 'original', data.results[index].poster_path));
                    cardsText[i].innerHTML = data.results[index].overview;
                    date[i].innerHTML = data.results[index].release_date;
                    svg[i].setAttribute('id', data.results[index].id);

                    if(localStorage.getItem(svg[i].getAttribute('id')) != null)
                        svg[i].setAttribute('fill', 'red');

                    else
                        svg[i].setAttribute('fill', '#ff000078');
                }
            }
            index++;
        }
    }

    for (const el of svg){
        el.setAttribute('fill', '#ff000078');
        el.addEventListener('mousedown', function(){
            let id: string | null;
            if(el.hasAttribute('id'))
                id = el.getAttribute('id');
            else
                id = null;
            el.setAttribute('fill', toggleFill(el.getAttribute('fill'), id))
        });
    }

    function toggleFill(fill: string, id: string): string{
        if(fill == '#ff000078'){
            if(id != null)
                localStorage.setItem(id, id);
            return 'red'
        }
        else{
            if(id != null)
                localStorage.removeItem(id);
            return '#ff000078'
        }
    }

    function header(data: any){
        const name = <HTMLHeadingElement>document.getElementById('random-movie-name');
        name.innerHTML = data.title;

        const description = <HTMLParagraphElement>document.getElementById('random-movie-description');
        description.innerHTML = data.overview;

        const container = <HTMLElement>document.getElementById('random-movie');
        container.style.backgroundImage = `url(${baseImageURL}original${data.backdrop_path})`;
        container.style.backgroundSize = '100%';
    }
    document.addEventListener('DOMContentLoaded', getConfig);
}
