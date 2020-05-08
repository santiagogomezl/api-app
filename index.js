'use strict';

const youtubeKey = 'AIzaSyB6601I64jFHtM62Vs-qkh_iQsL-mQ-fTg';
const youtubeURL = 'https://www.googleapis.com/youtube/v3/search';

const openMovieDBKey = '743e3c75';
const openMovieDBURL = 'http://www.omdbapi.com/';

const theAudioDBURL = 'https://www.theaudiodb.com/api/v1/json/1/';

function formatQueryParams(params){
    const queryKeys = Object.keys(params);
    const encodedQuery = queryKeys.map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        );
    return encodedQuery.join('&');
}

function displayTracksInfo(tracksInfo){

    for(let i = 0 ;i < tracksInfo.track.length; i++){
            
    $('.tracks-info ul').append(
        `<li>${tracksInfo.track[i].strTrack}</li>`    
    );

    }

    $('.tracks-info').removeClass('hidden');
}

function getTracksInfo(albumInfo){
    //Get all tracks info
    const albumId = albumInfo.album[0].idAlbum;

    const params = {
        m : albumId
    };
    const queryString = formatQueryParams(params);
    const url = theAudioDBURL + 'track.php?' + queryString;

    fetchResults(url,'tracksInfo');
}



function getAlbumInfo(query){
    //Get movie soundtrack details 
    //Todo: 
    const params = {
        a : query
    };
    const queryString = formatQueryParams(params);
    const url = theAudioDBURL + 'searchalbum.php?' + queryString;

    fetchResults(url,'albumInfo');
}

function displayMovieInfo(responseJson){
    //Display title metadata
    //Todo: Validate responseJson
    const title = responseJson.Title;
    const director = responseJson.Director;
    const posterURL = responseJson.Poster;

    $('.movie-info').empty()
    .append(
    `<h3>${title}</h3>
    <p>by: ${director}</p>
    <img src="${posterURL}" class="title-poster" alt="${title} poster">`)
    .removeClass('hidden');

    getAlbumInfo(title);

}

function fetchResults(url,type){
    //Todo: create function to handle all fetch request
    
    fetch(url)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        if(type === 'movieInfo'){displayMovieInfo(responseJson);}
        else if(type === 'albumInfo'){getTracksInfo(responseJson);}
        else if(type === 'tracksInfo'){displayTracksInfo(responseJson);}
    })
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    }); 
   
}

function getMovieInfo(query){
    //Request movie info
    //Todo: Validate and filter search results
    const params = {
        t : query,
        apikey : openMovieDBKey
    };
    const queryString = formatQueryParams(params);
    const url = openMovieDBURL + '?' + queryString;
    
    fetchResults(url,'movieInfo');
}

function watchForm(){
    //Capture user input i.e movie title
    //Todo: Validate input
    $('#js-soundtrack-form').on('submit', event => {
        event.preventDefault();
        const movieTitle = $('#js-search-movie').val();
        getMovieInfo(movieTitle);
    });
}

$(function(){
    //load functions
    watchForm();
});