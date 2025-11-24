let allData = [];
const cardContainer = document.getElementById("card-container");
const resultCount = document.getElementById("result-count");

// Filtros
const searchInput = document.getElementById("search-input");
const filterBrand = document.getElementById("filter-brand");
const filterGpu = document.getElementById("filter-gpu-type");
const filterCpu = document.getElementById("filter-cpu-socket");
const btnClear = document.getElementById("btn-clear");

// Tema
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = themeToggle.querySelector("i");

// Modal de Detalhes
const modalDetails = document.getElementById("modal-details");
const closeDetailsBtn = document.getElementById("close-details");
const modalImg = document.getElementById("modal-img");
const modalBrandTag = document.getElementById("modal-brand-tag");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalYear = document.getElementById("modal-year");
const modalCpu = document.getElementById("modal-cpu");
const modalGpuOrig = document.getElementById("modal-gpu-orig");
const modalGpuType = document.getElementById("modal-gpu-type");
const modalUpgrade = document.getElementById("modal-upgrade");

// Modal Sobre
const modalAbout = document.getElementById("modal-about");
const btnOpenAbout = document.getElementById("open-about");
const closeAboutBtn = document.getElementById("close-about");

// Inicialização
window.onload = async () => {
    // 1. Carrega dados
    try {
        const response = await fetch("data.json");
        allData = await response.json();
        aplicarFiltros(); 
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        cardContainer.innerHTML = "<p>Erro ao carregar base de dados.</p>";
    }

    // 2. Carrega Tema Salvo
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        themeIcon.classList.replace("fa-sun", "fa-moon");
    }
};

// === LÓGICA DO TEMA ===
themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    
    if (currentTheme === "light") {
        // Mudar para Dark
        document.documentElement.removeAttribute("data-theme");
        themeIcon.classList.replace("fa-moon", "fa-sun");
        localStorage.setItem("theme", "dark");
    } else {
        // Mudar para Light
        document.documentElement.setAttribute("data-theme", "light");
        themeIcon.classList.replace("fa-sun", "fa-moon");
        localStorage.setItem("theme", "light");
    }
});

// === LÓGICA DE FILTROS ===
[searchInput, filterBrand, filterGpu, filterCpu].forEach(element => {
    element.addEventListener("input", aplicarFiltros);
});

btnClear.addEventListener("click", limparFiltros);

function aplicarFiltros() {
    const searchTerm = searchInput.value.toLowerCase();
    const brandValue = filterBrand.value;
    const gpuValue = filterGpu.value;
    const cpuValue = filterCpu.value;

    const filteredData = allData.filter(item => {
        // CORREÇÃO: Usando .descricao (sem acento)
        const textMatch = 
            (item.nome || '').toLowerCase().includes(searchTerm) || 
            (item.gpu_original || '').toLowerCase().includes(searchTerm) ||
            (item.descricao || '').toLowerCase().includes(searchTerm);

        const brandMatch = brandValue === 'all' || (item.fabricante === brandValue);
        const gpuMatch = gpuValue === 'all' || (item.tipo_gpu || '').includes(gpuValue);
        const cpuMatch = cpuValue === 'all' || (String(item.cpu_socketada) === cpuValue);

        return textMatch && brandMatch && gpuMatch && cpuMatch;
    });

    renderizarCards(filteredData);
    atualizarContador(filteredData.length);
}

function limparFiltros() {
    searchInput.value = "";
    filterBrand.value = "all";
    filterGpu.value = "all";
    filterCpu.value = "all";
    aplicarFiltros();
}

function renderizarCards(data) {
    cardContainer.innerHTML = "";

    if (data.length === 0) {
        cardContainer.innerHTML = `
            <div style="text-align:center; color: var(--text-muted); grid-column: 1/-1; padding-top: 2rem;">
                <i class="fa-regular fa-face-frown fa-3x"></i>
                <p style="margin-top:10px">Nenhuma workstation encontrada com esses filtros.</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        let brandClass = 'brand-other';
        if (item.fabricante === 'Lenovo') brandClass = 'brand-lenovo';
        if (item.fabricante === 'Dell') brandClass = 'brand-dell';
        if (item.fabricante === 'HP') brandClass = 'brand-hp';

        const imageSrc = item.imagem && item.imagem !== "" ? item.imagem : 'https://via.placeholder.com/400x200/1e1e1e/e0e0e0?text=Sem+Imagem';

        const card = document.createElement("article");
        card.classList.add("card");
        card.onclick = () => abrirModalDetails(item, brandClass, imageSrc);

        // REMOVIDO: A tag <p> com a descrição. Agora só aparece no modal.
        card.innerHTML = `
            <div class="card-header">
                <span class="brand-tag ${brandClass}">${item.fabricante}</span>
                <img src="${imageSrc}" alt="${item.nome}" loading="lazy">
            </div>
            <div class="card-body">
                <h2>${item.nome}</h2>
                <ul class="specs-list">
                    <li><i class="fa-solid fa-calendar"></i> ${item.ano}</li>
                    <li><i class="fa-solid fa-microchip"></i> CPU: ${item.cpu_socketada ? '<span style="color:#4caf50">Socket</span>' : '<span style="color:#f44336">BGA</span>'}</li>
                    <li><i class="fa-solid fa-arrow-up-right-dots"></i> ${item.tipo_gpu || 'N/A'}</li>
                </ul>
                <div class="upgrade-badge">
                    <i class="fa-solid fa-info-circle"></i> Ver Detalhes
                </div>
            </div>
        `;
        cardContainer.appendChild(card);
    });
}

function atualizarContador(count) {
    resultCount.textContent = `${count} máquinas encontradas no acervo.`;
}

// === LÓGICA DO MODAL DETALHES ===
function abrirModalDetails(item, brandClass, imageSrc) {
    modalImg.src = imageSrc;
    modalBrandTag.textContent = item.fabricante;
    modalBrandTag.className = `brand-tag ${brandClass}`; 
    
    modalTitle.textContent = item.nome;
    
    // CORREÇÃO: Usando .descricao (sem acento)
    modalDesc.textContent = item.descricao;
    
    modalYear.textContent = item.ano;
    
    modalCpu.innerHTML = item.cpu_socketada ? '<span style="color:#4caf50">Socket (Trocável)</span>' : '<span style="color:#f44336">Soldada (BGA)</span>';
    modalGpuOrig.textContent = item.gpu_original;
    modalGpuType.textContent = item.tipo_gpu;
    modalUpgrade.textContent = item.melhor_upgrade_gpu;

    modalDetails.style.display = "flex";
}

closeDetailsBtn.onclick = () => {
    modalDetails.style.display = "none";
}

// === LÓGICA DO MODAL SOBRE ===
btnOpenAbout.onclick = (e) => {
    e.preventDefault();
    modalAbout.style.display = "flex";
}

closeAboutBtn.onclick = () => {
    modalAbout.style.display = "none";
}

// FECHAR AO CLICAR FORA (GLOBAL)
window.onclick = function(event) {
    if (event.target == modalDetails) {
        modalDetails.style.display = "none";
    }
    if (event.target == modalAbout) {
        modalAbout.style.display = "none";
    }
}