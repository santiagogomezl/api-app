'use strict';

const youtubeKey = 'AIzaSyB6601I64jFHtM62Vs-qkh_iQsL-mQ-fTg';
const youtubeURL = 'https://www.googleapis.com/youtube/v3/';

const openMovieDBKey = '743e3c75';
const openMovieDBURL = 'https://www.omdbapi.com/';

const theAudioDBURL = 'https://www.theaudiodb.com/api/v1/json/1/';

function formatQueryParams(params){
    const queryKeys = Object.keys(params);
    const encodedQuery = queryKeys.map(
        key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        );
    return encodedQuery.join('&');
}

function reportError(errorType){
    //todo

    $('#js-playlist, .tracks-info, .movie-info').addClass('hidden');
    $('#js-error-message p').remove();

    const errors = {
        pageNotFound : 'Something went wrong. Page not found.',
        movieNotFound : 'No title found. Check <a href="https://www.imdb.com/" target="_blank">imdb.com</a> for a full list of all existing movies.',
        playlistNotFound : 'No soundtrack playlist found for this title. Check <a href="https://www.youtube.com/" target="_blank">youtube.com</a> for a full list of all playlists',
    }

    $('#js-error-message').removeClass('hidden')
    .append(
        `<p class="error-msg">
            ${errors[errorType]}
        </p>`
    );

}

function displayTracksInfo(tracksInfo){
    //Retrieves tracks info from Youtube to be displayed

    for(let i = 0 ;i < tracksInfo.items.length; i++){
        $('#js-tracks-list').append(
            `<li>${tracksInfo.items[i].snippet.title}</li>`    
        );
    }

    $('.tracks-info').removeClass('hidden');

}

function getTracksInfo(playlistId){
    //Get all tracks info

    const params = {
        part : 'snippet',
        playlistId : playlistId,
        maxResults : '50',
        key : youtubeKey 
    };

    const queryString = formatQueryParams(params);
    const url = youtubeURL + 'playlistItems?' + queryString;

    fetchResults(url,'tracksInfo');
}

function getPlaylistInfo(query){
    const params = {
        part : 'snippet',
        q: query + ' sountrack playlist',
        maxResults : '1',
        key : youtubeKey 
    };
    const queryString = formatQueryParams(params);
    const url = youtubeURL + 'search?' + queryString;
    fetchResults(url,'playlistInfo');
}

function displayMoviePlaylist(responseJson){

    if(responseJson.pageInfo.totalResults !== 0){

        const videoType = responseJson.items[0].id.kind;
        let playlistId = '';
        let url = '';

        if(videoType === 'youtube#playlist'){
            playlistId = responseJson.items[0].id.playlistId;
            //getTracksInfo(playlistId);
            url = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
        }else if(videoType === 'youtube#video'){
            playlistId = responseJson.items[0].id.videoId;
            url = `https://www.youtube.com/embed/${playlistId}`;
        }

        $('#js-playlist').empty().removeClass('hidden')
        .append(
        `<iframe width="800" height="450" 
        src="${url}" 
        frameborder="0" allow="accelerometer; autoplay; 
        encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen></iframe>`);

    }else{
        reportError('playlistNotFound');
    }
}

function displayMovieInfo(responseJson){
    //Display results

    
    if(responseJson.Response === "True"){

        const results = responseJson.Search;
        const titles = results.length;
        let posterURL = '';
 
        for(let i = 0 ; i < titles ; i++){
            if(results[i].Type === 'movie'){

                results[i].Poster === 'N/A' 
                ? posterURL = "./default-poster.jpg" 
                : posterURL = results[i].Poster;

                $('#js-movies-list').append(
                `<li name="${results[i].Title}" data-year="${results[i].Year}">
                        <a class="js-movie-link" href="#">
                        </a>
                    <img src=${posterURL} class="title-poster" alt="${results[i].Title} poster">
                    <p>
                        <span>${results[i].Year}</span><br>
                        ${results[i].Title}
                    </p> 
                </li>`);

                
            }else{
                i++;
            }
        }
        $('.movie-info').removeClass('hidden');
    }else{
        reportError('movieNotFound');
    }
}

function fetchResults(url,type){
    //Handles all fetch requests
    
    fetch(url)
    .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => {
        if(type === 'movieInfo'){displayMovieInfo(responseJson);}
        else if(type === 'playlistInfo'){displayMoviePlaylist(responseJson);}
        else if(type === 'tracksInfo'){displayTracksInfo(responseJson);}
    })
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    }); 
   
}

function getMovieInfo(query){
    //Request movie info
    const params = {
        s : query,
        apikey : openMovieDBKey
    };
    const queryString = formatQueryParams(params);
    const url = openMovieDBURL + '?' + queryString;
    
    fetchResults(url,'movieInfo');
}

function updateSiteURL(title){
    //todo: change url no reload
    $('#js-search-movie').val(title);
    window.history.pushState("", "", '/results.html?movie='+title);
}


function loadYoutubeInfo(){
    //Triggers youtube search after user has clicked on a movie option
    
    $('#js-movies-list').on('click', 'a', function(){
        $('#js-tracks-list, #js-playlist').empty();
        $('.tracks-info').addClass('hidden');
        const title = $(this).parent('li').attr('name');
        const year = $(this).parent('li').attr('data-year');
        updateSiteURL(title);
        getPlaylistInfo(title + ' ' + year);
    });
   
}

function watchForm(){
    //Trigger user search either through submitting form or URL param
    $('#js-error-message').addClass('hidden');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const movie = urlParams.get('movie');

    if(movie !== null){
        $('#js-search-movie').val(movie);
        getMovieInfo(movie);
    }else if(queryString !== ''){
        reportError('pageNotFound')
    }

    $('#js-soundtrack-form').on('submit', event => {
        event.preventDefault();
        $('#js-error-message, #js-playlist').addClass('hidden');
        $('#js-tracks-list, #js-playlist, #js-movies-list').empty();
        const movie = $('#js-search-movie').val();
        updateSiteURL(movie);
        getMovieInfo(movie);
    });
}

$(function(){
    //load functions
    loadYoutubeInfo();
    watchForm();
});