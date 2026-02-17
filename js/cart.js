const Cart = {
    items: [],

    // Adiciona ao carrinho ou aumenta quantidade se já existir
    add(product) {
        const index = this.items.findIndex(item => item.nome === product.nome);
        
        if (index > -1) {
            this.items[index].quantidade += 1;
        } else {
            this.items.push({
                nome: product.nome,
                preco: parseFloat(String(product.preco || product.preço).replace(',', '.')),
                quantidade: 1
            });
        }
        this.render();
    },

    // Diminui quantidade ou remove
    remove(index) {
        if (this.items[index].quantidade > 1) {
            this.items[index].quantidade -= 1;
        } else {
            this.items.splice(index, 1);
        }
        this.render();
    },

    // Aumenta quantidade direto no carrinho
    increase(index) {
        this.items[index].quantidade += 1;
        this.render();
    },

    // Limpa todo o carrinho
    clear() {
        if (confirm("Deseja realmente esvaziar seu carrinho?")) {
            this.items = [];
            this.render();
        }
    },

    // Atualiza a visualização do carrinho e modais
    render() {
        const cartItems = document.getElementById("cart-items");
        const cartTotal = document.getElementById("cart-total");
        const cartTotalFloat = document.getElementById("cart-total-float");
        
        let total = 0;
        cartItems.innerHTML = "";

        this.items.forEach((item, index) => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;

            cartItems.innerHTML += `
                <div class="cart-item-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: bold;">${item.nome}</div>
                        <div style="font-size: 0.9rem; color: var(--cor-secundaria);">R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="Cart.remove(${index})" style="background: #eee; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">-</button>
                        <span style="font-weight: bold;">${item.quantidade}</span>
                        <button onclick="Cart.increase(${index})" style="background: #eee; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">+</button>
                    </div>
                </div>
            `;
        });

        if (this.items.length === 0) {
            cartItems.innerHTML = "<p style='text-align:center; color:#999;'>Seu carrinho está vazio.</p>";
            // Adiciona botão de esvaziar apenas se houver itens (opcional, mas aqui vamos esconder se vazio)
        } else {
            cartItems.innerHTML += `
                <button onclick="Cart.clear()" style="background: none; border: none; color: #ff4444; font-size: 0.8rem; cursor: pointer; margin-top: 10px; text-decoration: underline;">
                    🗑️ Esvaziar Carrinho
                </button>
            `;
        }

        const totalFormatado = `R$ ${total.toFixed(2).replace('.', ',')}`;
        cartTotal.innerText = totalFormatado;
        cartTotalFloat.innerText = totalFormatado;
    },

    toggle() {
        document.getElementById("cart-modal").classList.toggle("hidden");
    },

    checkout() {
        if (this.items.length === 0) {
            alert("Adicione pelo menos um item para continuar!");
            return;
        }
        this.toggle();
        document.getElementById("checkout-modal").classList.remove("hidden");
    },

    closeCheckout() {
        document.getElementById("checkout-modal").classList.add("hidden");
    },

    atualizarTaxa(valor) {
        // Lógica da taxa de entrega que faremos amanhã/depois
        const taxa = parseFloat(valor);
        this.renderComTaxa(taxa);
    }
};
