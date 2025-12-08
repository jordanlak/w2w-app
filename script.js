/* =======================================
   W2W — Combined App Script (v2)
   - uploads / closet / builder / saved
   - simple local auth (signup/signin/guest)
   ======================================= */

/* ---------------------------
   AUTH (localStorage-based)
   --------------------------- */

function getUsers(){
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(u){ localStorage.setItem('users', JSON.stringify(u)); }

function signup(email, password){
  if(!email || !password) return {ok:false, message: 'Provide email and password.'};
  let users = getUsers();
  if(users.find(u => u.email === email)) return {ok:false, message: 'Account exists. Sign in.'};
  const newUser = { email, password, createdAt: Date.now(), displayName: email.split('@')[0] };
  users.push(newUser);
  setUsers(users);
  localStorage.setItem('currentUser', email);
  updateNavUser();
  return {ok:true, message: 'Account created. Redirecting...'};
}

function signin(email, password){
  if(!email || !password) return {ok:false, message: 'Provide email and password.'};
  let users = getUsers();
  const found = users.find(u => u.email === email && u.password === password);
  if(!found) return {ok:false, message: 'No account matches those credentials.'};
  localStorage.setItem('currentUser', email);
  updateNavUser();
  return {ok:true, message: 'Signed in. Redirecting...'};
}

function signout(){
  localStorage.removeItem('currentUser');
  updateNavUser();
}

function getCurrentUser(){
  return localStorage.getItem('currentUser') || null;
}

/* update nav with user badge */
function updateNavUser(){
  const topbar = document.querySelector('.topbar');
  if(!topbar) return;
  const old = document.getElementById('userArea');
  if(old) old.remove();

  const user = getCurrentUser();
  const div = document.createElement('div');
  div.id = 'userArea';
  div.style.marginLeft = '16px';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.gap = '10px';

  if(user){
    const badge = document.createElement('div');
    badge.style.fontSize = '13px';
    badge.style.color = '#4b4b4b';
    badge.style.fontWeight = '700';
    badge.innerText = (user === 'guest') ? 'Guest' : user.split('@')[0];
    div.appendChild(badge);

    const out = document.createElement('button');
    out.innerText = 'Sign Out';
    out.style.padding = '8px 10px';
    out.style.borderRadius = '8px';
    out.style.border = 'none';
    out.style.cursor = 'pointer';
    out.style.background = 'transparent';
    out.style.color = '#6C5CE7';
    out.onclick = () => { signout(); alert('Signed out.'); };
    div.appendChild(out);

  } else {
    const link = document.createElement('a');
    link.href = 'landing.html';
    link.innerText = 'Sign In';
    link.style.color = '#6C5CE7';
    link.style.fontWeight = '700';
    div.appendChild(link);
  }

  topbar.appendChild(div);
}

/* initialize nav user after DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  updateNavUser();
});

/* ---------------------------
   STORAGE: clothing + outfits
   --------------------------- */

let clothes = JSON.parse(localStorage.getItem("clothes") || "[]");
let outfits = JSON.parse(localStorage.getItem("outfits") || "[]");

/* ---------------------------
   UPLOAD PREVIEW & SAVE (index.html)
   --------------------------- */
function renderPreviewGrid(filesArray){
  const preview = document.getElementById("previewGrid");
  if(!preview) return;
  preview.innerHTML = "";
  filesArray.forEach((dataUrl) => {
    const card = document.createElement("div");
    card.className = "thumb";
    const img = document.createElement("img");
    img.src = dataUrl;
    card.appendChild(img);
    preview.appendChild(card);
  });
}

(function attachUploadHandlers(){
  const input = document.getElementById("uploadInput");
  const browse = document.getElementById("browseBtn");
  const dropZone = document.getElementById("dropZone");
  const uploadBtn = document.getElementById("uploadBtn");
  const clearBtn = document.getElementById("clearBtn");
  if(!input || !dropZone) return;

  let staged = []; // DataURLs
  browse.addEventListener('click', ()=> input.click());

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if(!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => { staged.push(ev.target.result); renderPreviewGrid(staged); };
      reader.readAsDataURL(file);
    });
    input.value = '';
  });

  dropZone.addEventListener('dragover', (evt)=>{ evt.preventDefault(); dropZone.style.boxShadow = "0 18px 50px rgba(108,92,231,0.12)"; });
  dropZone.addEventListener('dragleave', ()=> dropZone.style.boxShadow = "");
  dropZone.addEventListener('drop', (evt)=>{
    evt.preventDefault();
    dropZone.style.boxShadow = "";
    const dtFiles = Array.from(evt.dataTransfer.files || []);
    dtFiles.forEach(file=>{
      if(!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = ev => { staged.push(ev.target.result); renderPreviewGrid(staged); };
      reader.readAsDataURL(file);
    });
  });

  if(uploadBtn){
    uploadBtn.addEventListener('click', ()=>{
      if(!staged.length) { alert('No images to save — add some first.'); return; }
      clothes = clothes.concat(staged);
      localStorage.setItem('clothes', JSON.stringify(clothes));
      staged = [];
      renderPreviewGrid([]);
      alert('Saved to your local closet!');
    });
  }

  if(clearBtn) clearBtn.addEventListener('click', ()=>{ staged = []; renderPreviewGrid([]); });
})();

/* ---------------------------
   CLOSET PAGE: render gallery
   --------------------------- */
(function renderCloset(){
  const container = document.getElementById("closetGallery");
  if(!container) return;
  container.innerHTML = "";
  clothes.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "cloth";
    container.appendChild(img);
  });
})();

/* ---------------------------
   BUILDER: populate draggable items + canvas
   --------------------------- */
(function builderPopulate(){
  const area = document.getElementById("builderClothes");
  const outfitArea = document.getElementById("outfitArea");
  if(!area || !outfitArea) return;

  area.innerHTML = "";
  clothes.forEach(src => {
    let img = document.createElement("img");
    img.src = src;
    img.draggable = true;
    img.style.width = "90px";
    img.ondragstart = (e) => { e.dataTransfer.setData("text/plain", src); };
    area.appendChild(img);
  });

  outfitArea.ondragover = (e)=> e.preventDefault();
  outfitArea.ondrop = (e) => {
    e.preventDefault();
    const src = e.dataTransfer.getData("text/plain");
    if(!src) return;
    const newImg = document.createElement("img");
    newImg.src = src;
    newImg.style.left = (e.offsetX - 45) + "px";
    newImg.style.top = (e.offsetY - 45) + "px";
    newImg.style.position = "absolute";
    newImg.style.width = "100px";
    newImg.style.cursor = "grab";

    // simple drag to reposition after dropping
    newImg.onmousedown = function(ev){
      ev.preventDefault();
      const shiftX = ev.clientX - newImg.getBoundingClientRect().left;
      const shiftY = ev.clientY - newImg.getBoundingClientRect().top;
      function moveAt(pageX, pageY) {
        const parentRect = outfitArea.getBoundingClientRect();
        newImg.style.left = (pageX - parentRect.left - shiftX) + "px";
        newImg.style.top = (pageY - parentRect.top - shiftY) + "px";
      }
      function onMouseMove(e2) { moveAt(e2.pageX, e2.pageY); }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', function up(){
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', up);
      });
    };

    outfitArea.appendChild(newImg);
  };
})();

/* ---------------------------
   SAVE OUTFIT
   --------------------------- */
function saveOutfit(){
  const outfitArea = document.getElementById("outfitArea");
  if(!outfitArea){ alert('No outfit area found.'); return; }
  const items = [...outfitArea.querySelectorAll("img")].map(img => ({
    src: img.src,
    left: img.style.left || "0px",
    top: img.style.top || "0px",
    width: img.style.width || "100px"
  }));
  if(!items.length){ alert('No items on mannequin to save.'); return; }
  outfits.push(items);
  localStorage.setItem('outfits', JSON.stringify(outfits));
  alert('Outfit saved.');
}

/* ---------------------------
   SAVED OUTFITS: render
   --------------------------- */
(function renderSaved(){
  const area = document.getElementById("savedOutfits");
  if(!area) return;
  area.innerHTML = "";
  outfits.forEach((out, i) => {
    const card = document.createElement("div");
    card.style.display = "flex";
    card.style.gap = "8px";
    card.style.alignItems = "center";
    card.style.padding = "12px";
    card.style.borderRadius = "12px";
    card.style.marginBottom = "12px";
    card.style.background = "#fff";
    card.style.boxShadow = "0 8px 20px rgba(16,16,40,0.04)";

    out.forEach(item => {
      const img = document.createElement("img");
      img.src = item.src;
      img.style.width = "72px";
      img.style.height = "72px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      card.appendChild(img);
    });

    const meta = document.createElement("div");
    meta.style.marginLeft = "12px";
    meta.innerHTML = `<strong>Outfit ${i+1}</strong><div style="color:#8b88a6;font-size:13px">Saved locally</div>`;
    card.appendChild(meta);
    area.appendChild(card);
  });
})();
