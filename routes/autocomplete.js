// autocomplete.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', (req, res) => {
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
  var baseUrl = window.location.origin; // Use window.location.origin to get the base URL
  xhr.open("GET", baseUrl + "/autocomplete?query=" + encodeURIComponent(input.value), true); // Encode input value
  xhr.send();
});

module.exports = router;

