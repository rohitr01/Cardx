import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, Users, TrendingUp, BarChart3, Plus, Search, 
  Filter, MoreVertical, Eye, Edit2, Trash2, Star, DollarSign,
  ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminDashboard = () => {
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [cards, setCards] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeader();
      const [analyticsRes, cardsRes, leadsRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { headers }),
        axios.get(`${API}/admin/cards`, { headers }),
        axios.get(`${API}/admin/leads`, { headers })
      ]);
      
      setAnalytics(analyticsRes.data);
      setCards(cardsRes.data);
      setRecentLeads(leadsRes.data.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId, cardName) => {
    if (!window.confirm(`Are you sure you want to delete "${cardName}"?`)) return;
    
    try {
      await axios.delete(`${API}/admin/cards/${cardId}`, { headers: getAuthHeader() });
      toast.success('Card deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  const filteredCards = cards.filter(card => 
    card.card_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.bank_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div data-testid="admin-dashboard">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Cards"
            value={analytics?.total_cards || 0}
            icon={CreditCard}
            color="blue"
            change="+2 this week"
            changeType="up"
          />
          <StatCard
            title="Total Leads"
            value={analytics?.total_leads || 0}
            icon={Users}
            color="green"
            change={`${analytics?.new_leads || 0} new`}
            changeType="up"
          />
          <StatCard
            title="User Reviews"
            value={analytics?.total_reviews || 0}
            icon={Star}
            color="amber"
          />
          <StatCard
            title="Registered Users"
            value={analytics?.total_users || 0}
            icon={Users}
            color="purple"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Card Types Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics?.card_types || {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-700">{type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(count / analytics.total_cards) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-900 w-6">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{analytics?.lifetime_free_cards || 0}</div>
                <div className="text-xs text-green-600">Lifetime Free</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{analytics?.premium_cards || 0}</div>
                <div className="text-xs text-purple-600">Premium Cards</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{analytics?.total_banks || 0}</div>
                <div className="text-xs text-blue-600">Banks</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">{analytics?.active_cards || 0}</div>
                <div className="text-xs text-amber-600">Active Cards</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-500">Recent Leads</h3>
              <Link to="/admin/leads" className="text-xs text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              {recentLeads.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No leads yet</p>
              ) : (
                recentLeads.map((lead, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{lead.user_name || 'Anonymous'}</div>
                      <div className="text-xs text-slate-500">{lead.card_name}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lead.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Cards Management */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Credit Cards</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={() => navigate('/admin/cards/new')} data-testid="add-card-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" data-testid="cards-table">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Card</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Network</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Annual Fee</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Rating</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50" data-testid={`card-row-${card.id}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{card.card_name}</div>
                          <div className="text-sm text-slate-500">{card.bank_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {card.card_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{card.card_network || 'Visa'}</td>
                    <td className="py-4 px-6">
                      {card.is_lifetime_free ? (
                        <span className="text-green-600 font-medium text-sm">Free</span>
                      ) : (
                        <span className="text-sm text-slate-900">₹{card.annual_fee?.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{card.overall_rating || 4.0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/cards/${card.id}`}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/cards/edit/${card.id}`)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                          title="Edit"
                          data-testid={`edit-${card.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id, card.card_name)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                          title="Delete"
                          data-testid={`delete-${card.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCards.length === 0 && (
            <div className="py-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No cards found</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, change, changeType }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 border" data-testid={`stat-${title.toLowerCase().replace(' ', '-')}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              changeType === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
