import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BarChart, CreditCard as CreditCardIcon, Users, TrendingUp, LogOut, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const { user, logout, getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeader();
      
      const [analyticsRes, cardsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { headers }),
        axios.get(`${API}/admin/cards`, { headers })
      ]);
      
      setAnalytics(analyticsRes.data);
      setCards(cardsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    
    try {
      const headers = getAuthHeader();
      await axios.delete(`${API}/admin/cards/${cardId}`, { headers });
      toast.success('Card deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-slate-900" data-testid="dashboard-title">Admin Dashboard</h1>
              <p className="text-slate-600 text-sm">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                View Site
              </Button>
              <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6" data-testid="stat-total-cards">
            <div className="flex items-center justify-between mb-2">
              <CreditCardIcon className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">{analytics?.total_cards || 0}</span>
            </div>
            <div className="text-sm text-slate-600">Total Cards</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6" data-testid="stat-banks">
            <div className="flex items-center justify-between mb-2">
              <BarChart className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-slate-900">{analytics?.total_banks || 0}</span>
            </div>
            <div className="text-sm text-slate-600">Banks</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6" data-testid="stat-lifetime-free">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-amber-600" />
              <span className="text-2xl font-bold text-slate-900">{analytics?.lifetime_free_cards || 0}</span>
            </div>
            <div className="text-sm text-slate-600">Lifetime Free</div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6" data-testid="stat-premium">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-slate-900">{analytics?.premium_cards || 0}</span>
            </div>
            <div className="text-sm text-slate-600">Premium Cards</div>
          </div>
        </div>

        {/* Cards Management */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-slate-900" data-testid="cards-section-title">Credit Cards Management</h2>
            <Button onClick={() => navigate('/admin/cards/new')} data-testid="add-card-button">
              <Plus className="w-4 h-4 mr-2" />
              Add New Card
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" data-testid="cards-table">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Bank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Card Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Annual Fee</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`card-row-${card.id}`}>
                    <td className="py-3 px-4 text-sm text-slate-900">{card.bank_name}</td>
                    <td className="py-3 px-4 text-sm text-slate-900 font-medium">{card.card_name}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs capitalize">
                        {card.card_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-900">
                      {card.annual_fee === 0 ? 'Free' : `₹${card.annual_fee.toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/admin/cards/edit/${card.id}`)}
                        data-testid={`edit-card-${card.id}`}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`delete-card-${card.id}`}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
