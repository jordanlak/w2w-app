/* ============================================================
   W2W MAIN SCRIPT — CLOSET, BUILDER, SAVED OUTFITS
   ============================================================ */

/* -------------------------------
   SAVE UPLOADED CLOTHING ITEMS
-------------------------------- */
function saveClothingImage(imgURL) {
  let clothes = JSON.parse(localStorage.getItem("clothes") || "[]");
  clothes.push(imgURL);
  localStorage.setItem("clothes", JSON.stringify(clothes));
}

/* -------------------------------
   DISPLAY CLOSET ITEMS
-------------------------------- */
function loadCloset() {
  const area = document.getElementById("closetGrid");
  if (!area) return;

  const clothing = JSON.parse(localStorage.getItem("clothes") || "[]");
  area.innerHTML = "";

  clothing.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "closet-item";
    area.appendChild(img);
  });
}

document.addEventListener("DOMContentLoaded", loadCloset);

/* ============================================================
   NEW OUTFIT BUILDER (NO MANNEQUIN)
   ============================================================ */

let selectedOutfit = {
  top: null,
  bottom: null,
  shoes: null,
  accessories: []
};

function populateSelectors() {
  const clothing = JSON.parse(localStorage.getItem("clothes") || "[]");

  const topsList = document.getElementById("topsList");
  const bottomsList = document.getElementById("bottomsList");
  const shoesList = document.getElementById("shoesList");
  const accessoriesList = document.getElementById("accessoriesList");

  // Only run this on builder page
  if (!topsList) return;

  // Clear all
  [topsList, bottomsList, shoesList, accessoriesList].forEach(list => list.innerHTML = "");

  clothing.forEach(src => {
    const item = document.createElement("img");
    item.src = src;

    // Add click handler
    item.onclick = () => selectClothingItem(item);

    // Temporary: all clothes appear in all categories
    topsList.appendChild(item.cloneNode());
    bottomsList.appendChild(item.cloneNode());
    shoesList.appendChild(item.cloneNode());
    accessoriesList.appendChild(item.cloneNode());
  });
}

function selectClothingItem(imgElement) {
  const parent = imgElement.parentElement;

  // Remove highlight from siblings (except accessories which allow multiple)
  if (parent.id !== "accessoriesList") {
    [...parent.children].forEach(c => c.classList.remove("selected-item"));
    imgElement.classList.add("selected-item");
  }

  // Update selection object
  if (parent.id === "topsList") selectedOutfit.top = imgElement.src;
  if (parent.id === "bottomsList") selectedOutfit.bottom = imgElement.src;
  if (parent.id === "shoesList") selectedOutfit.shoes = imgElement.src;

  // Accessories allow multiple selections
  if (parent.id === "accessoriesList") {
    imgElement.classList.toggle("selected-item");

    if (imgElement.classList.contains("selected-item")) {
      selectedOutfit.accessories.push(imgElement.src);
    } else {
      selectedOutfit.accessories = selectedOutfit.accessories.filter(a => a !== imgElement.src);
    }
  }

  renderOutfitPreview();
}

function renderOutfitPreview() {
  const area = document.getElementById("outfitPreview");
  if (!area) return;

  area.innerHTML = "";

  if (selectedOutfit.top) area.appendChild(previewImg(selectedOutfit.top));
  if (selectedOutfit.bottom) area.appendChild(previewImg(selectedOutfit.bottom));
  if (selectedOutfit.shoes) area.appendChild(previewImg(selectedOutfit.shoes));

  selectedOutfit.accessories.forEach(src => {
    area.appendChild(previewImg(src));
  });
}

function previewImg(src) {
  const img = document.createElement("img");
  img.src = src;
  return img;
}

/* -------------------------------
   SAVE OUTFIT
-------------------------------- */
function saveGridOutfit() {
  const outfits = JSON.parse(localStorage.getItem("outfits") || "[]");
  outfits.push({...selectedOutfit});
  localStorage.setItem("outfits", JSON.stringify(outfits));

  alert("Outfit saved!");
}

/* ============================================================
   SAVED OUTFITS PAGE
   ============================================================ */

function renderSavedOutfits() {
  const area = document.getElementById("savedOutfits");
  if (!area) return;

  const outfits = JSON.parse(localStorage.getItem("outfits") || "[]");

  area.innerHTML = "";

  outfits.forEach((outfit, i) => {
    const card = document.createElement("div");
    card.className = "upload-card";
    card.style.marginBottom = "20px";

    const title = document.createElement("h3");
    title.innerText = `Outfit ${i + 1}`;
    card.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "outfit-preview";

    ["top", "bottom", "shoes"].forEach(key => {
      if (outfit[key]) grid.appendChild(previewImg(outfit[key]));
    });

    outfit.accessories?.forEach(src => grid.appendChild(previewImg(src)));

    card.appendChild(grid);
    area.appendChild(card);
  });
}

// Run functions when on correct pages
document.addEventListener("DOMContentLoaded", populateSelectors);
document.addEventListener("DOMContentLoaded", renderSavedOutfits);
