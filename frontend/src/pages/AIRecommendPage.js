import { useState } from 'react';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AIRecommendPage = () => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [formData, setFormData] = useState({
    fuel: '',
    groceries: '',
    travel: '',
    dining: '',
    online_shopping: '',
    utilities: '',
    income: '',
    credit_score: '',
    preferences: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.income || !formData.credit_score) {
      toast.error('Please fill in income and credit score');
      return;
    }

    try {
      setLoading(true);
      const monthly_spending = {};
      if (formData.fuel) monthly_spending.fuel = parseInt(formData.fuel);
      if (formData.groceries) monthly_spending.groceries = parseInt(formData.groceries);
      if (formData.travel) monthly_spending.travel = parseInt(formData.travel);
      if (formData.dining) monthly_spending.dining = parseInt(formData.dining);
      if (formData.online_shopping) monthly_spending.online_shopping = parseInt(formData.online_shopping);
      if (formData.utilities) monthly_spending.utilities = parseInt(formData.utilities);

      const response = await axios.post(`${API}/recommend-ai`, {
        monthly_spending,
        preferences: formData.preferences || 'Looking for best rewards and benefits',
        income: parseInt(formData.income),
        credit_score: parseInt(formData.credit_score)
      });

      setRecommendation(response.data);
      toast.success('AI recommendations generated!');
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      toast.error('Failed to get AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-50 min-h-screen" data-testid="ai-recommend-page">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 px-4 py-2 rounded-full mb-4" data-testid="ai-badge">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-semibold">AI-Powered</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-4" data-testid="page-title">Get Personalized Card Recommendations</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto" data-testid="page-description">
            Our AI analyzes your spending patterns and preferences to recommend the best credit cards for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8" data-testid="input-form">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">Your Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fuel" className="text-sm font-medium text-slate-700">Fuel (₹/month)</Label>
                  <Input
                    id="fuel"
                    type="number"
                    placeholder="5000"
                    value={formData.fuel}
                    onChange={(e) => handleInputChange('fuel', e.target.value)}
                    className="mt-1"
                    data-testid="input-fuel"
                  />
                </div>
                <div>
                  <Label htmlFor="groceries" className="text-sm font-medium text-slate-700">Groceries (₹/month)</Label>
                  <Input
                    id="groceries"
                    type="number"
                    placeholder="8000"
                    value={formData.groceries}
                    onChange={(e) => handleInputChange('groceries', e.target.value)}
                    className="mt-1"
                    data-testid="input-groceries"
                  />
                </div>
                <div>
                  <Label htmlFor="travel" className="text-sm font-medium text-slate-700">Travel (₹/month)</Label>
                  <Input
                    id="travel"
                    type="number"
                    placeholder="10000"
                    value={formData.travel}
                    onChange={(e) => handleInputChange('travel', e.target.value)}
                    className="mt-1"
                    data-testid="input-travel"
                  />
                </div>
                <div>
                  <Label htmlFor="dining" className="text-sm font-medium text-slate-700">Dining (₹/month)</Label>
                  <Input
                    id="dining"
                    type="number"
                    placeholder="5000"
                    value={formData.dining}
                    onChange={(e) => handleInputChange('dining', e.target.value)}
                    className="mt-1"
                    data-testid="input-dining"
                  />
                </div>
                <div>
                  <Label htmlFor="online_shopping" className="text-sm font-medium text-slate-700">Online Shopping (₹/month)</Label>
                  <Input
                    id="online_shopping"
                    type="number"
                    placeholder="15000"
                    value={formData.online_shopping}
                    onChange={(e) => handleInputChange('online_shopping', e.target.value)}
                    className="mt-1"
                    data-testid="input-shopping"
                  />
                </div>
                <div>
                  <Label htmlFor="utilities" className="text-sm font-medium text-slate-700">Utilities (₹/month)</Label>
                  <Input
                    id="utilities"
                    type="number"
                    placeholder="3000"
                    value={formData.utilities}
                    onChange={(e) => handleInputChange('utilities', e.target.value)}
                    className="mt-1"
                    data-testid="input-utilities"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="income" className="text-sm font-medium text-slate-700">Monthly Income (₹) *</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="100000"
                  value={formData.income}
                  onChange={(e) => handleInputChange('income', e.target.value)}
                  className="mt-1"
                  required
                  data-testid="input-income"
                />
              </div>

              <div>
                <Label htmlFor="credit_score" className="text-sm font-medium text-slate-700">Credit Score *</Label>
                <Input
                  id="credit_score"
                  type="number"
                  placeholder="750"
                  value={formData.credit_score}
                  onChange={(e) => handleInputChange('credit_score', e.target.value)}
                  className="mt-1"
                  required
                  data-testid="input-credit-score"
                />
              </div>

              <div>
                <Label htmlFor="preferences" className="text-sm font-medium text-slate-700">Additional Preferences (Optional)</Label>
                <Textarea
                  id="preferences"
                  placeholder="e.g., I travel frequently, prefer cashback over rewards points, need lounge access"
                  value={formData.preferences}
                  onChange={(e) => handleInputChange('preferences', e.target.value)}
                  className="mt-1"
                  rows={4}
                  data-testid="input-preferences"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
                data-testid="get-recommendations-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8" data-testid="recommendations-panel">
            <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span>AI Recommendations</span>
            </h2>
            
            {!recommendation && !loading && (
              <div className="text-center py-12" data-testid="no-recommendations">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Fill in your profile details to get personalized recommendations</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12" data-testid="loading-recommendations">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600">AI is analyzing your profile...</p>
              </div>
            )}

            {recommendation && !loading && (
              <div className="space-y-6" data-testid="recommendation-results">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">AI Analysis</h3>
                  <p className="text-blue-700 text-sm whitespace-pre-wrap" data-testid="ai-response">{recommendation.ai_response}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Your Profile Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between" data-testid="summary-income">
                      <span className="text-slate-600">Monthly Income</span>
                      <span className="font-semibold">₹{recommendation.user_profile.income.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between" data-testid="summary-credit-score">
                      <span className="text-slate-600">Credit Score</span>
                      <span className="font-semibold">{recommendation.user_profile.credit_score}</span>
                    </div>
                    {Object.keys(recommendation.user_profile.monthly_spending).length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="text-slate-600 mb-2">Monthly Spending</div>
                        {Object.entries(recommendation.user_profile.monthly_spending).map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between text-sm" data-testid={`spending-${category}`}>
                            <span className="text-slate-500 capitalize">{category.replace('_', ' ')}</span>
                            <span>₹{amount.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};