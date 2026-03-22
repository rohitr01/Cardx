import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from './AdminLayout';
import { 
  MessageSquare, Star, Search, User, Calendar, CreditCard,
  Loader2, ThumbsUp, Flag
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AdminReviewsPage = () => {
  const { getAuthHeader } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/admin/reviews`, { headers: getAuthHeader() });
      setReviews(res.data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.card_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
        />
      ))}
    </div>
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
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">User Reviews</h1>
          <p className="text-slate-500">{reviews.length} total reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="text-2xl font-bold text-slate-900">{reviews.length}</div>
            <div className="text-sm text-slate-500">Total Reviews</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-2xl font-bold text-amber-600">
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0}
            </div>
            <div className="text-sm text-slate-500">Avg Rating</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.rating >= 4).length}
            </div>
            <div className="text-sm text-slate-500">Positive (4+)</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="text-2xl font-bold text-red-600">
              {reviews.filter(r => r.rating < 3).length}
            </div>
            <div className="text-sm text-slate-500">Negative (&lt;3)</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{review.reviewer_name}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="capitalize">{review.card_id?.replace(/-/g, ' ')}</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">{review.title}</h4>
                <p className="text-slate-600">{review.content}</p>
              </div>

              {review.category_ratings && Object.keys(review.category_ratings).length > 0 && (
                <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100">
                  {Object.entries(review.category_ratings).map(([cat, rating]) => (
                    <div key={cat} className="flex items-center gap-1 text-sm">
                      <span className="text-slate-500 capitalize">{cat}:</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{rating}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <ThumbsUp className="w-4 h-4" />
                  {review.helpful_count || 0} helpful
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  review.verified_user ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {review.verified_user ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-500">Reviews will appear here when users submit them</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
