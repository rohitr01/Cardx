import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <div className="gradient-hero min-h-[600px] flex items-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.1),transparent)]" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20" data-testid="hero-badge">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white text-sm font-medium">AI-Powered Recommendations</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-heading font-bold text-white leading-tight tracking-tight" data-testid="hero-title">
              Find Your Perfect
              <span className="block text-amber-400">Credit Card</span>
            </h1>
            
            <p className="text-lg text-slate-300 leading-relaxed max-w-xl" data-testid="hero-description">
              Compare 50+ credit cards from top Indian banks. Get personalized recommendations based on your spending habits and maximize your rewards.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/cards" 
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-semibold hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-xl text-center"
                data-testid="hero-cta-explore"
              >
                Explore Cards
              </Link>
              <Link 
                to="/ai-recommend" 
                className="bg-blue-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 shadow-xl text-center"
                data-testid="hero-cta-ai"
              >
                Get AI Recommendation
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center" data-testid="hero-stat-cards">
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm text-slate-300">Credit Cards</div>
              </div>
              <div className="text-center" data-testid="hero-stat-banks">
                <div className="text-3xl font-bold text-white">15+</div>
                <div className="text-sm text-slate-300">Banks</div>
              </div>
              <div className="text-center" data-testid="hero-stat-categories">
                <div className="text-3xl font-bold text-white">10+</div>
                <div className="text-sm text-slate-300">Categories</div>
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1770048532658-14834b7acef8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODh8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBidXNpbmVzc21hbiUyMHNtYXJ0cGhvbmUlMjBtb2Rlcm4lMjBvZmZpY2V8ZW58MHx8fHwxNzcyOTM2NTc5fDA&ixlib=rb-4.1.0&q=85"
                alt="Credit Card Management"
                className="rounded-2xl shadow-2xl"
                data-testid="hero-image"
              />
              
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">₹25,000</div>
                    <div className="text-sm text-slate-600">Avg. Yearly Rewards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 card-hover" data-testid="feature-card-smart">
            <Shield className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-white mb-2">Smart Filtering</h3>
            <p className="text-slate-300 text-sm">Filter by income, credit score, and spending categories to find your perfect match.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 card-hover" data-testid="feature-card-reward">
            <TrendingUp className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-white mb-2">Reward Calculator</h3>
            <p className="text-slate-300 text-sm">See exact rewards you'll earn based on your spending patterns.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 card-hover" data-testid="feature-card-compare">
            <Zap className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-lg font-heading font-semibold text-white mb-2">Side-by-Side Compare</h3>
            <p className="text-slate-300 text-sm">Compare up to 5 cards at once to make the best decision.</p>
          </div>
        </div>
      </div>
    </div>
  );
};