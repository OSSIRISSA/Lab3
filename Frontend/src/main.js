import pizza_info from './PizzaList.js';

document.addEventListener('DOMContentLoaded', () => {
    const pizzaList = document.querySelector('.pizza-list');
    const cartContainer = document.querySelector('.cart-items-container');
    const cartCount = document.getElementById('bought');
    const pizzaCount = document.getElementById('unbought');
    const totalSumElement = document.querySelector('.total-sum');
    const emptyButton = document.querySelector('.empty-button');
    const orderButton = document.querySelector('.cart-footer button');
    const pivotContainer = document.getElementById('pivot-container');
    const cart = JSON.parse(localStorage.getItem('cart')) || {};

    const renderPizzas = (pizzas) => {
        pizzaList.innerHTML = '';
        let pizzaListBetterPerformance = '';
        pizzas.forEach(pizza => {
            pizzaListBetterPerformance += '<div class="pizza-item';
            if (pizza.is_new) {
                pizzaListBetterPerformance += ' new';
            }
            if (pizza.is_popular && !pizza.is_new) {
                pizzaListBetterPerformance += ' popular';
            }
            pizzaListBetterPerformance += '">';
            pizzaListBetterPerformance += `
                <img src="${pizza.icon}" alt="${pizza.title}">
                <h1>${pizza.title}</h1>
                <span>${pizza.type}</span>
                <p>${capitalizeFirstWord(Object.values(pizza.content).flat().join(', '))}</p>
                <div class="pizza-sizes">
                
                    ${pizza.small_size ? `
                    <div class="size">
                        <span><img src="assets/images/size-icon.svg" alt="diameter">${pizza.small_size.size}</span>
                        <span><img src="assets/images/weight.svg" alt="weight">${pizza.small_size.weight}</span>
                        <h2>${pizza.small_size.price}</h2>
                        <p>грн.</p>
                        <button data-id="${pizza.id}" data-size="small">Купити</button>
                    </div>` : ''}
                    
                    ${pizza.big_size ? `
                    <div class="size">
                        <span><img src="assets/images/size-icon.svg" alt="diameter">${pizza.big_size.size}</span>
                        <span><img src="assets/images/weight.svg" alt="weight">${pizza.big_size.weight}</span>
                        <h2>${pizza.big_size.price}</h2>
                        <p>грн.</p>
                        <button data-id="${pizza.id}" data-size="big">Купити</button>
                    </div>` : ''}
                </div>
            `;
            pizzaListBetterPerformance += '</div>';
        });
        pizzaList.innerHTML = pizzaListBetterPerformance;
    };

    const capitalizeFirstWord = (description) => {
        return description.charAt(0).toUpperCase() + description.slice(1);
    };

    const updateCart = () => {
        cartContainer.innerHTML = '';
        let cartContainerBetterPerformance='';
        let totalSum = 0;
        Object.values(cart).forEach(item => {
            const pizza = pizza_info.find(p => p.title === item.title);
            if (!pizza) {
                return;
            }
            cartContainerBetterPerformance += '<div class="cart-item">'
            cartContainerBetterPerformance += `
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.title} (${item.size === 'small' ? 'Мала' : 'Велика'})</span>
                    <div class="cart-item-characteristics">
                        <span><img src="assets/images/size-icon.svg" alt="diameter">${item.size === 'small' ? pizza.small_size.size : pizza.big_size.size}</span>
                        <span><img src="assets/images/weight.svg" alt="weight">${item.size === 'small' ? pizza.small_size.weight : pizza.big_size.weight}</span>
                    </div>
                    <div class="cart-item-actions">
                        <h3>${item.size === 'small' ? pizza.small_size.price * item.count : pizza.big_size.price * item.count} грн</h3>
                        <button class="decrement" data-key="${item.title}_${item.size}">-</button>
                        <h2 class="count">${item.count}</h2>
                        <button class="increment" data-key="${item.title}_${item.size}">+</button>
                        <button class="remove" data-key="${item.title}_${item.size}">⨉</button>
                    </div>
                </div>
                <div class="cart-item-image">
                    <img src="${item.icon}" alt="${item.title}">
                </div>
            `;
            cartContainerBetterPerformance +='</div>'
            totalSum += item.size === 'small' ? pizza.small_size.price * item.count : pizza.big_size.price * item.count;
        });
        cartContainer.innerHTML = cartContainerBetterPerformance;
        cartCount.textContent = Object.keys(cart).length.toString();
        totalSumElement.textContent = `${totalSum} грн`;
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const searchByCategory = (category) => {
        switch (category) {
            case 'all':
                return pizza_info;
            case 'meat':
                return pizza_info.filter(pizza => pizza.content.meat);
            case 'pineapple':
                return pizza_info.filter(pizza => pizza.content.pineapple);
            case 'mushroom':
                return pizza_info.filter(pizza => pizza.content.mushroom);
            case 'ocean':
                return pizza_info.filter(pizza => pizza.content.ocean);
            case 'vegan':
                return pizza_info.filter(pizza => !pizza.content.meat && !pizza.content.ocean);
            default:
                return pizza_info;
        }

    };

    pizzaList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const id = e.target.dataset.id;
            const size = e.target.dataset.size;
            const pizza = pizza_info.find(pizza => pizza.id === parseInt(id));
            const cartKey = `${pizza.title}_${size}`;
            const selectedSize = size === 'small' ? pizza.small_size : pizza.big_size;
            if (!cart[cartKey]) {
                cart[cartKey] = {
                    title: pizza.title,
                    size,
                    count: 0,
                    icon: pizza.icon,
                    price: selectedSize.price,
                    weight: selectedSize.weight
                };
            }
            cart[cartKey].count++;
            updateCart();
        }
    });

    cartContainer.addEventListener('click', (e) => {
        const key = e.target.dataset.key;
        if (key && cart[key]) {
            if (e.target.classList.contains('increment')) {
                cart[key].count++;
            } else if (e.target.classList.contains('decrement')) {
                cart[key].count--;
                if (cart[key].count === 0) delete cart[key];
            } else if (e.target.classList.contains('remove')) {
                delete cart[key];
            }
            updateCart();
        }
    });

    emptyButton.addEventListener('click', () => {
        Object.keys(cart).forEach(key => delete cart[key]);
        updateCart();
    });

    orderButton.addEventListener('click', () => {
        const cartData = Object.values(cart).map(item => ({
            Title: item.title,
            Size: item.size === 'small' ? 'Мала' : 'Велика',
            WeightOne: item.weight,
            Weight: item.weight * item.count,
            Count: item.count,
            Price: item.price,
            Total: item.price * item.count
        }));

        localStorage.setItem('cartData', JSON.stringify(cartData));
        window.open('pivot.html');
    });


    document.querySelectorAll('.category-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.category-button.current').classList.remove('current');
            button.classList.add('current');
            const category = button.id;
            const filteredPizza = searchByCategory(category);
            pizzaCount.textContent = Object.keys(filteredPizza).length.toString();
            renderPizzas(filteredPizza);
        });
    });

    renderPizzas(pizza_info);
    updateCart();
});
