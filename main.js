const themeSwitcher = document.getElementById("theme-switcher");
const countryContainer = document.querySelector(".main__content");
const navigation = document.getElementById("navigation");
const nextBttn = document.getElementById("next-bttn");
const previousBttn = document.getElementById("previous-bttn");
const returnMainContainer = document.getElementById("back-bttn");
const nameInputField = document.getElementById("country-name");
const filterRegion = document.getElementById("filter-by-region");
const filterOptions = document.getElementById("filter-region-options");
const focusableElements = document.querySelectorAll(".header__themeSwitcher, .main__filterRegion")

const specCountryImg = document.querySelector(".main__details__countryFlag img")
const specCountryName = document.querySelector(".main__details__countryName")
const specCountryNativeName = document.getElementById("spec-name");
const specCountryPopulation = document.getElementById("spec-population");
const specCountryRegion = document.getElementById("spec-region");
const specCountrySubRegion = document.getElementById("spec-subRegion");
const specCountryCapital = document.getElementById("spec-capital");
const specCountryTld = document.getElementById("spec-topLevelDomain");
const specCountryCurrencies = document.getElementById("spec-currencies");
const specCountryLanguages = document.getElementById("spec-lnguages");
const specCountryBorderGrp = document.getElementById("border-grp");

let allCountries = [];
let filteredCountries = [];
let currentStep = 1;
let varNumber;

initApp();
bendEvents();

function initApp() {
    fetch("https://restcountries.com/v3.1/all?fields=flags,name,population,region,subregion,capital,tld,currencies,languages,borders,cca3")
        .then(resp => resp.json())
        .then(data => {
            allCountries = data;
            showCountries(allCountries)
        })
        .catch(err => console.error(err));
};

function bendEvents() {
    document.documentElement.addEventListener("keydown", (e) => PreventDefaultSpace(e))
    themeSwitcher.addEventListener("click", () => document.documentElement.classList.toggle("light"));
    countryContainer.addEventListener("click", (e) => handleCountryContainerClick(e));
    countryContainer.addEventListener("keydown", (e) => handleElementsKeyDown(e));
    returnMainContainer.addEventListener("click", () => document.querySelector(".main").classList.remove("details"));
    navigation.addEventListener("click", (e) => handleNavigationClick(e));
    specCountryBorderGrp.addEventListener("click", (e) => handleBorderGrpClick(e));
    nameInputField.addEventListener("input", handleInputField);
    filterRegion.addEventListener("click", () => filterOptions.classList.toggle("hidden"));
    filterOptions.addEventListener("click", (e) => handleFilterOptionsClick(e));
    focusableElements.forEach(element => element.addEventListener("keydown", (e) => handleElementsKeyDown(e)));
    document.querySelectorAll("button").forEach(bttn => bttn.addEventListener("keydown", (e) => handleElementsKeyDown(e)));
};

function handleCountryContainerClick(e) {
    if (e.target.className != "main__content__countryName") return;
    
    document.querySelector(".main").classList.add("details");
    const specCountry = searchCountryBy("name", e.target.closest(".main__content__country").dataset.name);
    addCountryDetails(specCountry);
};

function handleNavigationClick(e) {
    if (e.target.closest("#next-bttn")) currentStep++
    else if (e.target.closest("#previous-bttn")) currentStep--;
    window.scrollTo(0, 0);
    showCountries(document.querySelector(".main__filterRegion__filterOptions li.selected")? filteredCountries: allCountries);
};

function handleBorderGrpClick(e) {
    if (e.target.tagName != "LI") return;
    
    addCountryDetails(searchCountryBy("name", e.target.dataset.name));
};

function handleInputField() {
    clearTimeout(varNumber);
    
    if (nameInputField.value.trim()) {
        let loading = document.createElement("p");
        loading.innerHTML = `<i class="fa-duotone fa-solid fa-spinner fa-spin fa-spin-reverse"></i>Loading`;
        loading.style.cssText = `display: flex; gap: 10px; font-size: 1.2rem; position: absolute; left: 50%; transform: translateX(-50%);`
        
        countryContainer.innerHTML = ``;
        countryContainer.append(loading);
        navigation.classList.add("hidden");
    
        varNumber = setTimeout(() => {
            fetch(`https://restcountries.com/v3.1/name/${nameInputField.value.trim()}`)
                .then(resp => resp.json())
                .then(data => {
                    if (data.status == 404 || data.length == 0) {
                        countryContainer.innerHTML = `<p>❌ No countries found with the name: "<strong>${nameInputField.value.trim()}</strong>"</p>`;
                    } else {
                        showCountries(data)}
                    }
                )
                .catch(err => countryContainer.innerHTML = `⚠️ An error occurred while fetching data. Please try again.`);
        }, 800);
    } else showCountries(allCountries);
};

function handleFilterOptionsClick(e) {
    if (e.target.tagName != "LI") return;
    if (e.target.textContent != "All") e.target.classList.add("selected");
    
    document.querySelector(".main__filterRegion__filterOptions li.selected")?.classList.remove("selected");
    filteredCountries = allCountries.filter(country => country.region == e.target.dataset.name);
    
    currentStep = 1;
    showCountries(e.target.textContent == "All"? allCountries: filteredCountries);
};

function showCountries(countriesVar) {
    countryContainer.innerHTML = ``;
    navigation.classList.toggle("hidden", countriesVar.length <= 12);
    previousBttn.classList.toggle("hidden", currentStep == 1);
    nextBttn.classList.toggle("hidden", currentStep == Math.ceil(countriesVar.length / 12));

    if (countriesVar.length > 12) countriesVar.slice((currentStep-1)*12, (currentStep-1)*12+12).forEach(country => addCountry(country));
    else if (countriesVar.length) countriesVar.forEach(country => addCountry(country));
    else navigation.classList.add("hidden");
};

function addCountry(country) {
    let div = document.createElement("div");
    div.classList.add("main__content__country");
    div.dataset.name = country.name.common;
    div.innerHTML = `
        <div class="main__content__imgCont"><img src="${country.flags.png}" alt="${country.flags.alt}"></div>
        <div class="main__content__countryText">
            <h2 class="main__content__countryName" tabindex="0">${country.name.common}</h2>
            <ul class="main__content__countryInfo">
                <li><strong>Population:</strong> <span class="countryPopulation">${country.population.toLocaleString()}</span></li>
                <li><strong>Region:</strong> <span class="countryRegion">${country.region}</span></li>
                <li><strong>Capital:</strong> <span class="countryCapital">${country.capital?.[0] || "No Capital provided"}</span></li>
            </ul>
        </div>
    `;

    countryContainer.append(div);
};

function searchCountryBy(searchable, value) {
    if (searchable == "name") {
        return allCountries.find(country => country.name?.common == value);
    } else if (searchable == "cca3") {
        return allCountries.find(country => country.cca3 == value);
    }
};

function addCountryDetails(country) {
    specCountryImg.setAttribute("src", country.flags?.png);
    specCountryImg.setAttribute("alt", country.flags?.alt);
    specCountryName.textContent = country.name?.common;
    specCountryNativeName.textContent = country.name?.nativeName[`${Object.keys(country.name?.nativeName).pop()}`]?.common;
    specCountryPopulation.textContent = country.population.toLocaleString();
    specCountryRegion.textContent = country.region;
    specCountryRegion.textContent = country.region;
    specCountrySubRegion.textContent = country.subregion;
    specCountryCapital.textContent = country.capital;
    specCountryTld.textContent = country.tld.join(" or ");
    specCountryCurrencies.textContent = Object.values(country.currencies)[0].name;
    specCountryLanguages.textContent = Object.values(country.languages).join(", ");

    if (country.borders.length) addBorderName(country.borders);
    else specCountryBorderGrp.textContent = "No Borders";
};

function addBorderName(codes) {
    specCountryBorderGrp.innerHTML = ``;

    codes.forEach(code => {
        let wantedVal = searchCountryBy("cca3", code);
        let li = document.createElement("li");
        li.textContent = wantedVal.name?.common;
        li.dataset.name = wantedVal.name?.common;

        specCountryBorderGrp.append(li);
    })
};

function PreventDefaultSpace(e) {
    if (e.code == "Space" && e.target.tagName != "INPUT") e.preventDefault();
}

function handleElementsKeyDown(e) {
    if (e.key == "Enter" || e.code == "Space") e.target.click();
}

