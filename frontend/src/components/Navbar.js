import { Link } from 'react-router-dom';
import { CreditCard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2" data-testid="navbar-logo">
            <div className="bg-slate-900 p-2 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-slate-900">FinSelect India</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-slate-900 font-medium" data-testid="nav-home">Home</Link>
            <Link to="/cards" className="text-slate-600 hover:text-slate-900 font-medium" data-testid="nav-cards">All Cards</Link>
            <Link to="/compare" className="text-slate-600 hover:text-slate-900 font-medium" data-testid="nav-compare">Compare</Link>
            <Link to="/insights" className="text-slate-600 hover:text-slate-900 font-medium" data-testid="nav-insights">Insights</Link>
            <Link 
              to="/ai-recommend" 
              className="bg-slate-900 text-white px-6 py-2 rounded-full hover:bg-slate-800 transition-all hover:scale-105"
              data-testid="nav-ai-recommend"
            >
              AI Recommend
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2" data-testid="mobile-menu">
            <Link to="/" className="block py-2 text-slate-600 hover:text-slate-900" data-testid="mobile-nav-home">Home</Link>
            <Link to="/cards" className="block py-2 text-slate-600 hover:text-slate-900" data-testid="mobile-nav-cards">All Cards</Link>
            <Link to="/compare" className="block py-2 text-slate-600 hover:text-slate-900" data-testid="mobile-nav-compare">Compare</Link>
            <Link to="/insights" className="block py-2 text-slate-600 hover:text-slate-900" data-testid="mobile-nav-insights">Insights</Link>
            <Link to="/ai-recommend" className="block py-2 text-blue-600 font-semibold" data-testid="mobile-nav-ai">AI Recommend</Link>
          </div>
        )}
      </div>
    </nav>
  );
};