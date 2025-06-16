import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">Política de Privacidade</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Sua privacidade é importante para nós. Esta política descreve como coletamos, 
            usamos e protegemos suas informações.
          </p>
          <Badge variant="secondary" className="mt-4">
            <Calendar className="h-4 w-4 mr-1" />
            Última atualização: 16 de junho de 2025
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* 1. Informações que Coletamos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                Informações que Coletamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Informações Pessoais:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Número de telefone</li>
                  <li>Endereço de entrega</li>
                  <li>Informações de pagamento (processadas de forma segura)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Informações de Navegação:</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador</li>
                  <li>Páginas visitadas</li>
                  <li>Tempo de permanência no site</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 2. Como Usamos suas Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Como Usamos suas Informações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Processar e entregar seus pedidos</li>
                <li>Comunicar sobre o status de seus pedidos</li>
                <li>Fornecer atendimento ao cliente</li>
                <li>Melhorar nossos produtos e serviços</li>
                <li>Enviar ofertas especiais e promoções (com seu consentimento)</li>
                <li>Prevenir fraudes e atividades maliciosas</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </CardContent>
          </Card>

          {/* 3. Compartilhamento de Informações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                Compartilhamento de Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto nas seguintes situações:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Prestadores de serviços:</strong> Empresas que nos ajudam a operar nosso negócio (processamento de pagamentos, entrega, etc.)</li>
                <li><strong>Obrigações legais:</strong> Quando exigido por lei ou para proteger nossos direitos</li>
                <li><strong>Transferência de negócios:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
                <li><strong>Consentimento:</strong> Quando você nos autoriza expressamente</li>
              </ul>
            </CardContent>
          </Card>

          {/* 4. Segurança */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                Segurança dos Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Criptografia SSL/TLS para todas as transmissões de dados</li>
                <li>Armazenamento seguro em servidores protegidos</li>
                <li>Acesso restrito às informações pessoais</li>
                <li>Monitoramento regular de segurança</li>
                <li>Treinamento de funcionários sobre proteção de dados</li>
              </ul>
            </CardContent>
          </Card>

          {/* 5. Seus Direitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">5</span>
                Seus Direitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                De acordo com a LGPD (Lei Geral de Proteção de Dados), você tem os seguintes direitos:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Solicitar a portabilidade de dados</li>
                <li>Revogar o consentimento</li>
                <li>Revisar decisões automatizadas</li>
              </ul>
            </CardContent>
          </Card>

          {/* 6. Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">6</span>
                Cookies e Tecnologias Similares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies para melhorar sua experiência em nosso site:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Cookies essenciais:</strong> Necessários para o funcionamento do site</li>
                <li><strong>Cookies de performance:</strong> Nos ajudam a entender como você usa o site</li>
                <li><strong>Cookies de funcionalidade:</strong> Lembram suas preferências</li>
                <li><strong>Cookies de marketing:</strong> Personalizam anúncios (apenas com seu consentimento)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Você pode gerenciar suas preferências de cookies nas configurações do seu navegador.
              </p>
            </CardContent>
          </Card>

          {/* 7. Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">7</span>
                Entre em Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou quiser exercer seus direitos, 
                entre em contato conosco:
              </p>
              <div className="space-y-3">                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-primary" />
                  <span>contato@rugebrecho.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-primary" />
                  <span>31 97648505</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <span>São Paulo, SP - Brasil</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nota Final */}
          <Card className="bg-secondary/20 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                Esta Política de Privacidade pode ser atualizada periodicamente. 
                Recomendamos que você a revise regularmente. As alterações entrarão em vigor 
                imediatamente após sua publicação nesta página.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
