const Cart = {
    items: [],
    bairrosData: [],   // <-- Array com os bairros e taxas vindo da API
    taxaEntrega: 0,    // Taxa de entrega atual baseada no bairro

    add: function(product) {
        const existingItem = this.items.find(item => item.nome === product.nome);
        if (existingItem) {
            existingItem.quantidade = (existingItem.quantidade || 1) + 1;
        } else {
            this.items.push({ ...product, quantidade: 1 });
        }
        this.render();
        this.update();
    },

    remove: function(index) {
        if (this.items[index].quantidade > 1) {
            this.items[index].quantidade -= 1;
        } else {
            this.items.splice(index, 1);
        }
        this.render();
        this.update();
    },

    clear: function() {
        if (this.items.length === 0) return;
        if (confirm("Deseja realmente remover todos os itens do pedido?")) {
            this.items = [];
            this.render();
            this.update();
            this.toggle();
        }
    },

    render: function() {
        const container = document.getElementById("cart-items");
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = "<p style='text-align:center; padding:20px; color:#666;'>Seu carrinho está vazio.</p>";
            return;
        }

        container.innerHTML = this.items.map((item, index) => {
            const preco = parseFloat(String(item.preco || item.preço || 0).replace(',', '.'));
            const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");
            return `
                <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                    <div class="cart-item-info">
                        <strong>${item.nome}</strong><br>
                        <span>R$ ${(preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="cart-controls" style="display: flex; align-items: center; gap: 12px;">
                        <button onclick="Cart.remove(${index})" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ccc; background: #fff; cursor: pointer;">-</button>
                        <span style="font-weight: bold;">${item.quantidade}</span>
                        <button onclick='Cart.add(${itemJson})' style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #ccc; background: #fff; cursor: pointer;">+</button>
                    </div>
                </div>`;
        }).join('');
    },

    toggle: function() {
        const modal = document.getElementById("cart-modal");
        if (modal) modal.classList.toggle("hidden");
    },

    checkout: function() {
        if (this.items.length === 0) { alert("Adicione pelo menos um item!"); return; }
        this.toggle();
        document.getElementById("checkout-modal").classList.remove("hidden");
    },

    closeCheckout: function() {
        document.getElementById("checkout-modal").classList.add("hidden");
    },

    // =========================================
    // NOVA FUNÇÃO: identifica bairro digitado
    // =========================================
    identificarBairro: function(nomeDigitado) {
        if (!nomeDigitado || nomeDigitado.length < 3) {
            this.taxaEntrega = 0;
            this.update();
            document.getElementById('taxa-status').innerText = "";
            return;
        }

        // Busca o bairro na lista (ignorando maiúsculas/minúsculas e acentos)
        const bairroEncontrado = this.bairrosData.find(b => 
            b.bairro.toLowerCase().trim() === nomeDigitado.toLowerCase().trim()
        );

        if (bairroEncontrado) {
            const taxa = parseFloat(String(bairroEncontrado.taxa).replace(',', '.'));
            this.taxaEntrega = taxa;
            const statusEl = document.getElementById('taxa-status');
            statusEl.innerHTML = `✅ Bairro atendido! Taxa: R$ ${taxa.toFixed(2).replace('.', ',')}`;
            statusEl.style.color = "green";
        } else {
            this.taxaEntrega = 0;
            const statusEl = document.getElementById('taxa-status');
            statusEl.innerText = "Bairro ainda não reconhecido...";
            statusEl.style.color = "#666";
        }

        this.update();
    },

    // =========================================
    // ATUALIZA TOTAL
    // =========================================
    update: function() {
        const subtotal = this.items.reduce((acc, item) => {
            const preco = parseFloat(String(item.preco || item.preço || 0).replace(',', '.'));
            return acc + (preco * item.quantidade);
        }, 0);

        const totalGeral = subtotal + (this.taxaEntrega || 0);

        const totalEl = document.getElementById("cart-total");
        if (totalEl) totalEl.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;

        const floatTotalEl = document.getElementById("cart-total-float");
        if (floatTotalEl) floatTotalEl.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    },

    sendOrder: function() {
        const nome = document.getElementById("cliente-nome").value;
        const bairroNome = document.getElementById("cliente-bairro").value;
        const taxaTexto = "R$ " + (this.taxaEntrega || 0).toFixed(2).replace('.', ',');
        const endereco = document.getElementById("cliente-endereco").value;
        const pagamento = document.getElementById("cliente-pagamento").value;
        const obs = document.getElementById("cliente-obs").value || "Nenhuma";

        if (!nome || !endereco || !pagamento || !bairroNome) {
            alert("Por favor, preencha todos os campos obrigatórios!");
            return;
        }

        let foneRaw = window.storeConfig.telefone ? String(window.storeConfig.telefone).replace(/\D/g, '') : "";
        if (foneRaw.length <= 11) foneRaw = "55" + foneRaw;

        let mensagem = `*${window.storeConfig.nome_loja}*\n`;
        mensagem += `-------------------------\n`;
        mensagem += `*Cliente:* ${nome}\n`;
        mensagem += `*Endereco:* ${endereco}\n`;
        mensagem += `*Bairro:* ${bairroNome} - ${taxaTexto}\n`;
        mensagem += `-------------------------\n`;
        mensagem += `*PEDIDO:*\n`;
        
        this.items.forEach(item => {
            const preco = parseFloat(String(item.preco || item.preço || 0).replace(',', '.'));
            mensagem += `${item.quantidade}x ${item.nome} - R$ ${(preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
        });

        const totalGeral = document.getElementById("cart-total").innerText;
        mensagem += `\n-------------------------\n`;
        mensagem += `*Taxa de Entrega:* ${taxaTexto}\n`;
        mensagem += `*TOTAL DO PEDIDO:* ${totalGeral}\n`;
        mensagem += `-------------------------\n`;
        mensagem += `*Forma de Pagamento:* ${pagamento}\n`;
        mensagem += `*Observacoes:* ${obs}\n`;
        mensagem += `-------------------------\n`;
        mensagem += `_Pedido enviado via Cardapio Digital_`;

        const url = `https://api.whatsapp.com/send?phone=${foneRaw}&text=${encodeURIComponent(mensagem)}`;
        window.open(url, "_blank");
    }
};
