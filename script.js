const apiKey = "c67079ff-d00c-402c-a804-02563c0fd588";

// Important elements
document.getElementById("word-entry").addEventListener("submit", handleClick);
const definitionSpace = document.getElementById("definition");
const etymologySpace = document.getElementById("etymology");
const beePNG = document.getElementById("buzzy");
beePNG.addEventListener("mouseover", function (event) {
  document.getElementById("insect").style.setProperty("opacity", "1");
});
beePNG.addEventListener("mouseleave", function (event) {
  document.getElementById("insect").style.setProperty("opacity", "0");
});

// Response when button is clicked
function handleClick(event) {
  event.preventDefault();
  var word = document.getElementById("word").value.trim();
  getDefinitionAndEtymology(word);
}

// The brains behind the operation - parsing the JSON from the API call and displaying the information
function displayDefinitionAndEtymology(data) {
  let totalEntries = data.length; // to be able to loop over different entries for a given word
  let isOffensive = false; // to avoid automatically displaying naughty words!

  if (data.length == 0) {
    // API call returns empty set because there is no entry
    definitionSpace.innerHTML =
      "<p>Could not find an entry for your word (or for anything resembling your word!). Please check your spelling and try again.</p>";
    return;
  } else if (typeof data[0] == "string") {
    // API call returns array of strings acting as suggestions for a word for which there is no entry
    let errorHTML =
      "<p>Could not find an entry for your word. Did you mean any of the following?</p><p>";

    // generate and display the suggested words with clickable links
    let possibilities = "";
    for (word of data) {
      possibilities += `<a href="#" class="suggested-word" id="${word}">${word}</a>, `;
    }
    errorHTML += possibilities.slice(0, -2);
    errorHTML += "</p>";
    definitionSpace.innerHTML = errorHTML;

    // add functionality to the links so that clicking on them looks up the words with API calls
    suggestions = document.getElementsByClassName("suggested-word");
    for (let i = 0; i < suggestions.length; i++) {
      suggestions[i].addEventListener("click", function (event) {
        event.preventDefault();
        getDefinitionAndEtymology(suggestions[i].id);
      });
    }

    return;
  }

  // At this point, there must be an entry for the word entered by the user; proceed with displaying information
  let mainWord = data[0].hwi.hw;
  mainWord = mainWord.replaceAll("*", "⸱"); // format the syllable demarcator
  let mainWordNoDots = mainWord.replaceAll("⸱", "");
  let primaryPronunciation = data[0].hwi.prs[0].mw;
  let definitionHTML = `<h2>${mainWord} <span class="pronounce">${primaryPronunciation}</span></h2>`;

  // loop for iterating over each entry
  for (let i = 0; i < totalEntries; i++) {
    if (data[i].meta.offensive) {
      isOffensive = true; // flag a word if at least one definition is considered offensive
    }

    // displays word in phrase if necessary and part of speech and 'short definition(s)'
    if (data[i].fl != undefined) {
      let altWord = data[i].meta.id;
      altWord = altWord.split(":")[0];

      let altPronunciation;

      try {
        altPronunciation = data[i].hwi.prs[0].mw;
      } catch (error) {
        altPronunciation = undefined;
      }

      let definitionEntry = "";
      if (
        altWord != mainWordNoDots ||
        altPronunciation != primaryPronunciation
      ) {
        definitionEntry += `<h3>${altWord}`;
        if (altPronunciation != undefined) {
          definitionEntry += ` <span class="pronounce">${altPronunciation}</span>`;
        }
        definitionEntry += `</h3><h4 style="margin-top: 2px;">`;
      } else {
        definitionEntry += "<h4>";
      }

      definitionEntry += `${data[i].fl}</h4>`;

      let definitionCount = data[i].shortdef.length;

      definitionEntry += "<ul>";
      for (let j = 0; j < definitionCount; j++) {
        definitionEntry += `<li>${data[i].shortdef[j]}</li>`;
      }
      definitionEntry += "</ul>";

      // collect etymology for each entry if it exists
      let originHTML;
      let etymologyEntry = "";

      if (data[i].et != undefined) {
        etymologyEntry += `${data[i].et[0][1]}`;
        etymologyEntry = etymologyEntry.replaceAll("{it}", "<em>");
        etymologyEntry = etymologyEntry.replaceAll("{/it}", "</em>");
        etymologyEntry = etymologyEntry.split("{")[0];

        originHTML =
          etymologyEntry.length > 0
            ? `<div class="etm"><span class="small-caps">Origin: </span>${etymologyEntry} `
            : "";
      } else {
        originHTML = "";
      }

      if (data[i].date != undefined) {
        dateEntry = `${data[i].date}`.split("{")[0];
        originHTML += ` (${dateEntry})`;
      }

      definitionHTML += definitionEntry + originHTML;
      definitionSpace.style.setProperty("padding-bottom", "2em");
    }
  }

  // alert the user if the word they have looked up is offensive
  if (isOffensive) {
    var result = window.confirm(
      "The word you are looking up has at least one meaning that is marked as offensive. Do you want to proceed and display the definition?"
    );

    if (result === true) {
      definitionSpace.innerHTML = definitionHTML;
    } else {
      definitionSpace.innerHTML =
        "<p><em>You have chosen not to display the definition for the offensive word.</em></p>";
      return;
    }
  } else {
    definitionSpace.innerHTML = definitionHTML;
  }
}

// function to make the API calls
function getDefinitionAndEtymology(word) {
  var url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayDefinitionAndEtymology(data);
    })
    .catch(function (error) {
      console.log(error);
    });
}
