const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "mainMenu.html"));
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, "game.html"));
});

app.get("/winMenu", (req, res) => {
    res.sendFile(path.join(__dirname, "winMenu.html"));
});

app.get("/loseMenu", (req, res) => {
    res.sendFile(path.join(__dirname, "loseMenu.html"));
});

app.listen(3327, () => {
    console.log("Listening on port 3327");
});
