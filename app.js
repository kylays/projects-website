/* 
 * NAME: Kyla Yu-Swanson
 */

"use strict";

const express = require("express");
const app = express();

app.use(express.static("docs")); 

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
