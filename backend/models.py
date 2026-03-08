from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Reward Earning Structure
class RewardEarning(BaseModel):
    base_rate: str = ""  # e.g., "5 reward points per ₹150 spent"
    base_value: float = 0  # e.g., 3.3% value back
    category_multipliers: Dict[str, str] = {}  # e.g., {"travel": "10X rewards", "dining": "5X rewards"}
    partner_portals: List[str] = []  # e.g., ["SmartBuy", "Swiggy"]
    accelerated_rewards: List[str] = []  # Additional reward earning info

# Reward Redemption Structure
class RewardRedemption(BaseModel):
    airmiles_ratio: Optional[str] = None  # e.g., "1 RP = 1 Air Mile"
    travel_value: Optional[str] = None  # e.g., "1 RP = ₹1"
    voucher_value: Optional[str] = None  # e.g., "1 RP = ₹0.50"
    cashback_value: Optional[str] = None  # e.g., "1 RP = ₹0.30"
    best_redemption: Optional[str] = None  # Recommended redemption method
    redemption_options: List[str] = []

# Travel Benefits Structure
class TravelBenefits(BaseModel):
    domestic_lounge: str = ""  # e.g., "Unlimited access"
    international_lounge: str = ""  # e.g., "6 visits per year"
    lounge_network: List[str] = []  # e.g., ["Priority Pass", "Dreamfolks"]
    airport_concierge: bool = False
    golf_privileges: Optional[str] = None
    airport_transfer: Optional[str] = None
    travel_insurance: Optional[str] = None
    forex_markup: float = 3.5

# Lifestyle Benefits Structure  
class LifestyleBenefits(BaseModel):
    dining_benefits: List[str] = []
    entertainment_benefits: List[str] = []
    shopping_benefits: List[str] = []
    brand_partnerships: List[str] = []
    memberships: List[str] = []  # e.g., ["Amazon Prime", "Times Prime"]

# Fees Structure
class FeesCharges(BaseModel):
    joining_fee: int = 0
    annual_fee: int = 0
    annual_fee_waiver: Optional[str] = None  # e.g., "Spend ₹4L per year"
    renewal_fee: Optional[int] = None
    finance_charges: str = "3.5% per month"
    cash_withdrawal_fee: str = "2.5% or ₹500"
    late_payment_charges: str = "Up to ₹1,300"
    over_limit_fee: Optional[str] = None
    forex_markup: str = "3.5%"
    reward_redemption_fee: Optional[str] = None
    card_replacement_fee: Optional[str] = None

# Eligibility Structure
class EligibilityCriteria(BaseModel):
    min_age: int = 21
    max_age: int = 60
    min_income_salaried: int = 0
    min_income_self_employed: Optional[int] = None
    employment_types: List[str] = ["Salaried", "Self-Employed"]
    min_credit_score: int = 700
    existing_card_required: bool = False
    additional_requirements: List[str] = []

# Review Structure
class CardReview(BaseModel):
    reviewer_name: str
    reviewer_type: str = "user"  # "user" or "expert"
    rating: float  # 1-5
    title: str
    content: str
    date: str
    helpful_count: int = 0
    verified_user: bool = False
    category_ratings: Dict[str, float] = {}  # e.g., {"rewards": 4.5, "travel": 5.0}

# FAQ Structure
class FAQ(BaseModel):
    question: str
    answer: str

# Main Credit Card Model (Extended)
class CreditCardExtended(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Basic Info (Section 1 - Header)
    id: str
    bank_name: str
    card_name: str
    card_network: str = "Visa"  # Visa, Mastercard, Amex, Diners Club, RuPay
    card_type: str  # premium, rewards, cashback, travel, fuel, shopping
    category_tags: List[str] = []  # Multiple tags like ["Travel", "Premium", "Rewards"]
    image_url: Optional[str] = None
    overall_rating: float = 4.0  # Out of 5
    
    # Section 2 - Quick Highlights
    joining_fee: int = 0
    annual_fee: int = 0
    is_lifetime_free: bool = False
    reward_rate: float = 0
    cashback_rate: float = 0
    value_back_percent: float = 0  # Overall value back
    lounge_access_summary: str = ""  # Quick summary
    forex_markup: float = 3.5
    welcome_bonus_summary: str = ""  # Quick summary
    
    # Section 3 - About the Card
    card_description: str = ""  # Detailed description
    best_suited_for: List[str] = []  # e.g., ["Frequent travelers", "High spenders"]
    key_benefits: List[str] = []
    spending_categories: List[str] = []  # Best categories for this card
    
    # Section 4 - Rewards Program
    reward_earning: Optional[Dict[str, Any]] = None
    reward_redemption: Optional[Dict[str, Any]] = None
    redemption_ratio: float = 1.0
    reward_cap_monthly: Optional[int] = None
    reward_cap_yearly: Optional[int] = None
    category_bonuses: Dict[str, float] = {}
    redemption_options: List[str] = []
    
    # Section 5 - Welcome Benefits
    welcome_benefits: str = ""
    welcome_benefits_list: List[str] = []
    welcome_bonus_conditions: Optional[str] = None  # e.g., "Spend ₹1.5L in 90 days"
    
    # Section 6 - Milestone Benefits
    milestone_benefits: List[str] = []
    milestone_details: List[Dict[str, str]] = []  # e.g., [{"spend": "₹80,000/month", "benefit": "₹500 voucher"}]
    
    # Section 7 - Travel Benefits
    travel_benefits: Optional[Dict[str, Any]] = None
    lounge_access: str = ""
    fuel_surcharge_waiver: bool = False
    
    # Section 8 - Lifestyle Benefits
    lifestyle_benefits: Optional[Dict[str, Any]] = None
    
    # Section 9 - Fees and Charges
    fees_charges: Optional[Dict[str, Any]] = None
    emi_available: bool = True
    
    # Section 10 - Excluded Categories
    excluded_categories: List[str] = []
    
    # Section 11 - Eligibility
    min_income: int = 0
    min_credit_score: int = 700
    eligibility_criteria: Optional[Dict[str, Any]] = None
    
    # Section 12 - Pros and Cons
    pros: List[str] = []
    cons: List[str] = []
    
    # Section 13 - Similar Cards for Comparison
    similar_cards: List[str] = []  # Card IDs
    
    # Section 14 - Reviews
    expert_rating: float = 4.0
    expert_review: Optional[str] = None
    user_reviews: List[Dict[str, Any]] = []
    category_ratings: Dict[str, float] = {}  # e.g., {"rewards": 4.5, "travel": 5.0, "lifestyle": 4.0}
    
    # Section 15 - FAQs
    faqs: List[Dict[str, str]] = []
    
    # Section 16 - Apply Links
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None
    bank_apply_link: Optional[str] = None
    
    # Metadata
    is_active: bool = True
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# Eligibility Check Request
class EligibilityCheckRequest(BaseModel):
    age: int
    annual_income: int
    employment_type: str  # "salaried", "self_employed", "business"
    credit_score: Optional[int] = None
    existing_cards: int = 0
    mobile_number: Optional[str] = None
    card_id: str


# Lead Capture Model
class LeadCapture(BaseModel):
    card_id: str
    card_name: str
    bank_name: str
    user_name: Optional[str] = None
    mobile_number: str
    email: Optional[str] = None
    annual_income: Optional[int] = None
    employment_type: Optional[str] = None
    created_at: str
    status: str = "new"  # new, contacted, converted, rejected
