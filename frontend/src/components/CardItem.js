import { useState } from 'react';
import { CreditCard, Star, Check, ChevronRight, Plane, Film, Fuel, Gift, Sparkles, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Star Rating Component
const StarRating = ({ rating, maxRating = 5 }) => {
  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <Star 
        key={i} 
        className={`w-4 h-4 ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    );
  }
  return <div className="flex gap-0.5">{stars}</div>;
};

// Category Tag Icon mapper
const getTagIcon = (tag) => {
  const tagLower = tag.toLowerCase();
  if (tagLower.includes('travel') || tagLower.includes('lounge')) return Plane;
  if (tagLower.includes('movie') || tagLower.includes('entertainment')) return Film;
  if (tagLower.includes('fuel')) return Fuel;
  if (tagLower.includes('reward') || tagLower.includes('cashback')) return Gift;
  if (tagLower.includes('premium') || tagLower.includes('luxury')) return Sparkles;
  return Shield;
};

export const CardItem = ({ card, onCompareToggle, isSelected }) => {
  const navigate = useNavigate();
  
  const formatCurrency = (amount) => {
    if (amount === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get key benefits (first 4-5 from key_benefits or generate from card data)
  const getKeyBenefits = () => {
    if (card.key_benefits && card.key_benefits.length > 0) {
      return card.key_benefits.slice(0, 5);
    }
    // Generate benefits from card data
    const benefits = [];
    if (card.reward_rate > 0) benefits.push(`${card.reward_rate}% value back on all spends`);
    if (card.cashback_rate > 0) benefits.push(`${card.cashback_rate}% cashback on purchases`);
    if (card.lounge_access && card.lounge_access.toLowerCase() !== 'none') {
      benefits.push(`Lounge access: ${card.lounge_access}`);
    }
    if (card.fuel_surcharge_waiver) benefits.push('Fuel surcharge waiver available');
    if (card.welcome_benefits) benefits.push(card.welcome_benefits);
    return benefits.slice(0, 5);
  };

  // Get category tags
  const getTags = () => {
    if (card.category_tags && card.category_tags.length > 0) {
      return card.category_tags.slice(0, 5);
    }
    const tags = [];
    if (card.is_lifetime_free) tags.push('Lifetime Free');
    tags.push(card.card_type.replace('_', ' '));
    if (card.lounge_access && card.lounge_access.toLowerCase() !== 'none') tags.push('Lounge');
    if (card.fuel_surcharge_waiver) tags.push('Fuel');
    return tags.slice(0, 5);
  };

  const rating = Math.round(card.overall_rating || 4);
  const keyBenefits = getKeyBenefits();
  const tags = getTags();

  return (
    <div 
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
      data-testid={`card-item-${card.id}`}
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-5 relative">
        {/* Lifetime Free Badge */}
        {card.is_lifetime_free && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
            Lifetime Free
          </div>
        )}
        
        <div className="flex items-start gap-4">
          {/* Card Icon/Image */}
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          
          <div className="flex-1">
            {/* Bank Name */}
            <div className="text-white/70 text-sm font-medium mb-1" data-testid="card-bank">
              {card.bank_name}
            </div>
            {/* Card Name */}
            <h3 className="text-xl font-bold text-white leading-tight mb-2" data-testid="card-name">
              {card.card_name}
            </h3>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-white/80 text-sm font-medium">{rating}/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        {/* Fee Information */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Joining Fee</div>
            <div className="font-bold text-slate-900" data-testid="joining-fee">
              {card.joining_fee === 0 ? '₹0' : formatCurrency(card.joining_fee)}
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200" />
          <div className="flex-1">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Annual Fee</div>
            <div className="font-bold text-slate-900" data-testid="annual-fee">
              {card.annual_fee === 0 ? '₹0' : formatCurrency(card.annual_fee)}
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="mb-4">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-2 font-semibold">Key Benefits</div>
          <ul className="space-y-2">
            {keyBenefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                <span className="line-clamp-2">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag, idx) => {
            const TagIcon = getTagIcon(tag);
            return (
              <span 
                key={idx} 
                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
              >
                <TagIcon className="w-3 h-3" />
                {tag}
              </span>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link 
            to={`/cards/${card.id}`}
            className="flex-1"
          >
            <Button 
              variant="outline" 
              className="w-full border-slate-300 hover:bg-slate-50 hover:border-slate-400"
              data-testid="check-eligibility-btn"
            >
              <Shield className="w-4 h-4 mr-2" />
              Check Eligibility
            </Button>
          </Link>
          <Link 
            to={`/cards/${card.id}`}
            className="flex-1"
          >
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="know-more-btn"
            >
              Know More
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Compare Toggle (subtle at bottom) */}
        <button 
          onClick={() => onCompareToggle(card)}
          className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            isSelected 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-transparent'
          }`}
          data-testid="compare-toggle-btn"
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4" />
              Added to Compare
            </>
          ) : (
            'Add to Compare'
          )}
        </button>
      </div>
    </div>
  );
};
