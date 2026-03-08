import { useState, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const FilterSidebar = ({ onFilterChange, isMobile, onClose }) => {
  const [banks, setBanks] = useState([]);
  const [filters, setFilters] = useState({
    annual_fee_preference: '',
    preferred_bank: '',
    card_type: '',
    min_credit_score: 600,
    income_range: 25000
  });

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get(`${API}/banks`);
        setBanks(response.data.banks);
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };
    fetchBanks();
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      annual_fee_preference: '',
      preferred_bank: '',
      card_type: '',
      min_credit_score: 600,
      income_range: 25000
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const content = (
    <div className="space-y-6" data-testid="filter-sidebar">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-slate-700" />
          <h2 className="text-lg font-heading font-semibold text-slate-900">Filters</h2>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2" data-testid="close-filter-btn">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="annual-fee" className="text-sm font-medium text-slate-700">Annual Fee Preference</Label>
          <Select 
            value={filters.annual_fee_preference} 
            onValueChange={(value) => handleFilterChange('annual_fee_preference', value)}
          >
            <SelectTrigger id="annual-fee" className="mt-1" data-testid="annual-fee-select">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="free">Lifetime Free</SelectItem>
              <SelectItem value="low">Low (₹0 - ₹2,500)</SelectItem>
              <SelectItem value="premium">Premium (₹5,000+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bank" className="text-sm font-medium text-slate-700">Preferred Bank</Label>
          <Select 
            value={filters.preferred_bank} 
            onValueChange={(value) => handleFilterChange('preferred_bank', value)}
          >
            <SelectTrigger id="bank" className="mt-1" data-testid="bank-select">
              <SelectValue placeholder="Any Bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Bank</SelectItem>
              {banks.map(bank => (
                <SelectItem key={bank} value={bank}>{bank}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="card-type" className="text-sm font-medium text-slate-700">Card Type</Label>
          <Select 
            value={filters.card_type} 
            onValueChange={(value) => handleFilterChange('card_type', value)}
          >
            <SelectTrigger id="card-type" className="mt-1" data-testid="card-type-select">
              <SelectValue placeholder="Any Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Type</SelectItem>
              <SelectItem value="lifetime_free">Lifetime Free</SelectItem>
              <SelectItem value="cashback">Cashback</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700">Monthly Income: ₹{filters.income_range.toLocaleString('en-IN')}</Label>
          <Slider
            value={[filters.income_range]}
            onValueChange={(value) => handleFilterChange('income_range', value[0])}
            min={20000}
            max={500000}
            step={5000}
            className="mt-2"
            data-testid="income-slider"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-slate-700">Min Credit Score: {filters.min_credit_score}</Label>
          <Slider
            value={[filters.min_credit_score]}
            onValueChange={(value) => handleFilterChange('min_credit_score', value[0])}
            min={600}
            max={850}
            step={10}
            className="mt-2"
            data-testid="credit-score-slider"
          />
        </div>

        <Button 
          onClick={handleReset} 
          variant="outline" 
          className="w-full"
          data-testid="reset-filters-btn"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}>
        <div 
          className="absolute right-0 top-0 h-full w-80 bg-white p-6 overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
      {content}
    </div>
  );
};