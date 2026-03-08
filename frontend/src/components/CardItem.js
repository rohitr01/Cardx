import { CreditCard, Award, DollarSign, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CardItem = ({ card, onCompareToggle, isSelected }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 card-hover relative" data-testid={`card-item-${card.id}`}>
      {card.is_lifetime_free && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold uppercase" data-testid="lifetime-free-badge">
          Lifetime Free
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-sm text-slate-500 font-medium" data-testid="card-bank">{card.bank_name}</div>
          <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1" data-testid="card-name">{card.card_name}</h3>
        </div>
        <div className="bg-slate-900 p-3 rounded-lg">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold capitalize" data-testid="card-type">
          {card.card_type.replace('_', ' ')}
        </span>
        {card.reward_rate > 0 && (
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold" data-testid="reward-rate">
            {card.reward_rate}% Rewards
          </span>
        )}
        {card.cashback_rate > 0 && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold" data-testid="cashback-rate">
            {card.cashback_rate}% Cashback
          </span>
        )}
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Annual Fee</span>
          <span className="font-semibold text-slate-900" data-testid="annual-fee">
            {card.annual_fee === 0 ? 'Free' : formatCurrency(card.annual_fee)}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Min Income</span>
          <span className="font-semibold text-slate-900" data-testid="min-income">{formatCurrency(card.min_income)}/mo</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Credit Score</span>
          <span className="font-semibold text-slate-900" data-testid="min-credit-score">{card.min_credit_score}+</span>
        </div>
      </div>
      
      {card.lounge_access !== 'None' && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-slate-600" data-testid="lounge-access">
          <Award className="w-4 h-4" />
          <span>{card.lounge_access}</span>
        </div>
      )}
      
      <div className="flex gap-2">
        <Link 
          to={`/cards/${card.id}`} 
          className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all text-center"
          data-testid="view-details-btn"
        >
          View Details
        </Link>
        <button 
          onClick={() => onCompareToggle(card)}
          className={`px-4 py-3 rounded-lg font-semibold transition-all ${
            isSelected 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
          data-testid="compare-toggle-btn"
        >
          {isSelected ? <Check className="w-5 h-5" /> : 'Compare'}
        </button>
      </div>
    </div>
  );
};