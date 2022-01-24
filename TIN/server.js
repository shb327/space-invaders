const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "mainMenu.html"));
});

app.get("/game", (req, res) => {
    res.sendFile(path.join(__dirname, "game.html"));
});

app.post("/updateLeaderboard", (req, res) => {
    var node = req.body;
    var json = JSON.parse(fs.readFileSync("leaderboard.json"));
    json.scores.push(node.score);
    json.scores.sort().reverse();
    if (json.scores.length > 15) json.scores.pop();
    fs.writeFile("leaderboard.json", JSON.stringify(json), function (err) {
        if (err){
          throw err;
        }
      });
});

app.get("/winMenu", (req, res) => {
    res.sendFile(path.join(__dirname, "winMenu.html"));
});

app.get("/loseMenu", (req, res) => {
    res.sendFile(path.join(__dirname, "loseMenu.html"));
});

app.get("/leaderboard", (req, res) => {
    res.sendFile(path.join(__dirname, "mainMenu.html"));
});

app.post("/leaderboardjson", (req, res) => {
    res.json(JSON.parse(fs.readFileSync("leaderboard.json")));
});

app.listen(3327, () => {
    console.log("Listening on port 3327");
});
