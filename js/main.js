// Variável global para armazenar as configurações da loja
window.storeConfig = {};

window.onload = async () => {
    renderSkeletons();

    try {
        const data = await API.load();
        
        if (data && data.config) {
            window.storeConfig = Array.isArray(data.config) ? data.config[0] : data.config;
            
            const storeNameEl = document.getElementById("store-name");
            if (storeNameEl) storeNameEl.innerText = window.storeConfig.nome_loja || "Minha Loja";
            
            // Inicia o Carrossel (Nível 2)
            iniciarCarrosselDinamico();

            const logoImg = document.getElementById("logo");
            if (logoImg && window.storeConfig.logo) {
                // Apenas carrega a imagem, sem analisar cores
                logoImg.src = window.storeConfig.logo + '?v=' + new Date().getTime();
                
                logoImg.onload = () => {
                    const corP = window.storeConfig.cor_principal;
                    const corS = window.storeConfig.cor_secundaria;

                    // Só aplica cores se houver algo preenchido na planilha
                    // Caso contrário, o vermelho do CSS permanece
                    if (corP && corP.trim() !== "" && corP !== "#") {
                        document.documentElement.style.setProperty('--cor-principal', corP);
                    }
                    if (corS && corS.trim() !== "" && corS !== "#") {
                        document.documentElement.style.setProperty('--cor-secundaria', corS);
                    }
                };
            }
        }

        verificarHorario();

        setTimeout(() => {
            if (data.bairros) renderBairros(data.bairros);
            if (data.produtos) renderProducts(data.produtos);
        }, 500);

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
    }
};

// --- FUNÇÃO DO CARROSSEL ---
function iniciarCarrosselDinamico() {
    const config = window.storeConfig;
    const bgElement = document.getElementById("header-bg");
    if (!bgElement) return;

    const imagens = [config.banner1, config.banner2, config.banner3].filter(url => url && url.trim() !== ""); 
    if (imagens.length === 0) return;

    let index = 0;
    const trocarImagem = () => {
        bgElement.style.backgroundImage = `url("${imagens[index]}")`;
        index = (index + 1) % imagens.length;
    };
    trocarImagem();
    if (imagens.length > 1) setInterval(trocarImagem, 6000);
}

// --- VERIFICAÇÃO DE HORÁRIO ---
function verificarHorario() {
    const config = window.storeConfig;
    const statusContainer = document.getElementById("loja-status-msg");
    const btnCart = document.getElementById("btn-finalizar-cart");

    if (!config || !config.abertura || !config.fechamento) return;

    const agora = new Date();
    const horaAtual = agora.getHours().toString().padStart(2, '0') + ":" + agora.getMinutes().toString().padStart(2, '0');
    const abertura = String(config.abertura).substring(0, 5);
    const fechamento = String(config.fechamento).substring(0, 5);

    let estaAberto = (fechamento > abertura) ? (horaAtual >= abertura && horaAtual <= fechamento) : (horaAtual >= abertura || horaAtual < fechamento);

    if (statusContainer) {
        if (estaAberto) {
            statusContainer.innerHTML = "🟢 Aberto agora";
            statusContainer.className = "status-loja aberto";
        } else {
            statusContainer.innerHTML = `🔴 Fechado - Abrimos às ${abertura}`;
            statusContainer.className = "status-loja fechado";
            if (btnCart) { btnCart.disabled = true; btnCart.innerText = "Loja Fechada"; }
        }
    }
}

// --- RENDERIZAÇÃO DE PRODUTOS ---
function renderProducts(produtos) {
    const container = document.getElementById("products");
    if (!container) return;
    
    const ativos = produtos.filter(p => String(p.ativo).toUpperCase() === "SIM");
    
    container.innerHTML = ativos.map(p => {
        const precoNum = parseFloat(String(p.preco || p.preço || 0).replace(',', '.'));
        const produtoJson = JSON.stringify(p).replace(/'/g, "&apos;");
        
        return `
            <div class="product-card">
                <div class="product-card-top">
                    <img src="${p.imagem}" class="product-img" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="product-info">
                        <h3>${p.nome}</h3>
                        <p>${p.descricao || p.descrição || ''}</p>
                    </div>
                </div>
                <div class="product-card-bottom">
                    <div class="product-price">R$ ${precoNum.toFixed(2).replace('.', ',')}</div>
                    <button onclick='Cart.add(${produtoJson})' class="btn-add">Adicionar</button>
                </div>
            </div>`;
    }).join('');
}

function renderSkeletons() {
    const container = document.getElementById("products");
    if (!container) return;
    container.innerHTML = Array(4).fill(`
        <div class="product-card skeleton">
            <div style="display:flex; gap:15px; padding:15px;">
                <div style="width:100px; height:100px; background:#eee; border-radius:12px;"></div>
                <div style="flex:1;">
                    <div style="width:70%; height:15px; background:#eee; margin-bottom:10px;"></div>
                    <div style="width:90%; height:10px; background:#eee;"></div>
                </div>
            </div>
        </div>`).join('');
}

function renderBairros(bairros) {
    const select = document.getElementById("cliente-bairro");
    if (!select) return;
    select.innerHTML = '<option value="0">Selecione o bairro...</option>';
    bairros.forEach(item => {
        const taxaNum = parseFloat(String(item.taxa).replace(',', '.'));
        const opt = new Option(`${item.bairro} - R$ ${taxaNum.toFixed(2).replace('.', ',')}`, taxaNum);
        select.add(opt);
    });
}
