// Variável global para armazenar as configurações da loja
window.storeConfig = {};

window.onload = async () => {
    // Inicia o Skeleton Screen (Visual de carregamento)
    renderSkeletons();

    const data = await API.load();
    
    if (data.config) {
        window.storeConfig = data.config;
        document.getElementById("store-name").innerText = data.config.nome_loja;
        
        const logoImg = document.getElementById("logo");
        logoImg.crossOrigin = "Anonymous"; 
        logoImg.src = data.config.logo;

        logoImg.onload = () => {
            Vibrant.from(logoImg.src).getPalette((err, palette) => {
                if (palette && !err) {
                    const primaria = palette.Vibrant ? palette.Vibrant.getHex() : "#ff8c00";
                    const secundaria = palette.DarkVibrant ? palette.DarkVibrant.getHex() : "#ff6a00";
                    const acento = palette.LightVibrant ? palette.LightVibrant.getHex() : "#f1f1f1";

                    document.documentElement.style.setProperty('--cor-principal', primaria);
                    document.documentElement.style.setProperty('--cor-secundaria', secundaria);
                    document.documentElement.style.setProperty('--cor-acento', acento);
                }
            });
        };
    }

    // Pequeno atraso apenas para o efeito visual de carregamento ser suave
    setTimeout(() => {
        if (data.bairros) renderBairros(data.bairros);
        if (data.produtos) renderProducts(data.produtos);
    }, 800);
};

function renderSkeletons() {
    const container = document.getElementById("products");
    if (!container) return;
    
    let skeletonHTML = '';
    for (let i = 0; i < 4; i++) {
        skeletonHTML += `
            <div class="card skeleton-card">
                <div class="card-info">
                    <div class="skeleton-text title"></div>
                    <div class="skeleton-text description"></div>
                    <div class="skeleton-text price-tag"></div>
                </div>
                <div class="skeleton-img"></div>
            </div>
        `;
    }
    container.innerHTML = skeletonHTML;
}

function renderBairros(bairros) {
    const select = document.getElementById("cliente-bairro");
    if (!select) return;

    select.innerHTML = '<option value="0">Selecione o bairro...</option>';

    bairros.forEach(item => {
        const opt = document.createElement("option");
        const taxaNum = parseFloat(String(item.taxa).replace(',', '.'));
        opt.value = taxaNum;
        opt.text = `${item.bairro} - R$ ${taxaNum.toFixed(2).replace('.', ',')}`;
        select.add(opt);
    });
}

function renderProducts(produtos) {
    const container = document.getElementById("products");
    if (!container) return;

    // Filtra apenas produtos ativos
    const ativos = produtos.filter(p => String(p.ativo).toUpperCase() === "SIM");

    container.innerHTML = ativos.map(p => {
        const precoNum = parseFloat(String(p.preco || p.preço || 0).replace(',', '.'));
        const produtoJson = JSON.stringify(p).replace(/'/g, "&apos;");
        
        return `
            <div class="card">
                <div class="card-info">
                    <h3>${p.nome}</h3>
                    <p>${p.descricao || p.descrição || ''}</p>
                    <div class="price">R$ ${precoNum.toFixed(2).replace('.', ',')}</div>
                    <button onclick='Cart.add(${produtoJson})' class="btn-primary" style="margin-top:10px">
                        Adicionar
                    </button>
                </div>
                <img src="${p.imagem}" onerror="this.src='https://via.placeholder.com/95'">
            </div>
        `;
    }).join('');
}
