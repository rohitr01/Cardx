import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, Plus, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const defaultCard = {
  bank_name: '',
  card_name: '',
  card_network: 'Visa',
  card_type: 'rewards',
  category_tags: [],
  overall_rating: 4.0,
  joining_fee: 0,
  annual_fee: 0,
  is_lifetime_free: false,
  reward_rate: 0,
  cashback_rate: 0,
  value_back_percent: 0,
  lounge_access_summary: '',
  forex_markup: 3.5,
  welcome_bonus_summary: '',
  card_description: '',
  best_suited_for: [],
  key_benefits: [],
  lounge_access: '',
  fuel_surcharge_waiver: false,
  min_income: 0,
  min_credit_score: 700,
  pros: [],
  cons: [],
  faqs: [],
  affiliate_link: '',
  bank_apply_link: ''
};

export const AdminCardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [card, setCard] = useState(defaultCard);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newSuitedFor, setNewSuitedFor] = useState('');

  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      fetchCard();
    }
  }, [id]);

  const fetchCard = async () => {
    try {
      const res = await axios.get(`${API}/cards/${id}`);
      setCard(res.data);
    } catch (error) {
      toast.error('Failed to load card');
      navigate('/admin/cards');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCard({ ...card, [field]: value });
  };

  const addToArray = (field, value, setter) => {
    if (value.trim()) {
      setCard({ ...card, [field]: [...(card[field] || []), value.trim()] });
      setter('');
    }
  };

  const removeFromArray = (field, index) => {
    const newArray = [...(card[field] || [])];
    newArray.splice(index, 1);
    setCard({ ...card, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const headers = getAuthHeader();
      if (isEdit) {
        await axios.put(`${API}/admin/cards/${id}`, card, { headers });
        toast.success('Card updated successfully');
      } else {
        await axios.post(`${API}/admin/cards`, card, { headers });
        toast.success('Card created successfully');
      }
      navigate('/admin/cards');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/admin/cards')}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEdit ? 'Edit Card' : 'Add New Card'}
              </h1>
              <p className="text-slate-500">{isEdit ? `Editing ${card.card_name}` : 'Create a new credit card'}</p>
            </div>
          </div>
          <Button type="submit" disabled={saving} data-testid="save-card-btn">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isEdit ? 'Update Card' : 'Create Card'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Bank Name *</label>
                <input
                  type="text"
                  value={card.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Card Name *</label>
                <input
                  type="text"
                  value={card.card_name}
                  onChange={(e) => handleChange('card_name', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Card Network</label>
                  <select
                    value={card.card_network}
                    onChange={(e) => handleChange('card_network', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                    <option value="RuPay">RuPay</option>
                    <option value="Diners">Diners Club</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Card Type</label>
                  <select
                    value={card.card_type}
                    onChange={(e) => handleChange('card_type', e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="rewards">Rewards</option>
                    <option value="cashback">Cashback</option>
                    <option value="travel">Travel</option>
                    <option value="premium">Premium</option>
                    <option value="fuel">Fuel</option>
                    <option value="shopping">Shopping</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Overall Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={card.overall_rating}
                  onChange={(e) => handleChange('overall_rating', parseFloat(e.target.value))}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Fees */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Fees & Charges</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="lifetimeFree"
                  checked={card.is_lifetime_free}
                  onChange={(e) => handleChange('is_lifetime_free', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="lifetimeFree" className="text-sm font-medium text-slate-700">Lifetime Free Card</label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Joining Fee (₹)</label>
                  <input
                    type="number"
                    value={card.joining_fee}
                    onChange={(e) => handleChange('joining_fee', parseInt(e.target.value) || 0)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Annual Fee (₹)</label>
                  <input
                    type="number"
                    value={card.annual_fee}
                    onChange={(e) => handleChange('annual_fee', parseInt(e.target.value) || 0)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Forex Markup (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={card.forex_markup}
                  onChange={(e) => handleChange('forex_markup', parseFloat(e.target.value) || 0)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Rewards</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Reward Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={card.reward_rate}
                    onChange={(e) => handleChange('reward_rate', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Cashback Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={card.cashback_rate}
                    onChange={(e) => handleChange('cashback_rate', parseFloat(e.target.value) || 0)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Welcome Bonus Summary</label>
                <input
                  type="text"
                  value={card.welcome_bonus_summary}
                  onChange={(e) => handleChange('welcome_bonus_summary', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ₹5,000 voucher on first spend"
                />
              </div>
            </div>
          </div>

          {/* Eligibility */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Eligibility</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Min Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={card.min_income}
                    onChange={(e) => handleChange('min_income', parseInt(e.target.value) || 0)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Min Credit Score</label>
                  <input
                    type="number"
                    value={card.min_credit_score}
                    onChange={(e) => handleChange('min_credit_score', parseInt(e.target.value) || 700)}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Lounge Access</label>
                <input
                  type="text"
                  value={card.lounge_access}
                  onChange={(e) => handleChange('lounge_access', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Unlimited domestic, 6 international"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fuelWaiver"
                  checked={card.fuel_surcharge_waiver}
                  onChange={(e) => handleChange('fuel_surcharge_waiver', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="fuelWaiver" className="text-sm font-medium text-slate-700">Fuel Surcharge Waiver</label>
              </div>
            </div>
          </div>

          {/* Category Tags */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Category Tags</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {(card.category_tags || []).map((tag, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeFromArray('category_tags', i)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag (e.g., Travel, Premium)"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('category_tags', newTag, setNewTag))}
              />
              <Button type="button" variant="outline" onClick={() => addToArray('category_tags', newTag, setNewTag)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Key Benefits</h2>
            <ul className="space-y-2 mb-3">
              {(card.key_benefits || []).map((benefit, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="flex-1">{benefit}</span>
                  <button type="button" onClick={() => removeFromArray('key_benefits', i)} className="text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add benefit"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('key_benefits', newBenefit, setNewBenefit))}
              />
              <Button type="button" variant="outline" onClick={() => addToArray('key_benefits', newBenefit, setNewBenefit)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Card Description</h2>
            <textarea
              value={card.card_description}
              onChange={(e) => handleChange('card_description', e.target.value)}
              className="w-full border rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the card..."
            />
          </div>

          {/* Pros */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Pros</h2>
            <ul className="space-y-2 mb-3">
              {(card.pros || []).map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="flex-1">{pro}</span>
                  <button type="button" onClick={() => removeFromArray('pros', i)} className="text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Add pro"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('pros', newPro, setNewPro))}
              />
              <Button type="button" variant="outline" onClick={() => addToArray('pros', newPro, setNewPro)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Cons */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Cons</h2>
            <ul className="space-y-2 mb-3">
              {(card.cons || []).map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-red-500 mt-0.5">✗</span>
                  <span className="flex-1">{con}</span>
                  <button type="button" onClick={() => removeFromArray('cons', i)} className="text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Add con"
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('cons', newCon, setNewCon))}
              />
              <Button type="button" variant="outline" onClick={() => addToArray('cons', newCon, setNewCon)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Apply Links */}
          <div className="bg-white rounded-xl border p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Apply Links (Affiliate)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Affiliate Link</label>
                <input
                  type="url"
                  value={card.affiliate_link || ''}
                  onChange={(e) => handleChange('affiliate_link', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Bank Apply Link</label>
                <input
                  type="url"
                  value={card.bank_apply_link || ''}
                  onChange={(e) => handleChange('bank_apply_link', e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};
