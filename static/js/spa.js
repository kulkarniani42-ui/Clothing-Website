// ---------- tiny spa router ----------
const main = document.getElementById('spa-root');

/* ---- catalogue (Global) ---- */
const catalogue = [
  {id:1,name:"Slim Oxford Shirt",  cat:"Shirts",  size:"M",  colour:"White",price:1299,img:"https://images.unsplash.com/photo-1596755024233-f90de3a54648?auto=format&fit=crop&w=600&q=80"},
  {id:2,name:"Denim Trucker",      cat:"Jackets", size:"L",  colour:"Navy", price:3499,img:"https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=600&q=80"},
  {id:3,name:"Cotton Crew Tee",    cat:"T-Shirts",size:"S",  colour:"Black",price:599, img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"},
  {id:4,name:"Skinny High-Rise",   cat:"Jeans",   size:"XS", colour:"Black",price:2199,img:"https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"},
  {id:5,name:"Floral Summer Dress",cat:"Dresses", size:"M",  colour:"Red",  price:2799,img:"https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80"},
  {id:6,name:"Linen Blend Shirt",  cat:"Shirts",  size:"XL", colour:"Green",price:1599,img:"https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80"},
  {id:7,name:"V-Neck Pullover",    cat:"Jackets", size:"L",  colour:"White",price:3299,img:"https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=600&q=80"},
  {id:8,name:"Vintage Straight",   cat:"Jeans",   size:"M",  colour:"Navy", price:2399,img:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"},
  {id:9,name:"Striped Polo",       cat:"T-Shirts",size:"L",  colour:"Navy", price:899, img:"https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=600&q=80"},
  {id:10,name:"Evening Maxi",      cat:"Dresses", size:"S",  colour:"Black",price:4999,img:"https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?auto=format&fit=crop&w=600&q=80"},
];

document.addEventListener('click', e => {
  const link = e.target.closest('a[data-link]');
  if (!link) return;
  e.preventDefault();
  navigate(link.href);
});

async function navigate(url){
  main.classList.add('spa-out');
  await delay(300);
  const res = await fetch(url);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const newMain = doc.querySelector('#spa-root').innerHTML;
  main.innerHTML = newMain;
  document.title = doc.title;
  
  window.history.pushState(null, null, url);
  main.classList.remove('spa-out');
  main.classList.add('spa-in');
  
  router(); // Run logic for new page
}

window.addEventListener('popstate', () => {
    navigate(location.pathname);
});

function delay(ms){ return new Promise(r => setTimeout(r, ms)); }

// ---------- dark-mode toggle ----------
const html = document.documentElement;
const toggle = document.createElement('i');
toggle.className = 'fa-solid fa-circle-half-stroke theme-toggle';
toggle.style.marginLeft = '1rem'; toggle.style.cursor = 'pointer';
document.querySelector('.navbar').appendChild(toggle);

toggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
(function(){
  const saved = localStorage.getItem('theme');
  if (saved) html.setAttribute('data-theme', saved);
})();

// ---------- mobile nav ----------
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('active'));

// ----- footer year -----
document.getElementById('year').textContent = new Date().getFullYear();

// ----- ROUTER -----
function router() {
    const path = location.pathname;
    if (path === '/experience') {
        initClothingGallery();
    } else if (path.startsWith('/product/')) {
        const container = document.getElementById('product-container');
        if (container) {
            initProductPage(parseInt(container.getAttribute('data-id')));
        }
    }
}

/* ===== EXPERIENCE-PAGE ONLY : CLOTHING GALLERY ===== */
function initClothingGallery(){
  const grid        = document.getElementById('clothingGrid');
  const search      = document.getElementById('clothingSearch');
  const categoryF   = document.getElementById('catFilter');
  const sizeF       = document.getElementById('sizeFilter');
  const colourF     = document.getElementById('colourFilter');
  const priceF      = document.getElementById('priceFilter');
  const noRes       = document.getElementById('noResults');

  let filtered = [...catalogue];

  /* ---- render ---- */
  function render(list){
    grid.innerHTML = '';
    if(!list.length){ noRes.style.display='block'; return;}
    noRes.style.display='none';
    list.forEach((p,i)=>{
      const card = document.createElement('div');
      card.className = 'cloth-card animate__animated animate__fadeInUp';
      card.style.animationDelay = `${i*60}ms`;
      // We wrap the image in a link and handle click
      // Also add 'data-link' to use SPA router
      card.innerHTML = `
        <a href="/product/${p.id}" data-link style="display:block; cursor: pointer;">
            <img src="${p.img}" alt="${p.name}">
        </a>
        <div class="cloth-info">
          <h4>${p.name}</h4>
          <span class="meta">${p.cat} • Size ${p.size} • ${p.colour}</span>
          <div class="price">₹${p.price}</div>
          <button class="add-cart" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>`;
      grid.appendChild(card);
    });
  }
  render(filtered);

  /* ---- filters ---- */
  [search,categoryF,sizeF,colourF,priceF].forEach(el=>
    el.addEventListener('input',applyFilters)
  );

  function applyFilters(){
    const term = search.value.toLowerCase();
    const cat  = categoryF.value;
    const size = sizeF.value;
    const col  = colourF.value;
    const pr   = priceF.value;

    filtered = catalogue.filter(p=>{
      const okSearch = !term || p.name.toLowerCase().includes(term) || p.colour.toLowerCase().includes(term);
      const okCat  = !cat  || p.cat===cat;
      const okSize = !size || p.size===size;
      const okCol  = !col  || p.colour===col;
      let okPrice=true;
      if(pr==='0-999')        okPrice=p.price<=999;
      else if(pr==='1000-1999')okPrice=p.price>=1000 && p.price<=1999;
      else if(pr==='2000-4999')okPrice=p.price>=2000 && p.price<=4999;
      else if(pr==='5000+')    okPrice=p.price>=5000;
      return okSearch && okCat && okSize && okCol && okPrice;
    });
    render(filtered);
  }
}

/* ===== PRODUCT PAGE : 3D View ===== */
function initProductPage(id) {
    const product = catalogue.find(p => p.id === id);
    if (!product) return;

    // Set Text
    const nameEl = document.getElementById('p-name');
    const metaEl = document.getElementById('p-meta');
    const priceEl = document.getElementById('p-price');
    const addBtn = document.getElementById('p-add');

    if(nameEl) nameEl.textContent = product.name;
    if(metaEl) metaEl.textContent = `${product.cat} • Size ${product.size} • ${product.colour}`;
    if(priceEl) priceEl.textContent = `₹${product.price}`;
    if(addBtn) {
        addBtn.onclick = () => {
            addBtn.textContent = 'Added ✓';
            setTimeout(() => addBtn.textContent = 'Add to Cart', 1200);
        };
    }

    // Three.js
    const container = document.getElementById('three-canvas-container');
    if (!container) return;
    
    container.innerHTML = ''; // clear loading

    // If THREE is not loaded yet (CDN delay), wait.
    if (typeof THREE === 'undefined') {
        setTimeout(() => initProductPage(id), 100);
        return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // Match card bg

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const loader = new THREE.TextureLoader();
    loader.load(product.img, (texture) => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshStandardMaterial({ map: texture });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        function animate() {
            if(!document.getElementById('three-canvas-container')) return; // Stop if navigated away
            requestAnimationFrame(animate);
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    });
}

function addToCart(id){
    // Stop propagation handled by layout? NO.
    // The link wraps the image. The button is sibling. safe.
  const btn = event.currentTarget;
  btn.innerHTML = 'Added ✓';
  setTimeout(()=>btn.innerHTML='Add to Cart',1200);
}

/* run router on load */
document.addEventListener('DOMContentLoaded',()=>{
  router();
});
const nav = document.querySelector('.navbar');
document.documentElement.style.setProperty('--navbar-height', nav.offsetHeight + 'px');