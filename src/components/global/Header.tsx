import Link from 'next/link';
import { Sparkles, Info, ShoppingBag } from 'lucide-react'; 

export function Header() {
  return (
    <header className="bg-card text-foreground shadow-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <Link href="/" className="text-3xl font-headline hover:text-primary transition-colors">
          miçangaria
        </Link>
        <nav className="mt-4 sm:mt-0">
          <ul className="flex space-x-4 sm:space-x-6 items-center">
            <li>
              <Link href="/products" className="hover:text-primary transition-colors flex items-center space-x-1">
                <ShoppingBag size={20} />
                <span>Produtos</span>
              </Link>
            </li>
            <li>
              <Link href="/style-advisor" className="hover:text-primary transition-colors flex items-center space-x-1">
                <Sparkles size={20} /> 
                <span>Consultor de Estilo</span>
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors flex items-center space-x-1">
                <Info size={20} />
                <span>Sobre Nós</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
