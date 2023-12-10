/**
 * NAME: Kyla Yu-Swanson
 * DATE: April 24, 2022
 * 
 * This is the JS file for the drag and drop puzzle. It handles button click 
 * events, toggling screen views, dragging puzzle pieces, and checking if the 
 * puzzle is solved.
 * 
 * Note that the drag and drop code is inspired by this tutorial:
 * https://www.javascripttutorial.net/web-apis/javascript-drag-and-drop/
 */
 (function() {
  "use strict";

  /**
   * Runs the needed functions for the website upon starting.
   */
  function init() {
    id("easy-button").addEventListener("click", function() { toggleView("easy") });
    id("medium-button").addEventListener("click", function() { toggleView("medium") });
    id("hard-button").addEventListener("click", function() { toggleView("hard") });
    
    let menuButtons = qsa(".menu-button");
    menuButtons.forEach(function(mb) {
      mb.addEventListener("click", function() { toggleView("menu") });
    });

    let pieces = qsa(".piece");
    pieces.forEach(function(p) {
      p.addEventListener("dragstart", dragStart);
    });
    
    let gridSquares = qsa(".grid-square");
    gridSquares.forEach(function(gs) {
      gs.addEventListener('dragenter', dragEnter)
      gs.addEventListener('dragover', dragOver);
      gs.addEventListener('dragleave', dragLeave);
      gs.addEventListener('drop', drop);
    })

    let piecesBanks = qsa(".pieces-bank");
    piecesBanks.forEach(function(pb) {
      pb.addEventListener('dragenter', dragEnter)
      pb.addEventListener('dragover', dragOver);
      pb.addEventListener('dragleave', dragLeave);
      pb.addEventListener('drop', drop);
    })
  }

  /**
   * Toggles the hidden class between the game screens and menu.
   * @param {string} keyword - The keyword for the button that was clicked
   */
  function toggleView(keyword) {
    id("menu-view").classList.toggle("hidden");
    qs("nav").classList.toggle("hidden");
    if (keyword == "menu") {
      id("easy-view").classList.add("hidden");
      id("medium-view").classList.add("hidden");
      id("hard-view").classList.add("hidden");
    }
    else {
      id(keyword + "-view").classList.toggle("hidden");
    }
  }

  /**
   * Handles clicking and holding a draggable item.
   * @param {event} e - The event that happened
   */
  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
  }

  /**
   * Handles a draggable item entering a droppable space.
   * @param {event} e - The event that happened
   */
  function dragEnter(e) {
    if (e.target.matches(".pieces-bank") || (e.target.matches(".grid-square") && e.target.children.length < 1)) {
      e.preventDefault();
      e.target.classList.add("drag-over");
    }
  }

  /**
   * Handles a draggable item being dragged over a droppable space.
   * @param {event} e - The event that happened
   */
  function dragOver(e) {
    if (e.target.matches(".pieces-bank") || (e.target.matches(".grid-square") && e.target.children.length < 1)) {
      e.preventDefault();
      e.target.classList.add("drag-over");
    }
  }

  /**
   * Handles a draggable item leaving a droppable space.
   * @param {event} e - The event that happened
   */
  function dragLeave(e) {
    if (e.target.matches(".pieces-bank") || (e.target.matches(".grid-square") && e.target.children.length < 1)) {
      e.target.classList.remove("drag-over");
    }
  }

  /**
   * Handles rea=leasing the mouse holding a draggable item in droppable space.
   * @param {event} e - The event that happened
   */
  function drop(e) {
    if (e.target.matches(".pieces-bank") || (e.target.matches(".grid-square") && e.target.children.length < 1)) {
      e.target.classList.remove("drag-over");
      let eid = e.dataTransfer.getData("text/plain");
      let draggable = id(eid);
      e.target.appendChild(draggable);
    }
  }

  init();
})();
