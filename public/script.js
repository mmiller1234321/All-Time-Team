// Array to keep track of submitted player names
var submittedPlayers = [];

function updateLabels() {
  //Add new labels, All Star NL/AL, Divison, Hall of Famers, other 
  var teams = [
    "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox",
    "Chicago White Sox", "Chicago Cubs", "Cincinnati Reds", "Cleveland Guardians",
    "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals",
    "Los Angeles Angels of Anaheim", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers",
    "Minnesota Twins", "New York Yankees", "New York Mets", "Oakland Athletics",
    "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
    "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers",
    "Toronto Blue Jays", "Washington Nationals"
  ];
  var randomTeamIndex = Math.floor(Math.random() * teams.length);
  var randomTeam = teams[randomTeamIndex];
  document.getElementById('teamLabel').innerText = randomTeam;

  var stats = ["r", "h", "2b", "3b", "hr", "rbi", "sb", "bb", "ibb"]; //add additional stats here
  var randomStatIndex = Math.floor(Math.random() * stats.length);
  var randomStat = stats[randomStatIndex];
  document.getElementById('statLabel').innerText = randomStat;
}

function handleSubmit(event) {
  var submitButton = event.target;
  if (submitButton.disabled) return; // Check if the button is already disabled
  submitButton.disabled = true; // Disable the button to prevent multiple submissions

  var playerNameInput = submitButton.parentElement.parentElement.children[0].children[0];
  var playerName = playerNameInput.value.trim(); // Trim whitespace

  // Check if the player has already been submitted
  if (submittedPlayers.includes(playerName)) {
    alert('Player has already been submitted. Please select a different player.');
    submitButton.disabled = false; // Re-enable the button
    return;
  }

  if (playerName !== '') {
    submittedPlayers.push(playerName); // Add the player to the submitted players list

    var position = submitButton.parentElement.parentElement.children[1].textContent;
    var team = document.getElementById('teamLabel').textContent;
    var stat = document.getElementById('statLabel').textContent; // Retrieve the value of the stats label

    // Dynamically determine the base URL
    var baseUrl = window.location.protocol + '//' + window.location.hostname;

    // Fetch data for the submitted player
    var xhr = new XMLHttpRequest();
    xhr.open('GET', baseUrl + '/search?playerName=' + playerName + '&position=' + position + '&team=' + team + '&stat=' + stat, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        var statSquare = submitButton.parentElement.parentElement.children[2].children[0];
        var statValue = xhr.responseText;
        statSquare.textContent = (statValue === '0') ? '0' : statValue; // Display '0' if no data found
        updateTotalScore(); // Update total score after each submission
      } else {
        console.error('Error fetching data:', xhr.statusText);
      }
    };
    xhr.onerror = function () {
      console.error('Error fetching data.');
    };
    xhr.send();
  }
}

function addPlayerRows() {
  var positions = ["C", "1B", "2B", "3B", "SS", "OF", "OF", "OF", "P"];
  var tbody = document.getElementById("playerRows");
  for (var i = 0; i < 9; i++) {
    var row = document.createElement("tr");
    
    var playerNameCell = document.createElement("td");
    var playerNameInput = document.createElement("input");
    playerNameInput.type = "text";
    playerNameInput.className = "form-control player-input";
    playerNameInput.placeholder = "Enter player's name";
    playerNameInput.addEventListener('input', function() {
      // Call the autocomplete function when input changes
      autocomplete(this);
    });
    playerNameCell.appendChild(playerNameInput);
    row.appendChild(playerNameCell);
    
    var positionCell = document.createElement("td");
    positionCell.textContent = positions[i];
    row.appendChild(positionCell);
    
    var statCell = document.createElement("td");
    var statSquare = document.createElement("div");
    statSquare.className = "stat-square";
    statCell.appendChild(statSquare);
    row.appendChild(statCell);
    
    var submitCell = document.createElement("td");
    var submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.className = "btn btn-primary";
    submitButton.textContent = "Submit";
    submitButton.addEventListener('click', handleSubmit);
    submitCell.appendChild(submitButton);
    row.appendChild(submitCell);
    
    tbody.appendChild(row);
    
    if (positions[i] === 'P') {
      break; // Stop adding rows when reaching 'P' position
    }
  }
}

function updateTotalScore() {
  var statSquares = document.querySelectorAll('.stat-square');
  var totalScore = 0;
  statSquares.forEach(function(statSquare) {
    var statValue = parseInt(statSquare.textContent);
    if (!isNaN(statValue)) {
      totalScore += statValue;
    }
  });
  document.getElementById('totalScore').textContent = totalScore;
}

// Autocomplete function
function autocomplete(input) {
  var currentFocus;
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      var suggestions = JSON.parse(this.responseText);
      closeAllLists();
      if (!input.value || suggestions.length === 0) {
        return false;
      }
      currentFocus = -1;
      var autocompleteList = document.createElement("div");
      autocompleteList.setAttribute("id", input.id + "autocomplete-list");
      autocompleteList.setAttribute("class", "autocomplete-items");
      input.parentNode.appendChild(autocompleteList);
      for (var i = 0; i < suggestions.length; i++) {
        var suggestion = suggestions[i];
        var suggestionItem = document.createElement("div");
        suggestionItem.innerHTML = "<strong>" + suggestion.substr(0, input.value.length) + "</strong>";
        suggestionItem.innerHTML += suggestion.substr(input.value.length);
        suggestionItem.innerHTML += "<input type='hidden' value='" + suggestion + "'>";
        suggestionItem.addEventListener("click", function(e) {
          input.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
        });
        autocompleteList.appendChild(suggestionItem);
      }
    }
  };
  // Dynamically determine the base URL
  var baseUrl = window.location.protocol + '//' + window.location.hostname;
  xhr.open("GET", baseUrl + "/autocomplete?query=" + input.value, true);
  xhr.send();
}

function closeAllLists(elmnt) {
  var autocompleteItems = document.getElementsByClassName("autocomplete-items");
  for (var i = 0; i < autocompleteItems.length; i++) {
    if (elmnt !== autocompleteItems[i] && elmnt !== input) {
      autocompleteItems[i].parentNode.removeChild(autocompleteItems[i]);
    }
  }
}

document.addEventListener("click", function(e) {
  closeAllLists(e.target);
});

window.onload = function() {
  updateLabels();
  addPlayerRows();
  
  // Trigger the modal when the instructions button is clicked
  document.getElementById('instructionsButton').addEventListener('click', function() {
    $('#instructionsModal').modal('show');
  });
};