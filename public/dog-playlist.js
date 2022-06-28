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
  const DOG_BREEDS_URL = DOG_URL + "breeds/list/all";
  const CLIENT_ID = "9ae0f4eda5b340ba8a442a34d1c34615";
  const CLIENT_SECRET = "97b89b5a83114fa197cb526f38692869";
  const SPOTIFY_BASE = "https://api.spotify.com/v1";
  const GENRES_URL = SPOTIFY_BASE + "/recommendations/available-genre-seeds";
  const TOKEN_URL = "https://accounts.spotify.com/api/token";
  const MAX_OFFSET = 500;

  let accessToken = "";

  /**
   * Runs the needed functions for the website upon starting.
   */
  async function init() {
    accessToken = await getSpotifyToken();
    populateMenu();
    qs("#search > button").addEventListener("click", generatePlaylist);
    // generatePlaylist();
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
   * Dynamically fills in the genre and breed menus.
   */
  async function populateMenu() {
    breedMenu();
    genreMenu();
  }

  /**
   * Populate the breed menu.
   */
  async function breedMenu() {
    let menu = id("breed");
    let option = gen("option");
    option.value = "random";
    option.textContent = "random";
    menu.appendChild(option);
    let types = await getBreeds();
    for (let i = 0; i < types.length; i++) {
      option = gen("option");
      option.value = types[i];
      option.textContent = types[i];
      menu.appendChild(option);
    }
  }

  /**
   * Populate the genre menu.
   */
  async function genreMenu() {
    let menu = id("genre");
    let types = await getGenres();
    for (let i = 0; i < types.length; i++) {
      let option = gen("option");
      option.value = types[i];
      option.textContent = types[i];
      menu.appendChild(option);
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
    let breed = qs("#breed").value;
    let url = DOG_URL + "breed/" + breed + "/images/random";
    if (breed.toUpperCase() === "RANDOM") {
      url = DOG_URL + "breeds/image/random";
    }
    let data = await fetchOneDog(url);
    breed = processDogJson(data);
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
   * Fetches one dog image from the Dog API.
   * @param {string} url - url to fetch the dog
   */
  async function fetchOneDog(url) {
    try {
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
    for (let i = 0; i < breed.length; i++) {
      if (breed.charAt(i).toUpperCase() >= 'A' && breed.charAt(i).toUpperCase() <= 'Z') {
        let song = gen("section");
        let letter = gen("p");
        letter.textContent = breed.charAt(i).toUpperCase();
        song.appendChild(letter);

        let songData = await getSong(letter.textContent.toLowerCase());
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
          menu.appendChild(genPlayButton(song, audio));
          menu.appendChild(genPauseButton(song, audio));
          song.append(menu);
        }

        song.classList.add('song');
        id("playlist").appendChild(song);
      } else if (breed.charAt(i) === ' ') {
        let blank = gen("section");
        blank.classList.add('blank');
        id("playlist").appendChild(blank);
      }
    }
  }

  /**
   * Creates a play button for a song card.
   * @param {HTMLElement} song - the song card to add the button to
   * @param {HTMLElement} audio - the audio element that stores the audio file
   * @returns 
   */
  function genPlayButton(song, audio) {
    let playBtn = gen('button');
    let playImg = gen('img');
    playImg.src = "imgs/play.png";
    playBtn.appendChild(playImg);
    playBtn.addEventListener('click', function () { 
      song.classList.toggle('selected');
      audio.play();
    });
    return playBtn;
  }

  /**
   * Creates a pause button for a song card.
   * @param {HTMLElement} song - the song card to add the button to
   * @param {HTMLElement} audio - the audio element that stores the audio file
   * @returns 
   */
  function genPauseButton(song, audio) {
    let pauseBtn = gen('button');
    let pauseImg = gen('img');
    pauseImg.src = "imgs/pause.png";
    pauseBtn.appendChild(pauseImg);
    pauseBtn.addEventListener('click', function () { 
      song.classList.toggle('selected');
      audio.pause(); 
    });
    return pauseBtn;
  }

  /**
   * Fetches a token from Spotify to access the Spotify API
   * @returns {string} - Returns the access token
   */
  async function getSpotifyToken() {
    try {
      let resp = await fetch(TOKEN_URL, {
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
   * @param {String} letter - The letter used to query the song 
   * @return {JSON} - JSON object corresponding to a song 
   */
  async function getSong(letter) {
    try {
      let offset = Math.floor(Math.random() * MAX_OFFSET);
      letter = encodeURIComponent(letter);
      let genre = qs("#genre").value;
      let resp = await fetch(SPOTIFY_BASE + '/search?q=genre:"' 
        + genre + '"track:' + letter + '%25&type=track&market=US&limit=1&offset=' 
        + offset + '&include_external=audio', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      });
      resp = checkStatus(resp);
      const data = await resp.json();
      return data.tracks.items[0];
    } catch (err) {
      handleRequestError(err);
    }
  }

  /**
   * Fetches genres from the Spotify API.
   * @returns {array} - list of genres available in Spotify API
   */
  async function getGenres() {
    try {
      let resp = await fetch(GENRES_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        }
      });
      resp = checkStatus(resp);
      const data = await resp.json();
      return data.genres;
    } catch (err) {
      handleRequestError(err);
    }
  }

  /**
   * Fetches dog breeds from Dog API.
   * @returns {array} - list of dog breeds available on Dog API.
   */
  async function getBreeds() {
    try {
      let resp = await fetch(DOG_BREEDS_URL);
      resp = checkStatus(resp);
      const data = await resp.json();
      let breeds = [];
      for (var breed of Object.keys(data.message)) {
        breeds.push(breed);
        for (let i = 0; i < data.message[breed].length; i++) {
          breeds.push(breed + "/" + data.message[breed][i]);
        }
      }
      return breeds;
    } catch (err) {
      handleRequestError(err);
    }
  }

  init();
})();
