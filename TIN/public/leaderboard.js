const scores = document.getElementById('scores');

let xhr = new XMLHttpRequest();
xhr.open("POST", "/leaderboardjson");

xhr.responseType = 'json';
xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
xhr.send();

xhr.onload = function() {
  if (xhr.status != 200){
    console.error("Cannot access the server!");
  }
    else{
      xhr.response.scores.forEach((e, i) => {
        var line = document.createElement("p");
        line.innerHTML = (i+1) + ". " + e;
        scores.appendChild(line);
      });
    }
}
