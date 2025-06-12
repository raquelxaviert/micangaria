/**
 * Script para adicionar itens de teste ao carrinho
 */

// Dados de teste para o carrinho
const testCartData = {
  items: [
    {
      productId: '1',
      name: 'Vestido Vintage Anos 70',
      price: 189.90,
      quantity: 1,
      imageUrl: '/images/vintage-dress.jpg'
    },
    {
      productId: '2',
      name: 'Casaco de Lã Retrô',
      price: 259.90,
      quantity: 1,
      imageUrl: '/images/vintage-coat.jpg'
    }
  ],
  customerInfo: {
    name: 'Maria Silva',
    email: 'maria@teste.com',
    phone: '(11) 99999-9999'
  }
};

// Salvar no localStorage
localStorage.setItem('checkout_data', JSON.stringify(testCartData));

console.log('✅ Dados de teste adicionados ao carrinho!');
console.log('Pode agora testar em: http://localhost:9002/checkout-with-shipping');
