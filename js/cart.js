const Cart = {
    items: [],

    // 1. ADICIONAR OU AUMENTAR QUANTIDADE
    add(product) {
        let precoLimpo = product.preco || product.preço || 0;
        if (typeof precoLimpo === 'string') {
            precoLimpo = parseFloat(precoLimpo.replace(',', '.'));
        }

        const index = this.items.findIndex(item => item.nome === product.nome);
        
        if (index > -1) {
            this.items[index].quantidade += 1;
        } else {
            this.items.push({
                nome: product.nome,
                preco: precoLimpo,
                quantidade: 1
            });
        }
        
        this.render();
    },

    // 2. DIMINUIR QUANTIDADE
    remove(index) {
        if (this.items[index].quantidade > 1) {
            this.items[index].quantidade -= 1;
        } else {
            this.items.splice(index, 1);
        }
        this.render();
    },

    // 3. AUMENTAR QUANTIDADE
    increase(index) {
        this.items[index].quantidade += 1;
        this.render();
    },

    // 4. ATUALIZAR INTERFACE DO CARRINHO
    render() {
        const cartItems = document.getElementById("cart-items");
        const cartTotal = document.getElementById("cart-total");
        const cartTotalFloat = document.getElementById("cart-total-float");
        
        if (!cartItems) return;

        let total = 0;
        cartItems.innerHTML = "";

        this.items.forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            cartItems.innerHTML += `
                <div class="cart-item-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <div style="flex: 1;">
                        <div style="font-weight: bold;">${item.nome}</div>
                        <div style="font-size: 0.9rem; color: #666;">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="Cart.remove(${index})" style="width:30px; height:30px; border-radius:5px; border:none; background:#eee; cursor:pointer; font-weight:bold;">-</button>
                        <span style="font-weight: bold; min-width: 20px; text-align: center;">${item.quantidade}</span>
                        <button onclick="Cart.increase(${index})" style="width:30px; height:30px; border-radius:5px; border:none; background:#eee; cursor:pointer; font-weight:bold;">+</button>
                    </div>
                </div>
            `;
        });

        if (this.items.length === 0) {
            cartItems.innerHTML = "<p style='text-align:center; color:#999;'>Seu carrinho está vazio.</p>";
        }

        const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;
        if (cartTotal) cartTotal.innerText = totalFormatado;
        if (cartTotalFloat) cartTotalFloat.innerText = totalFormatado;
    },

    // 5. CONTROLE DE MODAIS
    toggle() {
        const modal = document.getElementById("cart-modal");
        if (modal) modal.classList.toggle("hidden");
    },

    checkout() {
        if (this.items.length === 0) {
            alert("Adicione itens antes de finalizar!");
            return;
        }
        document.getElementById("cart-modal").classList.add("hidden");
        document.getElementById("checkout-modal").classList.remove("hidden");
    },

    closeCheckout() {
        document.getElementById("checkout-modal").classList.add("hidden");
        document.getElementById("cart-modal").classList.remove("hidden");
    },

    atualizarTaxa(valor) {
        console.log("Taxa selecionada:", valor);
    },

    // 6. ENVIO PARA WHATSAPP (LIMPO E SEM EMOJIS PROBLEMÁTICOS)
    sendOrder() {
        const nome = document.getElementById("cliente-nome").value;
        const bairroSel = document.getElementById("cliente-bairro");
        const endereco = document.getElementById("cliente-endereco").value;
        const pagamento = document.getElementById("cliente-pagamento").value;
        const obs = document.getElementById("cliente-obs").value;

        if (!nome || !endereco || !pagamento || !bairroSel || bairroSel.value === "0") {
            alert("Por favor, preencha todos os campos obrigatórios!");
            return;
        }

        const bairroNome = bairroSel.options[bairroSel.selectedIndex].text;
        const taxa = parseFloat(bairroSel.value);
        
        let itensTxt = "";
        let totalProdutos = 0;
        this.items.forEach(item => {
            const sub = item.preco * item.quantidade;
            totalProdutos += sub;
            itensTxt += `*${item.quantidade}x* ${item.nome} - R$ ${sub.toFixed(2).replace('.', ',')}\n`;
        });

        const totalGeral = totalProdutos + taxa;
        const config = window.storeConfig || {};
        const nomeLoja = config.nome_loja || "Pedido";
        let fone = config.telefone ? String(config.telefone).replace(/\D/g, '') : "";

        // Garante o código do país se necessário
        if (fone.length > 0 && fone.length <= 11) fone = "55" + fone;

        const msg = encodeURIComponent(
`*${nomeLoja.toUpperCase()}*
-------------------------
*Cliente:* ${nome}
*Endereco:* ${endereco}
*Bairro:* ${bairroNome}
-------------------------
*PEDIDO:*
${itensTxt}
-------------------------
*Taxa de Entrega:* R$ ${taxa.toFixed(2).replace('.', ',')}
*TOTAL DO PEDIDO: R$ ${totalGeral.toFixed(2).replace('.', ',')}*
-------------------------
*Forma de Pagamento:* ${pagamento}
*Observacoes:* ${obs || 'Nenhuma'}
-------------------------
_Pedido enviado via Cardapio Digital_`
        );

        const url = `https://wa.me/${fone}?text=${msg}`;
        window.open(url, '_blank');
    }
};
