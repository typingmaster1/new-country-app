const input = document.querySelector("#inputBox");
const btn = document.querySelector("#btn");
const flag = document.querySelector("#flag");
const mname = document.querySelector(".mname");
const lang = document.querySelector(".lang");
const popu = document.querySelector(".popu");
const cityGallery = document.querySelector(".city-gallery");
const hotelGallery = document.querySelector(".hotel-gallery");
const citiesDiv = document.querySelector("#cities");
const hotelsDiv = document.querySelector("#hotels");
const resultCard = document.querySelector("#result");
const loader = document.querySelector("#loader");
const btnText = document.querySelector("#btnText");

const apiKey = "GyPDqeYcqlRr8XBQBIPvPTkW49oXjE3NBG3fjCjftjvuuPuhmHpJ7NQ4";

// Fix common alternate names
const countryMap = {
  england: "united kingdom",
  srilanka: "sri lanka",
  usa: "united states",
  uae: "united arab emirates",
};

btn.addEventListener("click", searchCountry);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchCountry();
});

async function searchCountry() {
  const countryName = input.value.trim().toLowerCase();
  if (!countryName) return alert("Please enter a country name!");

  btn.disabled = true;
  btnText.innerText = "Loading...";
  loader.style.display = "inline-block";

  try {
    const searchName = countryMap[countryName] || countryName;
    const response = await axios.get(`https://restcountries.com/v3.1/name/${searchName}`);
    const country = response.data[0];

    resultCard.style.display = "block";
    mname.innerText = "Alternative Names: " + (country.altSpellings?.join(", ") || "N/A");
    lang.innerText = "Languages: " + (country.languages ? Object.values(country.languages).join(", ") : "N/A");
    popu.innerText = "Population: " + (country.population?.toLocaleString() || "N/A");
    flag.src = country.flags?.png || "";

    // 🌆 Fetch Popular Places
    await fetchPexelsImages(countryName, ["Capital", "Tourism", "Nature", "City View"], citiesDiv);

    // 🏨 Fetch Popular Hotels
    await fetchPexelsImages(countryName, ["Hotels", "Luxury Hotels", "Resorts", "Beach Hotels"], hotelsDiv);

    // Show or hide galleries
    cityGallery.style.display = citiesDiv.children.length > 0 ? "block" : "none";
    hotelGallery.style.display = hotelsDiv.children.length > 0 ? "block" : "none";

    cityGallery.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    alert("Country not found. Please try again!");
    resultCard.style.display = "none";
    cityGallery.style.display = "none";
    hotelGallery.style.display = "none";
  }

  btn.disabled = false;
  btnText.innerText = "Search";
  loader.style.display = "none";
}

// 🌍 Helper function to fetch Pexels images with captions
async function fetchPexelsImages(countryName, keywords, container) {
  container.innerHTML = "";

  for (const keyword of keywords) {
    try {
      const photoRes = await axios.get(
        `https://api.pexels.com/v1/search?query=${countryName} ${keyword}&per_page=1`,
        { headers: { Authorization: apiKey } }
      );
      const photo = photoRes.data.photos[0];
      if (photo) {
        const imgCard = document.createElement("div");
        imgCard.className = "city-card";

        const img = document.createElement("img");
        img.src = photo.src.medium;
        img.alt = photo.alt;

        const caption = document.createElement("p");
        caption.className = "caption";
        caption.textContent = photo.alt || keyword;

        imgCard.appendChild(img);
        imgCard.appendChild(caption);
        container.appendChild(imgCard);
      }
    } catch (err) {
      console.warn("No image for", keyword);
    }
  }

  if (container.children.length === 0) {
    container.innerHTML = "<p>No results found.</p>";
  }
}
