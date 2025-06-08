import Link from 'next/link';
import { HandCoins, Sparkles, Info, ShoppingBag } from 'lucide-react'; // Using HandCoins for style advisor for now

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center">
        <Link href="/" className="text-3xl font-headline hover:text-secondary transition-colors">
          Miçangueria
        </Link>
        <nav className="mt-4 sm:mt-0">
          <ul className="flex space-x-4 sm:space-x-6 items-center">
            <li>
              <Link href="/products" className="hover:text-secondary transition-colors flex items-center space-x-1">
                <ShoppingBag size={20} />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link href="/style-advisor" className="hover:text-secondary transition-colors flex items-center space-x-1">
                <Sparkles size={20} /> 
                <span>Style Advisor</span>
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-secondary transition-colors flex items-center space-x-1">
                <Info size={20} />
                <span>About Us</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
