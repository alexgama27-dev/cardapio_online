window.onload = async () => {
    // 1. Busca os dados da API
    const data = await API.load();
    
    // 2. Aplica as Configurações Visuais e Identidade
    if (data.config) {
        document.getElementById("store-name").innerText = data.config.nome_loja;
        document.getElementById("logo").src = data.config.logo;
        
        // Aplica as cores da planilha nas variáveis do CSS
        document.documentElement.style.setProperty('--cor-principal', data.config.cor_principal);
        document.documentElement.style.setProperty('--cor-secundaria', data.config.cor_secundaria || data.config.cor_principal);
    }

    // 3. Renderiza os Bairros no seletor de entrega
    if (data.bairros) {
        renderBairros(data.bairros);
    }

    // 4. Renderiza os Produtos na vitrine
    if (data.produtos) {
        renderProducts(data.produtos);
    }
};

// Função para preencher o Select de Bairros dinamicamente
function renderBairros(bairros) {
    const select = document.getElementById("cliente-bairro");
    if (!select) return;

    // Limpa a opção de "Carregando" e volta ao padrão
    select.innerHTML = '<option value="0">Selecione o bairro...</option>';

    bairros.forEach(item => {
        const opt = document.createElement("option");
        // Converte a taxa para formato numérico (ex: 5.50)
        const taxaNum = parseFloat(String(item.taxa).replace(',', '.'));
        opt.value = taxaNum;
        opt.text = `${item.bairro} - R$ ${taxaNum.toFixed(2).replace('.', ',')}`;
        select.add(opt);
    });
}

// Função para renderizar os cards de produtos
function renderProducts(produtos) {
    const container = document.getElementById("products");
    if (!container) return;

    container.innerHTML = produtos.filter(p => p.ativo === "SIM").map(p => {
        const precoNum = parseFloat(String(p.preco || p.preço || 0).replace(',', '.'));
        return `
            <div class="card">
                <div class="card-info">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao || p.descrição || ''}</p>
                    <div class="price">R$ ${precoNum.toFixed(2).replace('.', ',')}</div>
                    <button onclick='Cart.add(${JSON.stringify(p)})' class="btn-primary">
                        Adicionar
                    </button>
                </div>
                <img src="${p.imagem}" onerror="this.src='https://via.placeholder.com/90'">
            </div>
        `;
    }).join('');
}