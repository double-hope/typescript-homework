import { ids } from './enums';
import { APIKEY } from './api';

const baseURL : string  = 'https://api.themoviedb.org/3/';
let baseImageURL : string | null = null;

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
const favourites = <HTMLDivElement>document.getElementById('favorite-movies');
const favouritesContainer = <HTMLDivElement>favourites.querySelector('.favorite-movies');
const favouriteCard = <HTMLDivElement>favouritesContainer.querySelector('.card');
favouriteCard.remove();

interface iMovie{
    id: number;
    poster_path: string;
    backdrop_path: string;
    title: string;
    overview: string;
    release_date: string;
}

export async function render(): Promise<void> {

    async function getConfig () {
        const url = ''.concat(baseURL, 'configuration?api_key=', APIKEY);
        try{
            const response = await fetch(url);
            const data = await response.json();
            baseImageURL = data.images.secure_base_url.toString();
            console.log('config:', data);
            console.log('config fetched');
            await loadFilms('movie/popular?api_key=');
        }
        catch (e){
            alert(e);
        }

    }

    async function loadFilms (link: string) {
        const url = ''.concat(baseURL, link, APIKEY, '&language=en-US&page=', page.toString());
        const response = await fetch(url);
        const data = await response.json();
        const result = new Array<iMovie>();
        for(let i = 0; i < data.results.length; i++){
            const res: iMovie = {
                id: data.results[i].id,
                poster_path: data.results[i].poster_path,
                backdrop_path: data.results[i].backdrop_path,
                title: data.results[i].title,
                overview: data.results[i].overview,
                release_date: data.results[i].release_date
            }
            result.push(res);
        }
        changePosters(result);
    }

    async function searchFilm (filmName: string) {
        const url = ''.concat(baseURL, 'search/movie?api_key=', APIKEY, '&query=', filmName);
        const response = await fetch(url);
        const data = await response.json();
        const result = new Array<iMovie>();
        for(let i = 0; i < data.results.length; i++){
            const res: iMovie = {
                id: data.results[i].id,
                poster_path: data.results[i].poster_path,
                backdrop_path: data.results[i].backdrop_path,
                title: data.results[i].title,
                overview: data.results[i].overview,
                release_date: data.results[i].release_date
            }
            result.push(res);
        }
        await changePosters(result);
    }

    async function getInfoById (id: number) {
        const url = ''.concat(baseURL, 'movie/', id.toString(), '?api_key=', APIKEY, '&language=en-US');
        const response = await fetch(url);
        const data = await response.json();

        const res: iMovie = {
            id: data.id,
            poster_path: data.poster_path,
            backdrop_path: data.backdrop_path,
            title: data.title,
            overview: data.overview,
            release_date: data.release_date
        }

        return res;
    }

    more.addEventListener('click', function(){
        page++;
        checkRadioButton();
    });


    submit.addEventListener('click', function(){
        const filmInput = <HTMLInputElement>document.getElementById('search');
        searchFilm(filmInput.value);
    });

    radiosDiv.addEventListener('change', function(){
        page = 1;
        const filmInput = <HTMLInputElement>document.getElementById('search');
        filmInput.value = '';
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

    function changePosters(data: iMovie[]){

        const item = data[Math.floor(Math.random() * data.length)];
        setHeader(item);

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
                    child.setAttribute('src', ''.concat((baseImageURL as string), 'original', data[index].poster_path));
                    cardsText[i].innerHTML = data[index].overview;
                    date[i].innerHTML = data[index].release_date;
                    svg[i].setAttribute('id', data[index].id.toString());

                    const localSetItem: string | null = localStorage.getItem(data[index].id.toString());
                    if (localSetItem != null) {
                        svg[i].setAttribute('fill', 'red');
                        checkExists(data[index].id);
                    }else{
                        svg[i].setAttribute('fill', '#ff000078');
                    }

                }
            }
            index++;
        }
    }


    function toggleFill(fill: string, id: number): string{
        if(fill == '#ff000078'){
            if(id != null){
                localStorage.setItem(id.toString(), id.toString());
                addFavourites(id);
            }
            // checkStorage(id);
            return 'red'
        }
        else{
            if(id != null){
                localStorage.removeItem(id.toString());
                deleteFavourites(id);
            }
            // checkStorage(id);

            return '#ff000078'
        }
    }

    function setHeader(data: iMovie){

        const name = <HTMLHeadingElement>document.getElementById('random-movie-name');
        name.innerHTML = data.title;

        const description = <HTMLParagraphElement>document.getElementById('random-movie-description');
        description.innerHTML = data.overview;

        const container = <HTMLElement>document.getElementById('random-movie');
        container.style.backgroundImage = `url(${baseImageURL}original${data.backdrop_path})`;
        container.style.backgroundSize = '100%';
    }

    function addFavourites(id: number) {
        const el = favouriteCard.cloneNode(true);

        getInfoById(id)
            .then(data =>
            {
                for (const child of el.childNodes) {
                    if(child.nodeName == 'IMG') {
                        child.setAttribute('src', ''.concat((baseImageURL as string), 'original', data.poster_path));
                    }
                    else if(child.nodeName == 'svg'){
                        child.setAttribute('fill', 'red');
                        child.setAttribute('id', data.id);
                    }
                    else if(child.nodeName == 'DIV'){
                        for (const elements of child.childNodes){
                            if(elements.nodeName == 'P') {
                                child.innerHTML = data.overview;
                            }
                        }
                    }
                }

            });
        favouritesContainer.appendChild(el);
    }

    function deleteFavourites(id: number) {
        for (const child of favouritesContainer.children){
            for(const element of child.children){
                if(element.nodeName == 'svg'){
                    if(element.getAttribute('id') == id.toString()){
                        child.remove();
                        break;
                    }
                }
            }
        }
    }

    function checkExists(id: number){
        for (const child of favouritesContainer.children){
            for(const element of child.children){
                if(element.nodeName == 'svg'){
                    if(element.getAttribute('id') == id.toString()){
                        return;
                    }
                }
            }

        }

        addFavourites(id);
    }

    for (const el of svg){
        el.setAttribute('fill', '#ff000078');
        el.addEventListener('mousedown', function(){
            let id: number | null;
            (el.hasAttribute('id')) ? id = parseInt(el.getAttribute('id'))  : id = null;
            el.setAttribute('fill', toggleFill(el.getAttribute('fill'), id))
        });
    }

    await document.addEventListener('DOMContentLoaded', getConfig);
}
