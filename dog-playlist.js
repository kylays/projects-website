/**
 * NAME: Kyla Yu-Swanson
 * DATE: May 15, 2022
 * 
 * This is the JS file for the dog playlist. It handles button click events, 
 * web page load events, and fetches data from Dog API and Spotify API.
 */
(function () {
    "use strict";

    const DOG_URL = "https://dog.ceo/api/";
    const CLIENT_ID = "9ae0f4eda5b340ba8a442a34d1c34615";
    const CLIENT_SECRET = "97b89b5a83114fa197cb526f38692869";
    const MAX_OFFSET = 500;
    const GENRE = 'indie';

    /**
     * Runs the needed functions for the website upon starting.
     */
    function init() {
        id("new-dp-btn").addEventListener("click", generatePlaylist);
        generatePlaylist();
    }

    /**
     * Handles the promise error if occurs.
     * @return {Promise} - error response
     */
    function checkStatus(response) {
        if (!response.ok) {
            throw Error("Error in request: " + response.statusText);
        }
        return response;
    }

    /**
      * This function is called when an error occurs in the fetch call chain (e.g. the request
      * returns a non-200 error code, such as when the API service is down). 
      * @param {Error} err - the err details of the request.
      */
    function handleRequestError(err) {
        let response = gen("p");
        response.textContent = "There was an error requesting data from the API service. Please try again later.";
        id("playlist").appendChild(response);
    }

    /**
     * This function removes all child nodes from a DOM parent node.
     * @param {DOMElement} parent - the parent node to remove all children from
     */
    function removeAllChildNodes(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    /**
     * Clears the playlist specific details.
     */
    function clearHTML() {
        let container = qs('#playlist');
        removeAllChildNodes(container);
        container = qs('div > div');
        removeAllChildNodes(container);
    }

    /**
     * Creates a new dog playlist from a randomly generated dog.
     */
    async function generatePlaylist() {
        clearHTML();
        let data = await fetchOneDog();
        let breed = processDogJson(data);
        await makeSongSections(breed);
    }

    /**
     * Extracts the breed name from the image URL.
     * Code mostly taken from: https://codepen.io/kkoutoup/pen/wjZXPw
     * @param {URL} imgURL - the URL to the dog image.
     * @return {string} Returns the dog breed name.
     */
    function extractBreedName(imgUrl) {
        let regex = /https:\/\/images\.dog\.ceo\/breeds\/(\w+-?\w+)\/.+/g;
        let breedName = regex.exec(imgUrl)[1];

        if (breedName === 'germanshepherd') {
            return 'German Shepherd';
        } else if (breedName === 'mexicanhairless') {
            return 'Mexican Hairless';
        } else if (breedName === 'stbernard') {
            return 'St. Bernard';
        } else if (breedName === "african") {
            return 'African Wild Dog';
        } else if (breedName === 'bullterrier') {
            return 'Bull Terrier';
        } else if (breedName === 'pointer-germanlonghair') {
            return 'Pointer German Long Hair';
        }

        return breedName.replace(/-/g, ' ')
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    /**
     * Fetches one random dog image from the Dog API.
     */
    async function fetchOneDog() {
        try {
            const url = DOG_URL + "breeds/image/random";
            let resp = await fetch(url);
            resp = checkStatus(resp);
            const data = await resp.json();
            return data;
        } catch (err) {
            handleRequestError(err);
        }
    }

    /**
     * Returns the dog breed from the JSON that was fetched and updates the document's 
     * dog figure's picture and caption.
     * @param {JSON Object} dogJson - Dog API JSON
     * @return {string} - Returns dog breed
     */
    function processDogJson(dogJson) {
        let imgUrl = dogJson.message;
        let breed = extractBreedName(imgUrl);

        let figure = gen('figure');
        let img = gen('img');
        img.src = imgUrl;
        img.alt = "picture of " + breed;
        figure.appendChild(img);
        let figcaption = gen('figcaption');
        figcaption.textContent = breed;
        figure.appendChild(figcaption);
        qs('div > div').appendChild(figure);

        return breed;
    }

    /**
     * Generates a playlist of songs based on each character of the dog breed and 
     * updates the HTML document accordingly. If there is a song preview available,
     * creates play and pause buttons to listen to a snippet.
     * @param {string} breed - the name of the dog breed
     */
    async function makeSongSections(breed) {
        let token = await getSpotifyToken();
        for (let i = 0; i < breed.length; i++) {
            if (breed.charAt(i).toUpperCase() >= 'A' && breed.charAt(i).toUpperCase() <= 'Z') {
                let song = gen("section");
                let letter = gen("p");
                letter.textContent = breed.charAt(i).toUpperCase();
                song.appendChild(letter);

                let songData = await getSong(token, letter.textContent.toLowerCase());
                let figure = gen('figure');
                let album = gen('img');
                album.src = songData.album.images[0].url;
                album.alt = "album art for " + songData.album.name;
                figure.append(album);
                let caption = gen('figcaption');
                let title = gen('p');
                title.textContent = '"' + songData.name + '"';
                caption.appendChild(title);
                let artist = gen('p');
                artist.textContent = songData.artists[0].name;
                caption.appendChild(artist);
                figure.append(caption);
                song.appendChild(figure);

                if (songData.preview_url) {
                    let audio = gen('audio');
                    audio.src = songData.preview_url;
                    song.appendChild(audio);

                    let menu = gen('div');
                    let playBtn = gen('button');
                    let playImg = gen('img');
                    playImg.src = "imgs/play.png";
                    playBtn.appendChild(playImg);
                    playBtn.addEventListener('click', function () { 
                        song.classList.toggle('selected');
                        audio.play();
                    });
                    menu.appendChild(playBtn);

                    let pauseBtn = gen('button');
                    let pauseImg = gen('img');
                    pauseImg.src = "imgs/pause.png";
                    pauseBtn.appendChild(pauseImg);
                    pauseBtn.addEventListener('click', function () { 
                        song.classList.toggle('selected');
                        audio.pause(); 
                    });
                    menu.appendChild(pauseBtn);

                    song.append(menu);
                }

                song.classList.add('song');
                id("playlist").appendChild(song);
            } else {
                let blank = gen("section");
                blank.classList.add('blank');
                id("playlist").appendChild(blank);
            }
        }
    }

    /**
     * Fetches a token from Spotify to access the Spotify API
     * @returns {string} - Returns the access token
     */
    async function getSpotifyToken() {
        try {
            let resp = await fetch("https://accounts.spotify.com/api/token", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
                },
                body: 'grant_type=client_credentials'
            });
            resp = checkStatus(resp);
            const data = await resp.json();
            return data.access_token;
        } catch (err) {
            handleRequestError(err);
        }
    }

    /**
     * Fetches a song based on a letter randomly from the top MAX_OFFSET popular songs in GENRE.
     * @param {String} token - the access token
     * @param {String} letter - The letter used to query the song 
     * @return {JSON} - JSON object corresponding to a song 
     */
    async function getSong(token, letter) {
        try {
            let offset = Math.floor(Math.random() * MAX_OFFSET);
            let resp = await fetch('https://api.spotify.com/v1/search' + '?q=genre:"' 
                + GENRE + '"track:' + letter + '%25&type=track&market=US&limit=1&offset=' 
                + offset + '&include_external=audio', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });
            resp = checkStatus(resp);
            const data = await resp.json();
            return data.tracks.items[0];
        } catch (err) {
            handleRequestError(err);
        }
    }

    init();
})();
