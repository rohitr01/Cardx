import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const FilterSidebar = ({ onFilterChange, isMobile, onClose }) => {
  const [banks, setBanks] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [categoryTags, setCategoryTags] = useState([]);
  const [filters, setFilters] = useState({
    annual_fee_preference: '',
    preferred_bank: '',
    card_type: '',
    card_network: '',
    has_lounge_access: false,
    category_tag: '',
    min_credit_score: 600,
    income_range: 25000
  });

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [banksRes, networksRes, tagsRes] = await Promise.all([
          axios.get(`${API}/banks`),
          axios.get(`${API}/networks`),
          axios.get(`${API}/category-tags`)
        ]);
        setBanks(banksRes.data.banks);
        setNetworks(networksRes.data.networks);
        setCategoryTags(tagsRes.data.tags);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };
    fetchFilterOptions();
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
      card_network: '',
      has_lounge_access: false,
      category_tag: '',
      min_credit_score: 600,
      income_range: 25000
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const content = (
    <div className="space-y-5" data-testid="filter-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg" data-testid="close-filter-btn">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Annual Fee */}
      <div>
        <Label htmlFor="annual-fee" className="text-sm font-medium text-slate-700">Annual Fee</Label>
        <Select 
          value={filters.annual_fee_preference} 
          onValueChange={(value) => handleFilterChange('annual_fee_preference', value)}
        >
          <SelectTrigger id="annual-fee" className="mt-1.5" data-testid="annual-fee-select">
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

      {/* Bank */}
      <div>
        <Label htmlFor="bank" className="text-sm font-medium text-slate-700">Bank</Label>
        <Select 
          value={filters.preferred_bank} 
          onValueChange={(value) => handleFilterChange('preferred_bank', value)}
        >
          <SelectTrigger id="bank" className="mt-1.5" data-testid="bank-select">
            <SelectValue placeholder="All Banks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All Banks</SelectItem>
            {banks.map(bank => (
              <SelectItem key={bank} value={bank}>{bank}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card Type */}
      <div>
        <Label htmlFor="card-type" className="text-sm font-medium text-slate-700">Reward Type</Label>
        <Select 
          value={filters.card_type} 
          onValueChange={(value) => handleFilterChange('card_type', value)}
        >
          <SelectTrigger id="card-type" className="mt-1.5" data-testid="card-type-select">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All Types</SelectItem>
            <SelectItem value="cashback">Cashback</SelectItem>
            <SelectItem value="rewards">Rewards</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Card Network */}
      <div>
        <Label htmlFor="card-network" className="text-sm font-medium text-slate-700">Card Network</Label>
        <Select 
          value={filters.card_network} 
          onValueChange={(value) => handleFilterChange('card_network', value)}
        >
          <SelectTrigger id="card-network" className="mt-1.5" data-testid="card-network-select">
            <SelectValue placeholder="All Networks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All Networks</SelectItem>
            {networks.map(network => (
              <SelectItem key={network} value={network}>{network}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Tags */}
      {categoryTags.length > 0 && (
        <div>
          <Label htmlFor="category-tag" className="text-sm font-medium text-slate-700">Category</Label>
          <Select 
            value={filters.category_tag} 
            onValueChange={(value) => handleFilterChange('category_tag', value)}
          >
            <SelectTrigger id="category-tag" className="mt-1.5" data-testid="category-tag-select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">All Categories</SelectItem>
              {categoryTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Lounge Access Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="lounge-access"
          checked={filters.has_lounge_access}
          onCheckedChange={(checked) => handleFilterChange('has_lounge_access', checked)}
          data-testid="lounge-access-checkbox"
        />
        <Label htmlFor="lounge-access" className="text-sm font-medium text-slate-700 cursor-pointer">
          Has Lounge Access
        </Label>
      </div>

      {/* Income Range Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-slate-700">Monthly Income</Label>
          <span className="text-sm font-semibold text-blue-600">₹{filters.income_range.toLocaleString('en-IN')}</span>
        </div>
        <Slider
          value={[filters.income_range]}
          onValueChange={(value) => handleFilterChange('income_range', value[0])}
          min={20000}
          max={500000}
          step={5000}
          className="mt-1"
          data-testid="income-slider"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>₹20K</span>
          <span>₹5L+</span>
        </div>
      </div>

      {/* Credit Score Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-slate-700">Credit Score</Label>
          <span className="text-sm font-semibold text-blue-600">{filters.min_credit_score}+</span>
        </div>
        <Slider
          value={[filters.min_credit_score]}
          onValueChange={(value) => handleFilterChange('min_credit_score', value[0])}
          min={600}
          max={850}
          step={10}
          className="mt-1"
          data-testid="credit-score-slider"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>600</span>
          <span>850</span>
        </div>
      </div>

      {/* Reset Button */}
      <Button 
        onClick={handleReset} 
        variant="outline" 
        className="w-full mt-2"
        data-testid="reset-filters-btn"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset Filters
      </Button>
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
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sticky top-24 shadow-sm">
      {content}
    </div>
  );
};
