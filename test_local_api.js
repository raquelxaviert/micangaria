/**
 * Test script to debug the local shipping API
 */

const fetch = require('node-fetch');

async function testLocalShippingAPI() {
    console.log('🧪 Testing local shipping API...');
    console.log('================================');
    
    const testData = {
        from: {
            postal_code: '01310100',
            address: 'Avenida Paulista',
            number: '1000',
            district: 'Bela Vista',
            city: 'São Paulo',
            state_abbr: 'SP',
            country_id: 'BR'
        },
        to: {
            postal_code: '20040020',
            address: 'Avenida Rio Branco',
            number: '100',
            district: 'Centro',
            city: 'Rio de Janeiro',
            state_abbr: 'RJ',
            country_id: 'BR'
        },
        products: [{
            id: 'test-1',
            width: 20,
            height: 5,
            length: 30,
            weight: 0.5,
            insurance_value: 100,
            quantity: 1,
            unitary_value: 100
        }]
    };

    try {
        console.log('📡 Making request to: http://localhost:9002/api/shipping/calculate');
        console.log('📦 Test data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:9002/api/shipping/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log('\n📊 Response status:', response.status);
        console.log('📊 Response headers:', Object.fromEntries(response.headers));

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
            return;
        }

        const result = await response.json();
        console.log('\n✅ Success! API Response:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.data && result.data.length > 0) {
            console.log('\n📦 Shipping options found:');
            result.data.forEach((option, index) => {
                console.log(`${index + 1}. ${option.name} - R$ ${option.price} (${option.delivery_time} dias)`);
            });
        } else {
            console.log('\n⚠️ No shipping options found in response');
        }

    } catch (error) {
        console.error('❌ Request failed:', error.message);
        console.error('❌ Full error:', error);
    }
}

// Test if server is running
async function testServerHealth() {
    try {
        console.log('🏥 Testing if server is running...');
        const response = await fetch('http://localhost:9002/', {
            method: 'GET'
        });
        console.log('✅ Server is running! Status:', response.status);
        return true;
    } catch (error) {
        console.log('❌ Server is not running or not accessible');
        return false;
    }
}

async function main() {
    const serverRunning = await testServerHealth();
    if (!serverRunning) {
        console.log('Please start the development server with: npm run dev');
        return;
    }
    
    await testLocalShippingAPI();
}

main();
