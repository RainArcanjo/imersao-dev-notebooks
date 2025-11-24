let cardContainer = document.querySelector(".card-container");

async function iniciarBusca() {
    let searchTerm = document.getElementById("search-input").value.toLowerCase();
    
    let resposta = await fetch("data.json");
    let dados = await resposta.json();

    let filteredData = dados.filter(dado => {
        const nome = dado.nome || '';
        const descricao = dado.descrição || '';
        return nome.toLowerCase().includes(searchTerm) || descricao.toLowerCase().includes(searchTerm);
    });

    renderizarCards(filteredData);
}

function renderizarCards(dadosParaRenderizar) {
    cardContainer.innerHTML = ""; // Limpa os cards existentes

    for (let dado of dadosParaRenderizar) {
        let article = document.createElement("article");
        article.classList.add("card");
        article.innerHTML = `
        <h2>${dado.nome}</h2>
            <p>${dado.ano}</p>
            <p>${dado.descrição}</p>
            <a href="${dado.link}" target="_blank">Saiba Mais</a>
            `;
        cardContainer.appendChild(article);
    }
}