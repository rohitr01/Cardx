import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Award, CreditCard, DollarSign, TrendingUp, Gift, Shield, Plane } from 'lucide-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CardDetailsPage = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCardDetails();
  }, [id]);

  const fetchCardDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cards/${id}`);
      setCard(response.data);
    } catch (error) {
      console.error('Error fetching card details:', error);
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

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="card-not-found">
        <div className="text-center">
          <p className="text-slate-600">Card not found</p>
          <Link to="/cards" className="text-blue-600 hover:underline mt-2">Back to all cards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen" data-testid="card-details-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <Link to="/cards" className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-8" data-testid="back-link">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all cards</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="gradient-hero p-8 md:p-12">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white/80 text-sm mb-2" data-testid="bank-name">{card.bank_name}</div>
                <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4" data-testid="card-name">{card.card_name}</h1>
                <div className="flex flex-wrap gap-2">
                  {card.is_lifetime_free && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold" data-testid="lifetime-free-badge">Lifetime Free</span>
                  )}
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold capitalize" data-testid="card-type">
                    {card.card_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <CreditCard className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-xl p-6" data-testid="fee-card">
                <DollarSign className="w-8 h-8 text-blue-600 mb-3" />
                <div className="text-sm text-slate-600">Annual Fee</div>
                <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
                  {card.annual_fee === 0 ? 'Free' : formatCurrency(card.annual_fee)}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6" data-testid="reward-card">
                <TrendingUp className="w-8 h-8 text-amber-600 mb-3" />
                <div className="text-sm text-slate-600">Reward Rate</div>
                <div className="text-2xl font-heading font-bold text-slate-900 mt-1">
                  {card.reward_rate > 0 ? `${card.reward_rate}%` : `${card.cashback_rate}% CB`}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6" data-testid="redemption-card">
                <Award className="w-8 h-8 text-green-600 mb-3" />
                <div className="text-sm text-slate-600">Redemption Ratio</div>
                <div className="text-2xl font-heading font-bold text-slate-900 mt-1">{card.redemption_ratio}:1</div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Gift className="w-6 h-6 text-blue-600" />
                <span>Welcome Benefits</span>
              </h2>
              <p className="text-slate-700 bg-slate-50 rounded-xl p-4" data-testid="welcome-benefits">{card.welcome_benefits}</p>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">Category Bonuses</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(card.category_bonuses).map(([category, rate]) => (
                  <div key={category} className="flex items-center justify-between bg-slate-50 rounded-xl p-4" data-testid={`category-${category}`}>
                    <span className="text-slate-700 capitalize">{category.replace('_', ' ')}</span>
                    <span className="font-bold text-blue-600">{rate}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Plane className="w-6 h-6 text-blue-600" />
                <span>Lounge Access</span>
              </h2>
              <p className="text-slate-700 bg-slate-50 rounded-xl p-4" data-testid="lounge-access">{card.lounge_access}</p>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">Milestone Benefits</h2>
              <ul className="space-y-2">
                {card.milestone_benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2 text-slate-700" data-testid={`milestone-${index}`}>
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <span>Eligibility Criteria</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600">Minimum Income</div>
                  <div className="text-lg font-bold text-slate-900 mt-1" data-testid="eligibility-income">{formatCurrency(card.min_income)}/month</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="text-sm text-slate-600">Minimum Credit Score</div>
                  <div className="text-lg font-bold text-slate-900 mt-1" data-testid="eligibility-credit-score">{card.min_credit_score}+</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">Redemption Options</h2>
              <div className="flex flex-wrap gap-2">
                {card.redemption_options.map((option, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold" data-testid={`redemption-${index}`}>
                    {option}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mb-4">Additional Details</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                  <span className="text-slate-700">Forex Markup</span>
                  <span className="font-bold text-slate-900" data-testid="forex-markup">{card.forex_markup}%</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                  <span className="text-slate-700">Fuel Surcharge Waiver</span>
                  <span className="font-bold text-slate-900" data-testid="fuel-waiver">{card.fuel_surcharge_waiver ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                  <span className="text-slate-700">EMI Available</span>
                  <span className="font-bold text-slate-900" data-testid="emi-available">{card.emi_available ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                  <span className="text-slate-700">Joining Fee</span>
                  <span className="font-bold text-slate-900" data-testid="joining-fee">{card.joining_fee === 0 ? 'Free' : formatCurrency(card.joining_fee)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};