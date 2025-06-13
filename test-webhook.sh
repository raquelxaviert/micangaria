#!/bin/bash

# Teste manual do webhook
# Execute este comando para simular um webhook do Mercado Pago

curl -X POST https://www.rugebrecho.com/api/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1749825334,v1=test123" \
  -H "x-request-id: test-request-123" \
  -d '{
    "action": "payment.updated",
    "api_version": "v1", 
    "data": {
      "id": "1337578027"
    },
    "date_created": "2025-06-13T14:36:22Z",
    "id": 122067094933,
    "live_mode": false,
    "type": "payment",
    "user_id": "2490474713"
  }' \
  --verbose
