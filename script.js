
function detectColorScheme() {
  let theme = "light"; 

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
   
    theme = "dark";
  }
 
  if (theme == "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
}
detectColorScheme();

const toggleSwitch = document.querySelector("#theme-toggle-button");
const btnToggleText = document.querySelector(
  'label[for="theme-toggle-button"] span'
);


function switchTheme(e) {
  if (e.target.checked) {
    localStorage.setItem("theme", "dark");
    document.documentElement.setAttribute("data-theme", "dark");
    toggleSwitch.checked = true;
    btnToggleText.innerText = "light";
  } else {
    localStorage.setItem("theme", "light");
    document.documentElement.setAttribute("data-theme", "light");
    toggleSwitch.checked = false;
    btnToggleText.innerText = "dark";
  }
}


toggleSwitch.addEventListener("change", switchTheme, false);


if (document.documentElement.getAttribute("data-theme") == "dark") {
  toggleSwitch.checked = true;
}


const dropdownLink = document.querySelector(".dropdown");
const fontFamilyLinks = document.querySelectorAll("#font-family-list a"); 

fontFamilyLinks.forEach((elem) => {
    elem.addEventListener("click", ()=> {
      let ffClassName = elem.className;
      document.body.className = ffClassName;
      fontFamilyLinks.forEach((a) => {
        if (a.classList.contains("ff-active")) {
        a.classList.remove("ff-active")
        }
      });
      elem.classList.add("ff-active");
      dropdownLink.innerText = elem.innerText;
    })
  
  })

const toggleSubMenu = (elem) => {
  if (elem.classList.contains("open")) {
    closeSubMenu(elem);
  } else {
    elem.classList.add("open");
    elem.ariaExpanded = "true";
    elem.nextElementSibling.ariaHidden = "false";
    // show sub menu links
    const subMennu = elem.nextElementSibling.querySelectorAll("a");
    subMennu.forEach((link) => {
      link.ariaHidden = "false";
      link.tabIndex = "0";
    });
    elem.nextElementSibling.querySelector("a").focus();
  }
};

const closeSubMenu = (elem) => {
  elem.classList.remove("open");
  elem.ariaExpanded = "false";
  elem.nextElementSibling.ariaHidden = "true";
  
  const subMennu = elem.nextElementSibling.querySelectorAll("a");
  subMennu.forEach((link) => {
    link.ariaHidden = "true";
    link.tabIndex = "-1";
  });
};


document.addEventListener("click", (event) => {
  if (dropdownLink.contains(event.target)) {
    toggleSubMenu(dropdownLink);
  } else {
    closeSubMenu(dropdownLink);
  }
});


document.addEventListener("keyup", function (e) {
  if (e.key == "Escape") {
    const openLink = document.querySelector(".open");
    if (openLink) {
      closeSubMenu(openLink);
      openLink.focus();
    } else if (menuIcon.ariaExpanded == "true") {
      closeMainMenu();
    }
  }
});




const form = document.querySelector("#form");
const input = document.querySelector("#search-term");
const errorMessage = document.querySelector("#error");

const audio = new Audio();

const htmlElements = {
  term: document.getElementById("term"),
  transcription: document.getElementById("transcription"),
  audioBtn: document.getElementById("audioBtn"),
  allMeanings: document.getElementById("all-meanings"),
  source: document.getElementById("source-link"),
  resultSection: document.getElementById("result"),
  noResultSection : document.getElementById("no-result"),
  noResultsHeader: document.getElementById("no-result-header")
};
const resetFilds = () => {
  htmlElements.term.innerText = "";
  htmlElements.transcription.innerText = "";
  htmlElements.allMeanings.innerHTML = "";
  htmlElements.source.innerHTML = "";
  audio.setAttribute("src", null);
};

const getContent = (data) => {
  removeError();

  resetFilds();

  htmlElements.term.innerText = data[0].word;

  if (data[0].phonetic) {
    htmlElements.transcription.innerText = data[0].phonetic;
  } else if (data[0].phonetics && data[0].phonetics[0].text ) {
    htmlElements.transcription.innerText = data[0].phonetics[0].text;
  }

  // Transcription
  if (data[0].phonetic) {
    htmlElements.transcription.innerText = data[0].phonetic;
  } else if (data[0].phonetics && data[0].phonetics.length > 0) {
    data[0].phonetics.forEach((phonItem) => {
      if (phonItem.text && phonItem.text != "") {
        htmlElements.transcription.innerText = phonItem.text;
      }
    });
  }


  function isAudio(src) {
    return src.audio != "";
  }

  let audioSource = data[0].phonetics.find(isAudio);
  if (audioSource) {
    audio.setAttribute("src", audioSource.audio);
    audio.addEventListener("canplaythrough", () => {
      htmlElements.audioBtn.addEventListener("click", () => {
        audio.play();
      });
    });
  }

  const features = [];
  data[0].meanings.forEach((item, index) => {
    let synonym; 
    if (item.synonyms && item.synonyms.length > 0) {
      synonym = `<div class="meaning">
                <h3 class="headingS">Synonyms
                    <span class="synonym">
                        <ul class="synonyms-list" aria-label="Synonyms" role="listbox">
                        ${item.synonyms
                          .map(
                            (syn) => `
                            <li role="option"><a href="" class="btn-synonym" onclick="return getSynonym('${syn}')">${syn}, </a></li>`
                          )
                          .join("")}
                        </ul>
                    </span>
                </h3>
            </div>`;
    } else {
      synonym = "";
    }

    let definitionsList = [];
    let examplesList = [];
    data[0].meanings[index].definitions.forEach((definItem) => {
      definitionsList.push(`<li>${definItem.definition}</li>`);
      if (definItem.example) {
        examplesList.push(`<p class="bodyM example">${definItem.example}</p>`);
      }
    });
    let feature = `
          <div class="title-with-line">
            <h2 class="headingM italic">${item.partOfSpeech}</h2>
            <div class="horizontal-line"></div>
          </div>
          <div class="meaning">
            <h3 class="headingS">Meaning</h3>
            <ul class="bodyM">
              ${definitionsList.join("")}
            </ul>
          </div>
          ${synonym}
          ${examplesList.join("")}
          `;
    features.push(feature);
  });
  htmlElements.allMeanings.innerHTML = features.join("");

  if (data[0].sourceUrls[0]) {
    htmlElements.source.innerHTML = `
        <h4 class="bodyS">Source</h4>
        <div>
            <a class="bodyS" href="${data[0].sourceUrls[0]}" target="_blank"><span class="screen-reader-only">Source link</span><span aria-hidden="true">${data[0].sourceUrls[0]}</span><img src="./assets/images/icon-new-window.svg" width="12" height="12" alt="" aria-hidden="true" /></a>
        </div>
    `;
  }
};
function addError() {
  errorMessage.innerText = `Whoops, can't be empty...`;
  if (errorMessage.classList.contains("hide")) {
    errorMessage.classList.remove("hide");
  }
  input.classList.add("input-invalid");
  htmlElements.resultSection.classList.add("hide");
}
function removeError() {
  errorMessage.classList.add("hide");
  errorMessage.innerText = "";
  input.classList.remove("input-invalid");
  htmlElements.resultSection.classList.remove("hide");
}


const getSynonym = (synonym) => {
  input.value = synonym;
  fetchData();
  return false;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (input.value == "") {
    addError();
    resetFilds();
    return;
  }
  removeError();
  fetchData();
});
async function fetchData() {
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${input.value}`
    );

    if (!response.ok) {
      htmlElements.resultSection.classList.add("hide");
      if (htmlElements.noResultSection.classList.contains("hide")) {
            htmlElements.noResultSection.classList.remove("hide");
          }
          htmlElements.noResultsHeader.focus();
      
    
      resetFilds();
      throw new Error("Could not fetch resource");
    }
    const data = await response.json();

    console.log(data);
    htmlElements.noResultSection.classList.add("hide");
    getContent(data);
    htmlElements.resultSection.setAttribute("aria-label", `Search results for word ${input.value}`)
    htmlElements.resultSection.focus();
  } catch (error) {
    console.log(error);
  }
}
