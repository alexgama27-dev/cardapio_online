const Cart = {
    items: [],
    taxaEntrega: 0,

    add(product) {
        const valor = parseFloat(String(product.preco || product.preço || 0).replace(',', '.'));
        const itemExistente = this.items.find(item => item.id === product.id);
        
        if (itemExistente) {
            itemExistente.qtd++;
        } else {
            this.items.push({ ...product, preco: valor, qtd: 1 });
        }
        this.render();
    },

    atualizarTaxa(valor) {
        this.taxaEntrega = parseFloat(valor);
        this.render();
    },

    getTotal() {
        const subtotal = this.items.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
        return subtotal + this.taxaEntrega;
    },

    render() {
        const total = this.getTotal();
        const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;
        
        if(document.getElementById("cart-total-float")) document.getElementById("cart-total-float").innerText = totalFormatado;
        if(document.getElementById("cart-total")) document.getElementById("cart-total").innerText = totalFormatado;

        const container = document.getElementById("cart-items");
        if (container) {
            container.innerHTML = this.items.map(item => `
                <div class="cart-item-row" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px dashed #eee;">
                    <span><strong>${item.qtd}x</strong> ${item.nome}</span>
                    <span>R$ ${(item.preco * item.qtd).toFixed(2).replace('.', ',')}</span>
                </div>
            `).join('');

            if (this.taxaEntrega > 0) {
                container.innerHTML += `
                    <div style="display:flex; justify-content:space-between; margin-top:10px; color: #27ae60; font-weight:bold;">
                        <span>Taxa de Entrega</span>
                        <span>R$ ${this.taxaEntrega.toFixed(2).replace('.', ',')}</span>
                    </div>
                `;
            }
        }
    },

    toggle() { document.getElementById("cart-modal").classList.toggle("hidden"); },
    
    checkout() {
        if (this.items.length === 0) return alert("Seu carrinho está vazio!");
        this.toggle();
        document.getElementById("checkout-modal").classList.remove("hidden");
    },

    closeCheckout() { document.getElementById("checkout-modal").classList.add("hidden"); },

    sendOrder() {
        const nome = document.getElementById("cliente-nome").value;
        const endereco = document.getElementById("cliente-endereco").value;
        const bairroSelect = document.getElementById("cliente-bairro");
        
        // Pega apenas o nome do bairro, sem o valor da taxa
        const bairroTextoCompleto = bairroSelect.options[bairroSelect.selectedIndex].text;
        const bairroNome = bairroTextoCompleto.split(' - ')[0]; 
        
        const pagto = document.getElementById("cliente-pagamento").value;
        const obs = document.getElementById("cliente-obs").value;

        if (!nome || !endereco || pagto === "" || bairroSelect.value === "0") {
            return alert("⚠️ Por favor, preencha todos os campos e selecione o bairro!");
        }

        // Pop-up de aviso para Pix
        if (pagto === "Pix") {
            alert("📢 LEMBRETE: Após enviar a mensagem no WhatsApp, não esqueça de mandar o COMPROVANTE do Pix para iniciarmos o seu pedido!");
        }

        const subtotal = this.items.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
        const totalGeral = subtotal + this.taxaEntrega;

        // Montagem da mensagem limpa e profissional
        let msg = `*🟢 NOVO PEDIDO - ${window.storeConfig.nome_loja}*\n`;
        msg += `------------------------------------------\n`;
        msg += `👤 *Cliente:* ${nome}\n`;
        msg += `📍 *Bairro:* ${bairroNome}\n`;
        msg += `🏠 *Endereço:* ${endereco}\n`;
        msg += `💳 *Pagamento:* ${pagto}\n`;
        
        if(obs.trim() !== "") {
            msg += `💬 *Obs:* ${obs}\n`;
        }
        
        msg += `------------------------------------------\n`;
        msg += `🛒 *ITENS DO PEDIDO:*\n`;
        
        this.items.forEach(i => {
            msg += `*${i.qtd}x* ${i.nome} _(R$ ${i.preco.toFixed(2).replace('.', ',')})_\n`;
        });
        
        msg += `------------------------------------------\n`;
        msg += `💵 *Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
        msg += `🛵 *Taxa de Entrega:* R$ ${this.taxaEntrega.toFixed(2).replace('.', ',')}\n`;
        msg += `💰 *TOTAL A PAGAR:* *R$ ${totalGeral.toFixed(2).replace('.', ',')}*\n`;
        msg += `------------------------------------------\n`;

        if (pagto === "Pix") {
            msg += `\n⚠️ *Aguardamos o comprovante do Pix abaixo.*`;
        }

        // Limpeza do telefone e abertura do link
        const foneLoja = String(window.storeConfig.telefone).replace(/\D/g, '');
        const url = `https://wa.me/${foneLoja}?text=${encodeURIComponent(msg)}`;
        
        window.open(url, '_blank');
    }
};
