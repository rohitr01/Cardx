import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminCardForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeader } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    card_name: '',
    card_type: 'lifestyle',
    joining_fee: 0,
    annual_fee: 0,
    is_lifetime_free: false,
    welcome_benefits: '',
    reward_rate: 0,
    cashback_rate: 0,
    redemption_ratio: 1.0,
    redemption_options: [],
    reward_cap_monthly: null,
    reward_cap_yearly: null,
    milestone_benefits: [],
    excluded_categories: [],
    forex_markup: 3.5,
    lounge_access: 'None',
    fuel_surcharge_waiver: true,
    emi_available: true,
    min_income: 25000,
    min_credit_score: 650,
    category_bonuses: {},
    affiliate_link: '',
    bankbazaar_link: '',
    paisabazaar_link: ''
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchCard();
    }
  }, [id]);

  const fetchCard = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`${API}/cards/${id}`, { headers });
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load card');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const headers = getAuthHeader();
      
      if (id && id !== 'new') {
        await axios.put(`${API}/admin/cards/${id}`, formData, { headers });
        toast.success('Card updated successfully');
      } else {
        await axios.post(`${API}/admin/cards`, formData, { headers });
        toast.success('Card created successfully');
      }
      
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-card-form">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/dashboard')}
          className="mb-6"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-8" data-testid="form-title">
            {id && id !== 'new' ? 'Edit Card' : 'Add New Card'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  required
                  data-testid="bank-name-input"
                />
              </div>

              <div>
                <Label htmlFor="card_name">Card Name</Label>
                <Input
                  id="card_name"
                  value={formData.card_name}
                  onChange={(e) => handleChange('card_name', e.target.value)}
                  required
                  data-testid="card-name-input"
                />
              </div>

              <div>
                <Label htmlFor="card_type">Card Type</Label>
                <Select value={formData.card_type} onValueChange={(value) => handleChange('card_type', value)}>
                  <SelectTrigger id="card_type" data-testid="card-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="lifetime_free">Lifetime Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="annual_fee">Annual Fee</Label>
                <Input
                  id="annual_fee"
                  type="number"
                  value={formData.annual_fee}
                  onChange={(e) => handleChange('annual_fee', parseInt(e.target.value))}
                  data-testid="annual-fee-input"
                />
              </div>

              <div>
                <Label htmlFor="reward_rate">Reward Rate</Label>
                <Input
                  id="reward_rate"
                  type="number"
                  step="0.1"
                  value={formData.reward_rate}
                  onChange={(e) => handleChange('reward_rate', parseFloat(e.target.value))}
                  data-testid="reward-rate-input"
                />
              </div>

              <div>
                <Label htmlFor="min_income">Min Monthly Income</Label>
                <Input
                  id="min_income"
                  type="number"
                  value={formData.min_income}
                  onChange={(e) => handleChange('min_income', parseInt(e.target.value))}
                  data-testid="min-income-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="welcome_benefits">Welcome Benefits</Label>
              <Textarea
                id="welcome_benefits"
                value={formData.welcome_benefits}
                onChange={(e) => handleChange('welcome_benefits', e.target.value)}
                rows={3}
                data-testid="welcome-benefits-input"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bankbazaar_link">BankBazaar Link</Label>
                <Input
                  id="bankbazaar_link"
                  type="url"
                  value={formData.bankbazaar_link}
                  onChange={(e) => handleChange('bankbazaar_link', e.target.value)}
                  placeholder="https://www.bankbazaar.com/..."
                  data-testid="bankbazaar-link-input"
                />
              </div>

              <div>
                <Label htmlFor="paisabazaar_link">Paisabazaar Link</Label>
                <Input
                  id="paisabazaar_link"
                  type="url"
                  value={formData.paisabazaar_link}
                  onChange={(e) => handleChange('paisabazaar_link', e.target.value)}
                  placeholder="https://www.paisabazaar.com/..."
                  data-testid="paisabazaar-link-input"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin/dashboard')}
                data-testid="cancel-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                data-testid="save-button"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  id && id !== 'new' ? 'Update Card' : 'Create Card'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
