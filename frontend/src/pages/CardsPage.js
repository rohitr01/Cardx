import { useState, useEffect } from 'react';
import { CardItem } from '@/components/CardItem';
import { FilterSidebar } from '@/components/FilterSidebar';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CardsPage = () => {
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cards`);
      setCards(response.data);
      setFilteredCards(response.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filters) => {
    try {
      const cleanFilters = {};
      
      if (filters.income_range) cleanFilters.income_range = filters.income_range;
      if (filters.min_credit_score) cleanFilters.min_credit_score = filters.min_credit_score;
      if (filters.annual_fee_preference && filters.annual_fee_preference !== 'any') {
        cleanFilters.annual_fee_preference = filters.annual_fee_preference;
      }
      if (filters.preferred_bank && filters.preferred_bank !== 'any') {
        cleanFilters.preferred_bank = filters.preferred_bank;
      }
      if (filters.card_type && filters.card_type !== 'any') {
        cleanFilters.card_type = filters.card_type;
      }

      if (Object.keys(cleanFilters).length === 0) {
        setFilteredCards(cards);
        return;
      }

      const response = await axios.post(`${API}/cards/filter`, cleanFilters);
      setFilteredCards(response.data);
    } catch (error) {
      console.error('Error filtering cards:', error);
      toast.error('Failed to filter cards');
    }
  };

  const handleCompareToggle = (card) => {
    setCompareList(prev => {
      const isSelected = prev.find(c => c.id === card.id);
      if (isSelected) {
        return prev.filter(c => c.id !== card.id);
      } else {
        if (prev.length >= 5) {
          toast.error('You can compare maximum 5 cards');
          return prev;
        }
        return [...prev, card];
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen" data-testid="cards-page">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900" data-testid="page-title">All Credit Cards</h1>
            <p className="text-slate-600 mt-2" data-testid="cards-count">{filteredCards.length} cards available</p>
          </div>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center space-x-2"
            data-testid="mobile-filter-btn"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="hidden md:block">
            <FilterSidebar onFilterChange={handleFilterChange} isMobile={false} />
          </div>

          <div className="md:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCards.map(card => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  onCompareToggle={handleCompareToggle}
                  isSelected={!!compareList.find(c => c.id === card.id)}
                />
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-12" data-testid="no-cards-message">
                <p className="text-slate-600">No cards match your filters. Try adjusting your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMobileFilters && (
        <FilterSidebar 
          onFilterChange={handleFilterChange} 
          isMobile={true} 
          onClose={() => setShowMobileFilters(false)}
        />
      )}

      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 z-40" data-testid="compare-bar">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-slate-900" data-testid="compare-count">{compareList.length} cards selected</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCompareList([])}
                data-testid="clear-compare-btn"
              >
                Clear All
              </Button>
            </div>
            <Link to={`/compare?ids=${compareList.map(c => c.id).join(',')}`}>
              <Button data-testid="compare-cards-btn">Compare Cards</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};