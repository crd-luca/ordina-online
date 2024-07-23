document.addEventListener('DOMContentLoaded', () => {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const menuItems = document.querySelectorAll('.menu-item');
    const cartItemsElement = document.getElementById('cart-items');
    const customizeModal = document.getElementById('customize-modal');
    const ingredientOptions = document.getElementById('ingredient-options');
    const saveCustomizationButton = document.getElementById('save-customization');
    const closeButton = document.querySelector('.close-button');
    let currentItem = null;

    menuItems.forEach(item => {
        item.querySelector('.add-to-cart').addEventListener('click', () => {
            const name = item.dataset.name;
            const price = parseFloat(item.dataset.price);
            let ingredients = item.dataset.ingredients || '';

            // If ingredients were customized, update the item's dataset
            if (item.dataset.customIngredients) {
                ingredients = item.dataset.customIngredients;
                // Reset customIngredients dataset after adding to cart
                delete item.dataset.customIngredients;
            }

            cartItems.push({ name, price, ingredients, quantity: 1 });
            saveCartItems();
            renderCartItems();
        });

        item.querySelector('.customize')?.addEventListener('click', () => {
            currentItem = item;
            const originalIngredients = item.dataset.ingredients.split(', ');
            const customIngredients = item.dataset.customIngredients ? item.dataset.customIngredients.split(', ') : [];

            ingredientOptions.innerHTML = '';
            originalIngredients.forEach(ingredient => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = ingredient;
                checkbox.name = ingredient;
                checkbox.value = ingredient;
                checkbox.checked = customIngredients.includes(ingredient);

                const label = document.createElement('label');
                label.htmlFor = ingredient;
                label.textContent = ingredient;

                const div = document.createElement('div');
                div.appendChild(checkbox);
                div.appendChild(label);
                ingredientOptions.appendChild(div);
            });
            customizeModal.style.display = 'block';
        });
    });

    closeButton.addEventListener('click', () => {
        customizeModal.style.display = 'none';
    });

    saveCustomizationButton.addEventListener('click', () => {
        const selectedIngredients = [];
        ingredientOptions.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.checked) {
                selectedIngredients.push(checkbox.value);
            }
        });
        if (currentItem) {
            currentItem.dataset.customIngredients = selectedIngredients.join(', ');
            customizeModal.style.display = 'none';
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === customizeModal) {
            customizeModal.style.display = 'none';
        }
    });

    // Recupera il parametro dalla URL
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('table');

    document.getElementById('checkout-button').addEventListener('click', () => {
        // Verifica se il carrello contiene almeno un elemento
        if (cartItems.length === 0) {
            alert('Inserisci almeno un elemento nel carrello prima di procedere al checkout.');
            return;
        }

        // Salva gli elementi del carrello nel localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
        // Costruisci l'URL di checkout con il parametro 'table'
        const checkoutUrl = `checkout.html?table=${table}`;
        
        // Reindirizza alla pagina di checkout
        window.location.href = checkoutUrl;
    });

    function saveCartItems() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    function renderCartItems() {
        cartItemsElement.innerHTML = '';
        cartItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');

            // Verifica se l'articolo è una bevanda o un altro tipo di articolo
            const isBeverage = item.ingredients.trim() === '';

            // Item details
            const detailsElement = document.createElement('div');
            detailsElement.classList.add('cart-item-details');
            detailsElement.innerHTML = `
                <div>${item.name}</div>
                <div>Prezzo: ${item.price.toFixed(2)} €</div>
                ${!isBeverage ? `<div>Ingredienti: ${item.ingredients}</div>` : ''}
            `;

            itemElement.appendChild(detailsElement);

            // Quantity controls
            const quantityElement = document.createElement('div');
            quantityElement.classList.add('cart-item-quantity');
            quantityElement.innerHTML = `
                <button class="quantity-button" data-action="decrease" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-button" data-action="increase" data-index="${index}">+</button>
            `;

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Rimuovi';
            removeButton.classList.add('remove-button');
            removeButton.addEventListener('click', () => {
                cartItems.splice(index, 1); // Remove item from cartItems array
                saveCartItems(); // Update localStorage
                renderCartItems(); // Re-render cart items
            });

            // Append details, quantity controls, and remove button to item element
            itemElement.appendChild(detailsElement);
            itemElement.appendChild(quantityElement);
            itemElement.appendChild(removeButton);

            // Append item element to cart items container
            cartItemsElement.appendChild(itemElement);
        });
        aggiornaTotaleCarrello();
        setupQuantityButtons();
    }

    function setupQuantityButtons() {
        const quantityButtons = document.querySelectorAll('.quantity-button');
        quantityButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                const index = parseInt(button.dataset.index);

                if (action === 'decrease') {
                    if (cartItems[index].quantity > 1) {
                        cartItems[index].quantity--;
                    }
                } else if (action === 'increase') {
                    cartItems[index].quantity++;
                }

                saveCartItems();
                renderCartItems(); // Update cart after quantity change
            });
        });
    }

    function aggiornaTotaleCarrello() {
        const totale = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        document.getElementById('totale-carrello').innerText = `Totale: ${totale.toFixed(2)} €`;
    }

    renderCartItems(); // Initial rendering of cart items
});
