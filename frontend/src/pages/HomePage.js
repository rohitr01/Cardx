import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, ArrowRight, CheckCircle, Star, TrendingUp, Shield, 
  Zap, Users, Award, Search, ChevronRight, Sparkles, Plane, 
  ShoppingBag, Fuel, Gift, Calculator, BarChart3, Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const HomePage = () => {
  const [popularCards, setPopularCards] = useState([]);
  const [stats, setStats] = useState({ cards: 50, banks: 15, categories: 10 });

  useEffect(() => {
    fetchPopularCards();
  }, []);

  const fetchPopularCards = async () => {
    try {
      const res = await axios.get(`${API}/cards`);
      setPopularCards(res.data.slice(0, 4));
      const uniqueBanks = new Set(res.data.map(c => c.bank_name));
      setStats({ 
        cards: res.data.length, 
        banks: uniqueBanks.size, 
        categories: 10 
      });
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    }
  };

  return (
    <div className="bg-white" data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjggMjggMCAxIDAgNTYgMGEyOCAyOCAwIDEgMCAtNTYgMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L2c+PC9zdmc+')] opacity-40" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-white/90 text-sm">AI-Powered Card Recommendations</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Perfect</span> Credit Card
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-lg">
                Compare 50+ credit cards from top Indian banks. Get personalized recommendations based on your spending habits and maximize your rewards.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/cards">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl">
                    Explore Cards
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/recommend">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                    Get AI Recommendation
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-8">
                <div>
                  <div className="text-3xl font-bold text-white">{stats.cards}+</div>
                  <div className="text-white/60 text-sm">Credit Cards</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{stats.banks}+</div>
                  <div className="text-white/60 text-sm">Banks</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">{stats.categories}+</div>
                  <div className="text-white/60 text-sm">Categories</div>
                </div>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={`bg-gradient-to-br ${
                      i === 1 ? 'from-blue-600 to-blue-800' :
                      i === 2 ? 'from-purple-600 to-purple-800' :
                      i === 3 ? 'from-emerald-600 to-emerald-800' :
                      'from-amber-600 to-amber-800'
                    } rounded-2xl p-6 ${i === 1 || i === 4 ? 'translate-y-8' : ''}`}
                  >
                    <CreditCard className="w-10 h-10 text-white/80 mb-4" />
                    <div className="h-3 bg-white/20 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose FinSelect?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We make finding the right credit card simple, transparent, and personalized
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Smart Search', desc: 'Filter by fees, rewards, benefits, and more' },
              { icon: Calculator, title: 'Rewards Calculator', desc: 'Estimate your yearly rewards and savings' },
              { icon: BarChart3, title: 'Side-by-Side Compare', desc: 'Compare up to 5 cards at once' },
              { icon: Sparkles, title: 'AI Recommendations', desc: 'Get personalized card suggestions' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cards Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Credit Cards</h2>
              <p className="text-slate-600">Highly rated cards loved by our users</p>
            </div>
            <Link to="/cards">
              <Button variant="outline">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularCards.map((card) => (
              <Link 
                key={card.id} 
                to={`/cards/${card.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-sm">{card.bank_name}</span>
                    {card.is_lifetime_free && (
                      <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Free</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{card.card_name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-medium">{card.overall_rating || 4.0}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-slate-500">Annual Fee</span>
                    <span className="font-semibold text-slate-900">
                      {card.annual_fee === 0 ? 'Free' : `₹${card.annual_fee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Value Back</span>
                    <span className="font-semibold text-blue-600">
                      {card.value_back_percent || card.reward_rate || card.cashback_rate}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Browse by Category</h2>
            <p className="text-slate-400">Find cards that match your lifestyle</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Plane, label: 'Travel', color: 'bg-blue-500' },
              { icon: ShoppingBag, label: 'Shopping', color: 'bg-purple-500' },
              { icon: Fuel, label: 'Fuel', color: 'bg-orange-500' },
              { icon: Gift, label: 'Cashback', color: 'bg-green-500' },
              { icon: Award, label: 'Premium', color: 'bg-amber-500' },
              { icon: Zap, label: 'Rewards', color: 'bg-pink-500' },
            ].map((cat, idx) => (
              <Link
                key={idx}
                to={`/cards?type=${cat.label.toLowerCase()}`}
                className="bg-slate-800 hover:bg-slate-700 rounded-2xl p-6 text-center transition-colors group"
              >
                <div className={`${cat.color} w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-white font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Find your perfect card in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Tell Us Your Needs', desc: 'Share your spending habits, income, and preferences' },
              { num: '2', title: 'Get Recommendations', desc: 'Our AI analyzes 50+ cards to find the best matches' },
              { num: '3', title: 'Apply Confidently', desc: 'Check eligibility and apply directly through our partners' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/recommend">
              <Button size="lg" className="px-8 py-6 text-lg rounded-xl">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Users Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Rahul S.', role: 'Frequent Traveler', quote: 'Found the perfect travel card with unlimited lounge access. Saved ₹50,000 in the first year!' },
              { name: 'Priya M.', role: 'Online Shopper', quote: 'The cashback recommendations were spot on. Now I earn 5% back on all my Amazon purchases.' },
              { name: 'Vikram K.', role: 'Business Owner', quote: 'The comparison tool helped me choose the right corporate card for my business expenses.' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border">
                <Quote className="w-10 h-10 text-blue-100 mb-4" />
                <p className="text-slate-700 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Find Your Perfect Card?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of users who've discovered the best credit cards for their needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-6 text-lg rounded-xl">
                Create Free Account
              </Button>
            </Link>
            <Link to="/cards">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl">
                Browse Cards
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-white">FinSelect</span>
              </Link>
              <p className="text-slate-400 text-sm">
                India's most comprehensive credit card comparison platform. Find, compare, and apply for the best cards.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/cards" className="text-slate-400 hover:text-white text-sm">All Cards</Link></li>
                <li><Link to="/compare" className="text-slate-400 hover:text-white text-sm">Compare Cards</Link></li>
                <li><Link to="/recommend" className="text-slate-400 hover:text-white text-sm">AI Recommend</Link></li>
                <li><Link to="/insights" className="text-slate-400 hover:text-white text-sm">Insights</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2">
                <li><Link to="/cards?type=travel" className="text-slate-400 hover:text-white text-sm">Travel Cards</Link></li>
                <li><Link to="/cards?type=cashback" className="text-slate-400 hover:text-white text-sm">Cashback Cards</Link></li>
                <li><Link to="/cards?type=rewards" className="text-slate-400 hover:text-white text-sm">Rewards Cards</Link></li>
                <li><Link to="/cards?type=premium" className="text-slate-400 hover:text-white text-sm">Premium Cards</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white text-sm">Help Center</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2025 FinSelect India. All rights reserved. Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
