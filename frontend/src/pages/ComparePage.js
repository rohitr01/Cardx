import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, X } from 'lucide-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids');
    if (ids) {
      fetchCompareCards(ids.split(','));
    }
  }, [searchParams]);

  const fetchCompareCards = async (cardIds) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/compare`, { card_ids: cardIds });
      setCards(response.data);
    } catch (error) {
      console.error('Error fetching cards for comparison:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="no-cards-selected">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No cards selected for comparison</p>
          <Link to="/cards" className="text-blue-600 hover:underline">Select cards to compare</Link>
        </div>
      </div>
    );
  }

  const comparisonRows = [
    { label: 'Bank', key: 'bank_name' },
    { label: 'Card Name', key: 'card_name' },
    { label: 'Card Type', key: 'card_type', format: (v) => v.replace('_', ' ').toUpperCase() },
    { label: 'Annual Fee', key: 'annual_fee', format: (v) => v === 0 ? 'FREE' : formatCurrency(v) },
    { label: 'Lifetime Free', key: 'is_lifetime_free', format: (v) => v ? 'Yes' : 'No', icon: true },
    { label: 'Reward Rate', key: 'reward_rate', format: (v) => v > 0 ? `${v}%` : 'N/A' },
    { label: 'Cashback Rate', key: 'cashback_rate', format: (v) => v > 0 ? `${v}%` : 'N/A' },
    { label: 'Redemption Ratio', key: 'redemption_ratio', format: (v) => `${v}:1` },
    { label: 'Lounge Access', key: 'lounge_access' },
    { label: 'Forex Markup', key: 'forex_markup', format: (v) => `${v}%` },
    { label: 'Fuel Surcharge Waiver', key: 'fuel_surcharge_waiver', format: (v) => v ? 'Yes' : 'No', icon: true },
    { label: 'Min Income', key: 'min_income', format: (v) => formatCurrency(v) },
    { label: 'Min Credit Score', key: 'min_credit_score', format: (v) => `${v}+` },
    { label: 'EMI Available', key: 'emi_available', format: (v) => v ? 'Yes' : 'No', icon: true }
  ];

  return (
    <div className="bg-slate-50 min-h-screen" data-testid="compare-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <Link to="/cards" className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8" data-testid="back-link">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all cards</span>
        </Link>

        <h1 className="text-4xl font-heading font-bold text-slate-900 mb-8" data-testid="page-title">Compare Credit Cards</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full" data-testid="comparison-table">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-6 text-left bg-slate-50 sticky left-0 z-10">
                  <span className="text-sm font-semibold text-slate-600 uppercase">Feature</span>
                </th>
                {cards.map((card) => (
                  <th key={card.id} className="p-6 text-center min-w-[200px]" data-testid={`card-header-${card.id}`}>
                    <div className="text-sm text-slate-500">{card.bank_name}</div>
                    <div className="text-lg font-heading font-bold text-slate-900 mt-1">{card.card_name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr key={row.key} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`} data-testid={`comparison-row-${row.key}`}>
                  <td className="p-4 font-medium text-slate-700 sticky left-0 bg-inherit z-10">
                    {row.label}
                  </td>
                  {cards.map((card) => {
                    const value = card[row.key];
                    const displayValue = row.format ? row.format(value) : value;
                    
                    return (
                      <td key={card.id} className="p-4 text-center" data-testid={`cell-${card.id}-${row.key}`}>
                        {row.icon && typeof value === 'boolean' ? (
                          value ? (
                            <div className="flex items-center justify-center">
                              <Check className="w-5 h-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <X className="w-5 h-5 text-red-400" />
                            </div>
                          )
                        ) : (
                          <span className="text-slate-900">{displayValue}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">Category Bonuses Comparison</h2>
          <div className="grid md:grid-cols-${cards.length} gap-6">
            {cards.map((card) => (
              <div key={card.id} className="bg-white rounded-2xl border border-slate-200 p-6" data-testid={`category-bonuses-${card.id}`}>
                <h3 className="font-heading font-bold text-slate-900 mb-4">{card.card_name}</h3>
                <div className="space-y-2">
                  {Object.entries(card.category_bonuses).map(([category, rate]) => (
                    <div key={category} className="flex items-center justify-between text-sm" data-testid={`bonus-${card.id}-${category}`}>
                      <span className="text-slate-600 capitalize">{category.replace('_', ' ')}</span>
                      <span className="font-bold text-blue-600">{rate}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};