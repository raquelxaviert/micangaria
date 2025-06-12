# Test shipping calculation API
$body = @{
    from = @{
        postal_code = "01310100"
        address = "Avenida Paulista"
        number = "1000"
        district = "Bela Vista"
        city = "São Paulo"
        state_abbr = "SP"
        country_id = "BR"
    }
    to = @{
        postal_code = "20040020"
        address = "Rua Teste"
        number = "100"
        district = "Centro"
        city = "Rio de Janeiro"
        state_abbr = "RJ"
        country_id = "BR"
    }
    products = @(
        @{
            id = "1"
            width = 20
            height = 5
            length = 30
            weight = 0.3
            insurance_value = 100
            quantity = 1
            unitary_value = 100
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:9002/api/shipping/calculate" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Success! Found shipping options:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error:" $_.Exception.Message
    Write-Host "Response:" $_.Exception.Response
}
