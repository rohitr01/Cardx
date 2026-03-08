import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Star, Award, Gift, Plane, Shield, DollarSign, 
  TrendingUp, CheckCircle, XCircle, HelpCircle, Users, Phone, ChevronDown,
  ChevronUp, Building, Percent, Calendar, FileText, ThumbsUp, MessageSquare
} from 'lucide-react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Star Rating Component
const StarRating = ({ rating, size = "sm" }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Star key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} fill-yellow-400 text-yellow-400`} />);
    } else if (i === fullStars && hasHalf) {
      stars.push(<Star key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} fill-yellow-400/50 text-yellow-400`} />);
    } else {
      stars.push(<Star key={i} className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-300`} />);
    }
  }
  return <div className="flex gap-0.5">{stars}</div>;
};

// Collapsible Section Component
const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      {isOpen && <div className="px-5 pb-5 border-t border-slate-100">{children}</div>}
    </div>
  );
};

export const CardDetailsPage = () => {
  const { id } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEligibilityForm, setShowEligibilityForm] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [eligibilityForm, setEligibilityForm] = useState({
    age: '',
    annual_income: '',
    employment_type: 'salaried',
    credit_score: ''
  });
  const [applyForm, setApplyForm] = useState({
    user_name: '',
    mobile_number: '',
    email: ''
  });
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    reviewer_name: '',
    rating: 5,
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchCardDetails();
  }, [id]);

  const fetchCardDetails = async () => {
    try {
      setLoading(true);
      const [cardRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/cards/${id}`),
        axios.get(`${API}/cards/${id}/reviews`)
      ]);
      setCard(cardRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching card details:', error);
      toast.error('Failed to load card details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const checkEligibility = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/check-eligibility`, {
        ...eligibilityForm,
        age: parseInt(eligibilityForm.age),
        annual_income: parseInt(eligibilityForm.annual_income),
        credit_score: eligibilityForm.credit_score ? parseInt(eligibilityForm.credit_score) : null,
        card_id: id
      });
      setEligibilityResult(response.data);
    } catch (error) {
      toast.error('Failed to check eligibility');
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/apply-lead`, {
        ...applyForm,
        card_id: id,
        card_name: card.card_name,
        bank_name: card.bank_name,
        annual_income: parseInt(eligibilityForm.annual_income) || null,
        employment_type: eligibilityForm.employment_type,
        created_at: new Date().toISOString()
      });
      toast.success('Application submitted! We will contact you soon.');
      setShowApplyForm(false);
      setApplyForm({ user_name: '', mobile_number: '', email: '' });
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/cards/${id}/reviews`, {
        ...reviewForm,
        card_id: id
      });
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewForm({ reviewer_name: '', rating: 5, title: '', content: '' });
      fetchCardDetails();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-state">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="card-not-found">
        <div className="text-center">
          <p className="text-slate-600">Card not found</p>
          <Link to="/cards" className="text-blue-600 hover:underline mt-2">Back to all cards</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20" data-testid="card-details-page">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <Link to="/cards" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6" data-testid="back-link">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all cards</span>
        </Link>

        {/* Section 1: Card Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-10 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white/70 text-sm">{card.bank_name}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white">{card.card_network}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="card-name">{card.card_name}</h1>
              
              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(card.category_tags || []).map((tag, idx) => (
                  <span key={idx} className="bg-blue-500/30 text-blue-100 px-3 py-1 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
                {card.is_lifetime_free && (
                  <span className="bg-green-500/30 text-green-100 px-3 py-1 rounded-full text-xs font-medium">
                    Lifetime Free
                  </span>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-2">
                <StarRating rating={card.overall_rating || 4.0} size="md" />
                <span className="text-white font-semibold">{card.overall_rating || 4.0}</span>
                <span className="text-white/60 text-sm">/ 5.0</span>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <CreditCard className="w-16 h-16 text-white/80" />
            </div>
          </div>
        </div>

        {/* Section 2: Quick Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <DollarSign className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-xs text-slate-500">Joining Fee</div>
            <div className="font-bold text-slate-900">{card.joining_fee === 0 ? 'Free' : formatCurrency(card.joining_fee)}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <Calendar className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-xs text-slate-500">Annual Fee</div>
            <div className="font-bold text-slate-900">{card.annual_fee === 0 ? 'Free' : formatCurrency(card.annual_fee)}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <Percent className="w-5 h-5 text-amber-600 mb-2" />
            <div className="text-xs text-slate-500">Value Back</div>
            <div className="font-bold text-slate-900">{card.value_back_percent || card.reward_rate || card.cashback_rate}%</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <Plane className="w-5 h-5 text-green-600 mb-2" />
            <div className="text-xs text-slate-500">Lounge Access</div>
            <div className="font-bold text-slate-900 text-sm">{card.lounge_access_summary || card.lounge_access || 'None'}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-xs text-slate-500">Forex Markup</div>
            <div className="font-bold text-slate-900">{card.forex_markup}%</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <Gift className="w-5 h-5 text-pink-600 mb-2" />
            <div className="text-xs text-slate-500">Welcome Bonus</div>
            <div className="font-bold text-slate-900 text-sm truncate">{card.welcome_bonus_summary || 'Available'}</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Section 3: About the Card */}
            <Section title="About This Card" icon={FileText}>
              <div className="pt-4 space-y-4">
                <p className="text-slate-700 leading-relaxed">{card.card_description || `The ${card.bank_name} ${card.card_name} is a ${card.card_type} credit card designed for ${card.best_suited_for?.join(', ') || 'various spending needs'}.`}</p>
                
                {card.best_suited_for?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Best Suited For:</h4>
                    <div className="flex flex-wrap gap-2">
                      {card.best_suited_for.map((item, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {card.key_benefits?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {card.key_benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>

            {/* Section 4: Rewards Program */}
            <Section title="Rewards Program" icon={Award}>
              <div className="pt-4 space-y-6">
                {/* Reward Earning */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Reward Earning</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    {card.reward_earning?.base_rate && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-600">Base Rate</span>
                        <span className="font-medium text-slate-900">{card.reward_earning.base_rate}</span>
                      </div>
                    )}
                    {Object.entries(card.category_bonuses || {}).map(([cat, rate]) => (
                      <div key={cat} className="flex justify-between items-center py-2 border-t border-slate-200">
                        <span className="text-slate-600 capitalize">{cat.replace('_', ' ')}</span>
                        <span className="font-bold text-blue-600">{rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Reward Redemption */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Redemption Options</h4>
                  <div className="flex flex-wrap gap-2">
                    {(card.redemption_options || []).map((option, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">{option}</span>
                    ))}
                  </div>
                  {card.reward_redemption && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm">
                        <strong>Best Redemption:</strong> {card.reward_redemption.best_redemption || 'Travel bookings for maximum value'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* Section 5: Welcome Benefits */}
            <Section title="Welcome Benefits" icon={Gift}>
              <div className="pt-4 space-y-3">
                <p className="text-slate-700">{card.welcome_benefits}</p>
                {card.welcome_benefits_list?.length > 0 && (
                  <ul className="space-y-2">
                    {card.welcome_benefits_list.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <Gift className="w-4 h-4 text-pink-500 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {card.welcome_bonus_conditions && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                    <p className="text-amber-800 text-sm">
                      <strong>Condition:</strong> {card.welcome_bonus_conditions}
                    </p>
                  </div>
                )}
              </div>
            </Section>

            {/* Section 6: Milestone Benefits */}
            {(card.milestone_benefits?.length > 0 || card.milestone_details?.length > 0) && (
              <Section title="Milestone Benefits" icon={TrendingUp}>
                <div className="pt-4">
                  {card.milestone_details?.length > 0 ? (
                    <div className="space-y-3">
                      {card.milestone_details.map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                          <div>
                            <span className="text-slate-600">Spend</span>
                            <span className="font-bold text-slate-900 ml-2">{milestone.spend}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-green-600 font-medium">{milestone.benefit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {card.milestone_benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Section>
            )}

            {/* Section 7: Travel Benefits */}
            <Section title="Travel Benefits" icon={Plane}>
              <div className="pt-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">Domestic Lounge</div>
                    <div className="font-medium text-slate-900">{card.travel_benefits?.domestic_lounge || card.lounge_access || 'None'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">International Lounge</div>
                    <div className="font-medium text-slate-900">{card.travel_benefits?.international_lounge || 'Check with bank'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">Forex Markup</div>
                    <div className="font-medium text-slate-900">{card.forex_markup}%</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm text-slate-500 mb-1">Fuel Surcharge Waiver</div>
                    <div className="font-medium text-slate-900">{card.fuel_surcharge_waiver ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                {card.travel_benefits?.travel_insurance && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      <strong>Travel Insurance:</strong> {card.travel_benefits.travel_insurance}
                    </p>
                  </div>
                )}
              </div>
            </Section>

            {/* Section 8: Lifestyle Benefits */}
            {card.lifestyle_benefits && (
              <Section title="Lifestyle Benefits" icon={Users} defaultOpen={false}>
                <div className="pt-4 space-y-4">
                  {card.lifestyle_benefits.dining_benefits?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Dining</h4>
                      <ul className="space-y-1">
                        {card.lifestyle_benefits.dining_benefits.map((b, i) => (
                          <li key={i} className="text-slate-700 text-sm flex items-start gap-2">
                            <span className="text-green-500">•</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {card.lifestyle_benefits.memberships?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Complimentary Memberships</h4>
                      <div className="flex flex-wrap gap-2">
                        {card.lifestyle_benefits.memberships.map((m, i) => (
                          <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Section 9: Fees and Charges */}
            <Section title="Fees & Charges" icon={DollarSign} defaultOpen={false}>
              <div className="pt-4">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-200">
                    <tr><td className="py-2 text-slate-600">Joining Fee</td><td className="py-2 text-right font-medium">{card.joining_fee === 0 ? 'Free' : formatCurrency(card.joining_fee)}</td></tr>
                    <tr><td className="py-2 text-slate-600">Annual Fee</td><td className="py-2 text-right font-medium">{card.annual_fee === 0 ? 'Free' : formatCurrency(card.annual_fee)}</td></tr>
                    {card.fees_charges?.annual_fee_waiver && (
                      <tr><td className="py-2 text-slate-600">Fee Waiver</td><td className="py-2 text-right font-medium text-green-600">{card.fees_charges.annual_fee_waiver}</td></tr>
                    )}
                    <tr><td className="py-2 text-slate-600">Forex Markup</td><td className="py-2 text-right font-medium">{card.forex_markup}%</td></tr>
                    {card.fees_charges?.finance_charges && (
                      <tr><td className="py-2 text-slate-600">Finance Charges</td><td className="py-2 text-right font-medium">{card.fees_charges.finance_charges}</td></tr>
                    )}
                    {card.fees_charges?.late_payment_charges && (
                      <tr><td className="py-2 text-slate-600">Late Payment</td><td className="py-2 text-right font-medium">{card.fees_charges.late_payment_charges}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Section 10: Excluded Categories */}
            {card.excluded_categories?.length > 0 && (
              <Section title="Excluded Categories" icon={XCircle} defaultOpen={false}>
                <div className="pt-4">
                  <p className="text-slate-600 text-sm mb-3">Reward points are NOT earned on these categories:</p>
                  <div className="flex flex-wrap gap-2">
                    {card.excluded_categories.map((cat, idx) => (
                      <span key={idx} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">{cat}</span>
                    ))}
                  </div>
                </div>
              </Section>
            )}

            {/* Section 12: Pros and Cons */}
            {(card.pros?.length > 0 || card.cons?.length > 0) && (
              <Section title="Pros & Cons" icon={ThumbsUp}>
                <div className="pt-4 grid md:grid-cols-2 gap-6">
                  {card.pros?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Pros
                      </h4>
                      <ul className="space-y-2">
                        {card.pros.map((pro, idx) => (
                          <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span> {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {card.cons?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4" /> Cons
                      </h4>
                      <ul className="space-y-2">
                        {card.cons.map((con, idx) => (
                          <li key={idx} className="text-slate-700 text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-1">✗</span> {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Section 14: Reviews */}
            <Section title="Reviews" icon={MessageSquare}>
              <div className="pt-4 space-y-4">
                {/* Expert Review */}
                {card.expert_review && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-medium">Expert Review</span>
                      <StarRating rating={card.expert_rating || 4.0} />
                    </div>
                    <p className="text-slate-700">{card.expert_review}</p>
                  </div>
                )}
                
                {/* Category Ratings */}
                {Object.keys(card.category_ratings || {}).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(card.category_ratings).map(([cat, rating]) => (
                      <div key={cat} className="text-center">
                        <div className="text-sm text-slate-500 capitalize mb-1">{cat}</div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* User Reviews */}
                <div className="space-y-3">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{review.reviewer_name}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      <h5 className="font-medium text-slate-800 mb-1">{review.title}</h5>
                      <p className="text-slate-600 text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" onClick={() => setShowReviewForm(!showReviewForm)} className="w-full">
                  Write a Review
                </Button>
                
                {showReviewForm && (
                  <form onSubmit={submitReview} className="space-y-4 border border-slate-200 rounded-lg p-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full border rounded-lg px-4 py-2"
                      value={reviewForm.reviewer_name}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                      required
                    />
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Rating</label>
                      <select
                        className="w-full border rounded-lg px-4 py-2"
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: parseFloat(e.target.value) })}
                      >
                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Review Title"
                      className="w-full border rounded-lg px-4 py-2"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Write your review..."
                      className="w-full border rounded-lg px-4 py-2 h-24"
                      value={reviewForm.content}
                      onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                      required
                    />
                    <Button type="submit" className="w-full">Submit Review</Button>
                  </form>
                )}
              </div>
            </Section>

            {/* Section 15: FAQs */}
            {card.faqs?.length > 0 && (
              <Section title="Frequently Asked Questions" icon={HelpCircle} defaultOpen={false}>
                <div className="pt-4 space-y-3">
                  {card.faqs.map((faq, idx) => (
                    <div key={idx} className="border-b border-slate-200 pb-3 last:border-0">
                      <h4 className="font-medium text-slate-900 mb-1">{faq.question}</h4>
                      <p className="text-slate-600 text-sm">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Section 11: Eligibility Criteria */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Eligibility Criteria
              </h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Min. Age</span>
                  <span className="font-medium">{card.eligibility_criteria?.min_age || 21} - {card.eligibility_criteria?.max_age || 60} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Min. Income</span>
                  <span className="font-medium">{formatCurrency(card.min_income)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-sm">Credit Score</span>
                  <span className="font-medium">{card.min_credit_score}+</span>
                </div>
              </div>

              <Button 
                className="w-full mb-3" 
                onClick={() => setShowEligibilityForm(!showEligibilityForm)}
                data-testid="check-eligibility-btn"
              >
                Check Eligibility
              </Button>

              {showEligibilityForm && (
                <form onSubmit={checkEligibility} className="space-y-3 border-t pt-4 mt-4">
                  <input
                    type="number"
                    placeholder="Your Age"
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={eligibilityForm.age}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, age: e.target.value })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Annual Income (₹)"
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={eligibilityForm.annual_income}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, annual_income: e.target.value })}
                    required
                  />
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={eligibilityForm.employment_type}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, employment_type: e.target.value })}
                  >
                    <option value="salaried">Salaried</option>
                    <option value="self_employed">Self-Employed</option>
                    <option value="business">Business Owner</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Credit Score (optional)"
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={eligibilityForm.credit_score}
                    onChange={(e) => setEligibilityForm({ ...eligibilityForm, credit_score: e.target.value })}
                  />
                  <Button type="submit" className="w-full" size="sm">Check Now</Button>
                </form>
              )}

              {eligibilityResult && (
                <div className={`mt-4 p-4 rounded-lg ${eligibilityResult.is_eligible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {eligibilityResult.is_eligible ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${eligibilityResult.is_eligible ? 'text-green-800' : 'text-red-800'}`}>
                      {eligibilityResult.is_eligible ? 'You are eligible!' : 'Not eligible'}
                    </span>
                  </div>
                  {eligibilityResult.issues?.length > 0 && (
                    <ul className="text-sm text-red-700 space-y-1">
                      {eligibilityResult.issues.map((issue, idx) => (
                        <li key={idx}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                  {eligibilityResult.is_eligible && (
                    <Button 
                      className="w-full mt-3" 
                      onClick={() => setShowApplyForm(true)}
                      size="sm"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              )}

              {/* Section 16: Apply Form */}
              {showApplyForm && (
                <form onSubmit={submitApplication} className="mt-4 space-y-3 border-t pt-4">
                  <h4 className="font-medium text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Apply Now
                  </h4>
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={applyForm.user_name}
                    onChange={(e) => setApplyForm({ ...applyForm, user_name: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={applyForm.mobile_number}
                    onChange={(e) => setApplyForm({ ...applyForm, mobile_number: e.target.value })}
                    required
                    pattern="[0-9]{10}"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    className="w-full border rounded-lg px-4 py-2 text-sm"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                  />
                  <Button type="submit" className="w-full">Submit Application</Button>
                  <p className="text-xs text-slate-500 text-center">Our team will contact you within 24 hours</p>
                </form>
              )}

              {/* Apply Links */}
              <div className="mt-4 pt-4 border-t space-y-2">
                {card.affiliate_link && (
                  <a 
                    href={card.affiliate_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                  >
                    Apply on BankBazaar
                  </a>
                )}
                {card.bank_apply_link && (
                  <a 
                    href={card.bank_apply_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 rounded-lg transition-colors"
                  >
                    Apply on {card.bank_name}
                  </a>
                )}
              </div>
            </div>

            {/* Section 13: Similar Cards */}
            {card.similar_cards?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  Compare With
                </h3>
                <div className="space-y-2">
                  {card.similar_cards.map((cardId, idx) => (
                    <Link 
                      key={idx}
                      to={`/cards/${cardId}`}
                      className="block p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors"
                    >
                      <span className="text-blue-600 hover:underline capitalize">{cardId.replace(/-/g, ' ')}</span>
                    </Link>
                  ))}
                </div>
                <Link 
                  to={`/compare?ids=${id},${card.similar_cards.join(',')}`}
                  className="block mt-3"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    Compare All
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
