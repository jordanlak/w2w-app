/* ============================================================
   W2W SCRIPT — CLOSET, UPLOAD, BUILDER, SAVED OUTFITS
   ============================================================ */

/* -------------------------------
   SAVE UPLOADED CLOTHING WITH CATEGORY
-------------------------------- */
function saveClothingImage(imgURL) {
  const category = prompt(
    "What type of clothing is this?\nOptions: top, bottom, shoes, accessory"
  );

  if (!category) return;

  let clothes = JSON.parse(localStorage.getItem("clothes") || "[]");

  clothes.push({
    src: imgURL,
    category: category.toLowerCase()
  });

  localStorage.setItem("clothes", JSON.stringify(clothes));
  alert("Item saved to your closet!");
}

/* -------------------------------
   DISPLAY CLOSET ITEMS
-------------------------------- */
function loadCloset() {
  const area = document.getElementById("closetGrid");
  if (!area) return;

  const clothing = JSON.parse(localStorage.getItem("clothes") || "[]");
  area.innerHTML = "";

  clothing.forEach(item => {
    const img = document.createElement("img");
    img.src = item.src;
    img.className = "closet-item";
    area.appendChild(img);
  });
}

document.addEventListener("DOMContentLoaded", loadCloset);

/* ============================================================
   DELETE MODE FOR CLOSET
   ============================================================ */

let deleteMode = false;

function enableDeleteMode() {
  deleteMode = !deleteMode;
  alert(deleteMode ? "Delete Mode ON\nTap any item to delete it." : "Delete Mode OFF");
}

document.addEventListener("click", function(e) {
  if (deleteMode && e.target.classList.contains("closet-item")) {
    const src = e.target.src;

    let clothes = JSON.parse(localStorage.getItem("clothes") || "[]");
    clothes = clothes.filter(item => item.src !== src);

    localStorage.setItem("clothes", JSON.stringify(clothes));
    loadCloset();
  }
});

/* ============================================================
   BUILDER PAGE (CATEGORY SORTING)
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

  if (!topsList) return;

  // Clear grids
  topsList.innerHTML = "";
  bottomsList.innerHTML = "";
  shoesList.innerHTML = "";
  accessoriesList.innerHTML = "";

  clothing.forEach(item => {
    const img = document.createElement("img");
    img.src = item.src;

    img.onclick = () => selectClothingItem(img);

    if (item.category === "top") topsList.appendChild(img);
    if (item.category === "bottom") bottomsList.appendChild(img);
    if (item.category === "shoes") shoesList.appendChild(img);
    if (item.category === "accessory") accessoriesList.appendChild(img);
  });
}

function selectClothingItem(imgElement) {
  const parent = imgElement.parentElement;

  // Single choices
  if (parent.id !== "accessoriesList") {
    [...parent.children].forEach(c => c.classList.remove("selected-item"));
    imgElement.classList.add("selected-item");
  }

  // Update selection object
  if (parent.id === "topsList") selectedOutfit.top = imgElement.src;
  if (parent.id === "bottomsList") selectedOutfit.bottom = imgElement.src;
  if (parent.id === "shoesList") selectedOutfit.shoes = imgElement.src;

  // Multiple accessories
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

function previewImg(src) {
  const img = document.createElement("img");
  img.src = src;
  return img;
}

function renderOutfitPreview() {
  const area = document.getElementById("outfitPreview");
  if (!area) return;

  area.innerHTML = "";

  if (selectedOutfit.top) area.appendChild(previewImg(selectedOutfit.top));
  if (selectedOutfit.bottom) area.appendChild(previewImg(selectedOutfit.bottom));
  if (selectedOutfit.shoes) area.appendChild(previewImg(selectedOutfit.shoes));

  selectedOutfit.accessories.forEach(src => area.appendChild(previewImg(src)));
}

/* ============================================================
   BUILDER PAGE BUTTONS
   ============================================================ */

function clearOutfit() {
  selectedOutfit = {
    top: null,
    bottom: null,
    shoes: null,
    accessories: []
  };

  document.querySelectorAll(".selected-item").forEach(el =>
    el.classList.remove("selected-item")
  );

  renderOutfitPreview();
}

function randomOutfit() {
  const clothing = JSON.parse(localStorage.getItem("clothes") || "[]");

  if (clothing.length === 0) {
    alert("Upload clothing first!");
    return;
  }

  const randomItem = (cat) => {
    const filtered = clothing.filter(c => c.category === cat);
    return filtered.length ? filtered[Math.floor(Math.random() * filtered.length)].src : null;
  };

  selectedOutfit.top = randomItem("top");
  selectedOutfit.bottom = randomItem("bottom");
  selectedOutfit.shoes = randomItem("shoes");
  selectedOutfit.accessories = [];

  renderOutfitPreview();
}

function removeLastAccessory() {
  if (selectedOutfit.accessories.length === 0) {
    alert("No accessories to remove.");
    return;
  }

  selectedOutfit.accessories.pop();
  renderOutfitPreview();
}

/* ============================================================
   SAVE OUTFIT
   ============================================================ */

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

document.addEventListener("DOMContentLoaded", populateSelectors);
document.addEventListener("DOMContentLoaded", renderSavedOutfits);

