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

function displayTracksInfo(tracksInfo){
    //Retrieves tracks info from Youtube to be displayed

    $('.tracks-info ul').empty();

    for(let i = 0 ;i < tracksInfo.items.length; i++){

    $('.tracks-info ul').append(
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

// function getAlbumInfo(query){
//     //Get movie soundtrack details 
//     //Todo: 
//     const params = {
//         a : query
//     };
//     const queryString = formatQueryParams(params);
//     const url = theAudioDBURL + 'searchalbum.php?' + queryString;

//     fetchResults(url,'albumInfo');
// }

function getPlaylistInfo(query){
    const params = {
        part : 'snippet',
        q: query + ' OST playlist',
        maxResults : '1',
        key : youtubeKey 
    };
    const queryString = formatQueryParams(params);
    const url = youtubeURL + 'search?' + queryString;

    fetchResults(url,'playlistInfo');
}

function displayMoviePlaylist(responseJson){

   const playlistId = responseJson.items[0].id.playlistId;

    $('.soundtrack-playlist').empty()
    .append(
    `<iframe width="560" height="315" 
    src="https://www.youtube.com/embed/videoseries?list=${playlistId}" 
    frameborder="0" allow="accelerometer; autoplay; 
    encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen></iframe>`)
    .removeClass('hidden');

    getTracksInfo(playlistId);

}

function displayMovieInfo(responseJson){
    //Display title metadata
    //Todo: Validate responseJson
    const results = responseJson.Search;
    let titles = 0;
    results.length > 4 ?  titles = 4 :  title = results.length; 

    $('.movie-info ul').empty();

    for(let i = 0 ; i < titles ; i++){

        $('.movie-info ul').append(
        `<li name="${results[i].Title}" data-year="${results[i].Year}">
            <img src="${results[i].Poster}" class="title-poster" alt="${results[i].Title} poster">
            <h3>${results[i].Title}</h3>
            <p>${results[i].Year}</p>
        </li>`);

    }

    $('.movie-info').removeClass('hidden');

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
    //Todo: Validate and filter search results
    const params = {
        s : query,
        apikey : openMovieDBKey
    };
    const queryString = formatQueryParams(params);
    const url = openMovieDBURL + '?' + queryString;
    
    fetchResults(url,'movieInfo');
}

function loadYoutubeInfo(){
    //Triggers youtube serach after user has clicked on a movie option
    $('#js-movies-list').on('click', 'img', function(){
        $(this).parent('li').siblings().remove();
        const title = $(this).parent('li').attr('name');
        const year = $(this).parent('li').attr('data-year');
        getPlaylistInfo(title + ' ' + year);
        // getAlbumInfo(title);
    });
   
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
    loadYoutubeInfo();
    watchForm();
});