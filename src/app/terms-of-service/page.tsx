import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço - Micangueria',
  description: 'Termos de Serviço da Micangueria - Conheça os termos e condições de uso de nossos serviços.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Serviço</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> 16 de junho de 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Ao acessar e usar o site da Micangueria, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-700 mb-4">
              A Micangueria é uma loja online especializada em produtos de miçangas, bijuterias e acessórios artesanais. Oferecemos uma plataforma para compra e venda de produtos relacionados ao universo das miçangas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Conta do Usuário</h2>
            <p className="text-gray-700 mb-4">
              Para realizar compras em nosso site, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade de sua conta e senha e por todas as atividades que ocorrem sob sua conta.
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Você deve fornecer informações precisas e atualizadas</li>
              <li>Você é responsável por manter suas informações de login seguras</li>
              <li>Você deve notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compras e Pagamentos</h2>
            <p className="text-gray-700 mb-4">
              Ao fazer uma compra em nosso site, você concorda com os seguintes termos:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Todos os preços estão sujeitos a alterações sem aviso prévio</li>
              <li>Os pagamentos são processados através de plataformas seguras de terceiros</li>
              <li>Reservamo-nos o direito de recusar ou cancelar pedidos a nosso critério</li>
              <li>As informações de pagamento devem ser precisas e você deve ter autorização para usar o método de pagamento fornecido</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Entrega e Devolução</h2>
            <p className="text-gray-700 mb-4">
              Nossas políticas de entrega e devolução são as seguintes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Os prazos de entrega são estimativas e podem variar</li>
              <li>Produtos defeituosos podem ser devolvidos dentro de 30 dias</li>
              <li>O cliente é responsável pelos custos de devolução, exceto em casos de defeito</li>
              <li>Reembolsos são processados no método de pagamento original</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
            <p className="text-gray-700 mb-4">
              Todo o conteúdo do site, incluindo textos, imagens, logos, e design, é propriedade da Micangueria ou de seus licenciadores e está protegido por leis de direitos autorais e propriedade intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Conduta do Usuário</h2>
            <p className="text-gray-700 mb-4">
              Você concorda em não usar nosso serviço para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Atividades ilegais ou não autorizadas</li>
              <li>Violar direitos de propriedade intelectual</li>
              <li>Transmitir conteúdo prejudicial, ofensivo ou inadequado</li>
              <li>Interferir no funcionamento normal do site</li>
              <li>Tentar obter acesso não autorizado a sistemas ou dados</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700 mb-4">
              A Micangueria não será responsável por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou incapacidade de usar nosso serviço, mesmo que tenhamos sido avisados da possibilidade de tais danos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modificações dos Termos</h2>
            <p className="text-gray-700 mb-4">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação no site. O uso continuado do serviço após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Rescisão</h2>
            <p className="text-gray-700 mb-4">
              Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes termos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Lei Aplicável</h2>
            <p className="text-gray-700 mb-4">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
            <p className="text-gray-700 mb-4">
              Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
            </p>            <ul className="list-none text-gray-700">
              <li><strong>Email:</strong> contato@rugebrecho.com</li>
              <li><strong>Telefone:</strong> 31 97648505</li>
              <li><strong>Endereço:</strong> Belo Horizonte, MG - Brasil</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
