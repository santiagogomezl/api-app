'use strict';

const youtubeKey = '';
const youtubeURL = '';
const openMovieDBKey = '743e3c75';
const openMovieDBURL = 'http://www.omdbapi.com/';

function formatQueryParams(params){
    const queryKeys = Object.keys(params);
    const encodedQuery = queryKeys.map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        );
    return encodedQuery.join('&');
}

function displayResults(responseJson){
    console.log(responseJson);
}

function getTitleInfo(query){
    //Request movie info
    //Todo: Validate and filter search results
    const params = {
        t : query,
        apikey : openMovieDBKey
    };
    const queryString = formatQueryParams(params);
    const url = openMovieDBURL + '?' + queryString;
    
    fetch(url)
    .then(response => {
        if (response.ok) {
        return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });

}

function watchForm(){
    //Capture user input i.e movie title
    //Todo: Validate input
    $('#js-soundtrack-form').on('submit', event => {
        event.preventDefault();
        const movieTitle = $('#js-search-title').val();
        getTitleInfo(movieTitle);
    });
}

$(function(){
    //load functions
    watchForm();
});