from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
from datetime import datetime

# User Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "user"  # user, admin, sub_admin, content_team, marketing_team
    created_at: datetime
    last_login: Optional[datetime] = None
    subscription_status: str = "free"  # free, premium
    subscription_expires_at: Optional[datetime] = None

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    session_token: str
    user_id: str
    expires_at: datetime
    created_at: datetime

# Credit Card Models
class CreditCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    bank_name: str
    card_name: str
    card_type: str
    joining_fee: int
    annual_fee: int
    is_lifetime_free: bool
    welcome_benefits: str
    reward_rate: float
    cashback_rate: float
    redemption_ratio: float
    redemption_options: List[str]
    reward_cap_monthly: Optional[int] = None
    reward_cap_yearly: Optional[int] = None
    milestone_benefits: List[str]
    excluded_categories: List[str]
    forex_markup: float
    lounge_access: str
    fuel_surcharge_waiver: bool
    emi_available: bool
    min_income: int
    min_credit_score: int
    category_bonuses: Dict[str, float]
    image_url: Optional[str] = None
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None
    is_active: bool = True
    created_by: Optional[str] = None
    updated_by: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class CardCreate(BaseModel):
    bank_name: str
    card_name: str
    card_type: str
    joining_fee: int
    annual_fee: int
    is_lifetime_free: bool
    welcome_benefits: str
    reward_rate: float = 0.0
    cashback_rate: float = 0.0
    redemption_ratio: float
    redemption_options: List[str]
    reward_cap_monthly: Optional[int] = None
    reward_cap_yearly: Optional[int] = None
    milestone_benefits: List[str]
    excluded_categories: List[str]
    forex_markup: float
    lounge_access: str
    fuel_surcharge_waiver: bool
    emi_available: bool
    min_income: int
    min_credit_score: int
    category_bonuses: Dict[str, float]
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None

class CardUpdate(BaseModel):
    bank_name: Optional[str] = None
    card_name: Optional[str] = None
    card_type: Optional[str] = None
    joining_fee: Optional[int] = None
    annual_fee: Optional[int] = None
    is_lifetime_free: Optional[bool] = None
    welcome_benefits: Optional[str] = None
    reward_rate: Optional[float] = None
    cashback_rate: Optional[float] = None
    redemption_ratio: Optional[float] = None
    redemption_options: Optional[List[str]] = None
    reward_cap_monthly: Optional[int] = None
    reward_cap_yearly: Optional[int] = None
    milestone_benefits: Optional[List[str]] = None
    excluded_categories: Optional[List[str]] = None
    forex_markup: Optional[float] = None
    lounge_access: Optional[str] = None
    fuel_surcharge_waiver: Optional[bool] = None
    emi_available: Optional[bool] = None
    min_income: Optional[int] = None
    min_credit_score: Optional[int] = None
    category_bonuses: Optional[Dict[str, float]] = None
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None
    is_active: Optional[bool] = None

# Lead Management
class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    lead_id: str
    user_id: Optional[str] = None
    card_id: str
    user_name: str
    user_email: str
    user_phone: str
    status: str = "applied"  # applied, under_review, approved, rejected
    applied_at: datetime
    updated_at: datetime
    affiliate_source: Optional[str] = None
    notes: Optional[str] = None

# Analytics
class AnalyticsData(BaseModel):
    total_cards: int
    active_cards: int
    total_users: int
    total_leads: int
    leads_this_month: int
    most_compared_cards: List[Dict[str, any]]
    top_banks: List[Dict[str, int]]
    popular_categories: Dict[str, int]
