/**
 * NAME: Kyla Yu-Swanson
 * DATE: May 7, 2022
 * 
 * This is a JS file for a slide show gallery, which is used on the index page. 
 * It handles the button clicks that move through the slides.
 * 
 * Notes: Slideshow code inspired by https://www.w3schools.com/howto/howto_js_slideshow.asp.
 */
(function () {
  "use strict";

  let slideIndex = 0;

  /**
   * Runs the needed functions for the website upon starting.
   */
  function init() {
    showSlides(slideIndex);
    (id("prev-btn")).addEventListener("click", function () {
      slideIndex -= 1;
      showSlides(slideIndex);
    });
    (id("next-btn")).addEventListener("click", function () {
      slideIndex += 1;
      showSlides(slideIndex);
    });
  }

  function showSlides(n) {
    let slides = qsa("#slides-gallery > img");
    if (n >= slides.length) {
      slideIndex = 0;
    }
    if (n < 0) {
      slideIndex = slides.length - 1;
    }
    for (let i = 0; i < slides.length; i++) {
      slides[i].classList.add("hide");
    }
    slides[slideIndex].classList.remove("hide");
  }

  init();
})();
