import { useState, useEffect } from 'react';
import { Flame, Plane, ShoppingBag, Utensils, Award, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const InsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/insights/best-by-category`);
      setInsights(response.data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const CategoryCard = ({ title, icon: Icon, card, iconColor, bgColor }) => {
    if (!card) return null;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 card-hover" data-testid={`category-card-${title.toLowerCase().replace(' ', '-')}`}>
        <div className={`${bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-heading font-semibold text-slate-900 mb-2">{title}</h3>
        <div className="space-y-2">
          <div className="text-sm text-slate-500" data-testid="best-card-bank">{card.bank_name}</div>
          <div className="text-xl font-bold text-slate-900" data-testid="best-card-name">{card.card_name}</div>
          <div className="flex items-center justify-between text-sm mt-4">
            <span className="text-slate-600">Reward Rate</span>
            <span className="font-bold text-blue-600" data-testid="best-card-reward">{card.reward_rate > 0 ? `${card.reward_rate}%` : `${card.cashback_rate}% CB`}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Annual Fee</span>
            <span className="font-semibold" data-testid="best-card-fee">{card.annual_fee === 0 ? 'Free' : formatCurrency(card.annual_fee)}</span>
          </div>
        </div>
        <Link 
          to={`/cards/${card.id}`}
          className="block mt-4 bg-slate-900 text-white text-center py-2 rounded-lg hover:bg-slate-800 transition-all text-sm font-semibold"
          data-testid="view-card-btn"
        >
          View Details
        </Link>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen" data-testid="insights-page">
      <div className="gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-4" data-testid="insights-badge">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-white text-sm font-medium">Expert Insights</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4" data-testid="page-title">Best Cards by Category</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto" data-testid="page-description">
              Discover the top-performing credit cards for your specific needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-8 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <CategoryCard 
            title="Best for Travel"
            icon={Plane}
            card={insights?.best_for_travel}
            iconColor="text-blue-600"
            bgColor="bg-blue-100"
          />
          <CategoryCard 
            title="Best for Dining"
            icon={Utensils}
            card={insights?.best_for_dining}
            iconColor="text-amber-600"
            bgColor="bg-amber-100"
          />
          <CategoryCard 
            title="Best for Shopping"
            icon={ShoppingBag}
            card={insights?.best_for_online_shopping}
            iconColor="text-green-600"
            bgColor="bg-green-100"
          />
          <CategoryCard 
            title="Best for Fuel"
            icon={Flame}
            card={insights?.best_for_fuel}
            iconColor="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-6" data-testid="lifetime-free-title">Best Lifetime Free Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {insights?.best_lifetime_free?.map((card) => (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-200 p-6 card-hover" data-testid={`lifetime-free-card-${card.id}`}>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4">Lifetime Free</div>
                <div className="text-sm text-slate-500 mb-1" data-testid="free-card-bank">{card.bank_name}</div>
                <div className="text-xl font-bold text-slate-900 mb-4" data-testid="free-card-name">{card.card_name}</div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Reward/Cashback</span>
                    <span className="font-bold text-blue-600" data-testid="free-card-reward">
                      {card.reward_rate > 0 ? `${card.reward_rate}%` : `${card.cashback_rate}% CB`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Min Income</span>
                    <span className="font-semibold" data-testid="free-card-income">{formatCurrency(card.min_income)}</span>
                  </div>
                </div>
                <Link 
                  to={`/cards/${card.id}`}
                  className="block bg-slate-900 text-white text-center py-2 rounded-lg hover:bg-slate-800 transition-all text-sm font-semibold"
                  data-testid="view-free-card-btn"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 mb-6" data-testid="premium-cards-title">Top Premium Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {insights?.best_premium_cards?.map((card) => (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-200 p-6 card-hover" data-testid={`premium-card-${card.id}`}>
                <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold inline-block mb-4">Premium</div>
                <div className="text-sm text-slate-500 mb-1" data-testid="premium-card-bank">{card.bank_name}</div>
                <div className="text-xl font-bold text-slate-900 mb-4" data-testid="premium-card-name">{card.card_name}</div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Reward Rate</span>
                    <span className="font-bold text-blue-600" data-testid="premium-card-reward">{card.reward_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Annual Fee</span>
                    <span className="font-semibold" data-testid="premium-card-fee">{formatCurrency(card.annual_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Lounge Access</span>
                    <span className="font-semibold text-green-600" data-testid="premium-card-lounge">Yes</span>
                  </div>
                </div>
                <Link 
                  to={`/cards/${card.id}`}
                  className="block bg-slate-900 text-white text-center py-2 rounded-lg hover:bg-slate-800 transition-all text-sm font-semibold"
                  data-testid="view-premium-card-btn"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};