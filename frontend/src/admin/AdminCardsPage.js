import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, Plus, Search, Eye, Edit2, Trash2, Star, Filter,
  Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminCardsPage = () => {
  const { getAuthHeader } = useAuth();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const res = await axios.get(`${API}/admin/cards`, { headers: getAuthHeader() });
      setCards(res.data);
    } catch (error) {
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cardId, cardName) => {
    if (!window.confirm(`Delete "${cardName}"?`)) return;
    try {
      await axios.delete(`${API}/admin/cards/${cardId}`, { headers: getAuthHeader() });
      toast.success('Card deleted');
      fetchCards();
    } catch (error) {
      toast.error('Failed to delete card');
    }
  };

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.card_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.bank_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || card.card_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const cardTypes = [...new Set(cards.map(c => c.card_type))];

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
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Credit Cards</h1>
            <p className="text-slate-500">{cards.length} cards in database</p>
          </div>
          <Button onClick={() => navigate('/admin/cards/new')} data-testid="add-card-btn">
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by card or bank name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {cardTypes.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-4">
          {paginatedCards.map((card) => (
            <div 
              key={card.id} 
              className="bg-white rounded-xl border p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 truncate">{card.card_name}</h3>
                  {card.is_lifetime_free && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{card.bank_name}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400 capitalize">{card.card_type}</span>
                  <span className="text-xs text-slate-400">{card.card_network || 'Visa'}</span>
                  <span className="text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {card.overall_rating || 4.0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/cards/${card.id}`}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
                  title="View"
                >
                  <Eye className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => navigate(`/admin/cards/edit/${card.id}`)}
                  className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(card.id, card.card_name)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white rounded-xl border p-4">
            <span className="text-sm text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCards.length)} of {filteredCards.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {filteredCards.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No cards found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => navigate('/admin/cards/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Card
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
