from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

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

class FilterRequest(BaseModel):
    monthly_spending: Optional[int] = None
    spending_categories: Optional[Dict[str, int]] = None
    annual_fee_preference: Optional[str] = None
    preferred_bank: Optional[str] = None
    min_credit_score: Optional[int] = None
    income_range: Optional[int] = None
    card_type: Optional[str] = None

class RewardCalculationRequest(BaseModel):
    card_id: str
    monthly_spending: Dict[str, int]

class CompareRequest(BaseModel):
    card_ids: List[str]

class AIRecommendationRequest(BaseModel):
    monthly_spending: Dict[str, int]
    preferences: str
    income: int
    credit_score: int

INDIAN_CREDIT_CARDS = [
    {
        "id": "hdfc-infinia",
        "bank_name": "HDFC Bank",
        "card_name": "Infinia",
        "card_type": "premium",
        "joining_fee": 12500,
        "annual_fee": 12500,
        "is_lifetime_free": False,
        "welcome_benefits": "10,000 reward points + complimentary Club Marriott membership",
        "reward_rate": 3.3,
        "cashback_rate": 0.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Travel", "Apple products", "Smartbuy", "Statement credit"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["10,000 points on ₹8L annual spend"],
        "excluded_categories": ["Fuel", "Utilities", "Rent"],
        "forex_markup": 2.0,
        "lounge_access": "Unlimited domestic & international + guest",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 250000,
        "min_credit_score": 750,
        "category_bonuses": {"travel": 5.0, "dining": 3.3, "shopping": 3.3}
    },
    {
        "id": "hdfc-regalia-gold",
        "bank_name": "HDFC Bank",
        "card_name": "Regalia Gold",
        "card_type": "premium",
        "joining_fee": 2500,
        "annual_fee": 2500,
        "is_lifetime_free": False,
        "welcome_benefits": "5,000 reward points",
        "reward_rate": 2.5,
        "cashback_rate": 0.0,
        "redemption_ratio": 0.7,
        "redemption_options": ["Travel", "Vouchers", "Statement credit"],
        "reward_cap_monthly": 15000,
        "reward_cap_yearly": None,
        "milestone_benefits": ["4,000 points on ₹3L annual spend"],
        "excluded_categories": ["Fuel", "Utilities"],
        "forex_markup": 2.0,
        "lounge_access": "12 domestic per year",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 100000,
        "min_credit_score": 700,
        "category_bonuses": {"travel": 4.0, "dining": 2.5, "shopping": 2.5}
    },
    {
        "id": "sbi-simplyclick",
        "bank_name": "SBI Card",
        "card_name": "SimplyCLICK",
        "card_type": "cashback",
        "joining_fee": 499,
        "annual_fee": 499,
        "is_lifetime_free": False,
        "welcome_benefits": "₹500 Amazon voucher",
        "reward_rate": 1.0,
        "cashback_rate": 5.0,
        "redemption_ratio": 0.25,
        "redemption_options": ["Amazon vouchers", "Statement credit"],
        "reward_cap_monthly": 2000,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Annual fee waiver on ₹1L spend"],
        "excluded_categories": ["Fuel", "Utilities", "Rent"],
        "forex_markup": 3.5,
        "lounge_access": "None",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 30000,
        "min_credit_score": 650,
        "category_bonuses": {"online_shopping": 10.0, "dining": 1.0}
    },
    {
        "id": "icici-amazon-pay",
        "bank_name": "ICICI Bank",
        "card_name": "Amazon Pay",
        "card_type": "cashback",
        "joining_fee": 0,
        "annual_fee": 0,
        "is_lifetime_free": True,
        "welcome_benefits": "₹500 Amazon voucher on first transaction",
        "reward_rate": 0.0,
        "cashback_rate": 5.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Amazon Pay balance"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": 15000,
        "milestone_benefits": [],
        "excluded_categories": ["Fuel", "Rent", "EMI"],
        "forex_markup": 3.5,
        "lounge_access": "None",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 25000,
        "min_credit_score": 650,
        "category_bonuses": {"amazon": 5.0, "online_shopping": 2.0}
    },
    {
        "id": "axis-magnus",
        "bank_name": "Axis Bank",
        "card_name": "Magnus",
        "card_type": "premium",
        "joining_fee": 12500,
        "annual_fee": 12500,
        "is_lifetime_free": False,
        "welcome_benefits": "25,000 Edge Reward points",
        "reward_rate": 12.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Travel", "Vouchers", "Airmiles"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["25,000 points on ₹15L annual spend"],
        "excluded_categories": ["Fuel", "Rent"],
        "forex_markup": 2.0,
        "lounge_access": "Unlimited domestic & 8 international",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 250000,
        "min_credit_score": 750,
        "category_bonuses": {"travel": 12.0, "dining": 12.0, "shopping": 6.0}
    },
    {
        "id": "amex-platinum",
        "bank_name": "American Express",
        "card_name": "Platinum Card",
        "card_type": "premium",
        "joining_fee": 60000,
        "annual_fee": 60000,
        "is_lifetime_free": False,
        "welcome_benefits": "Taj voucher worth ₹10,000 + Airport transfers",
        "reward_rate": 1.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 0.5,
        "redemption_options": ["Travel", "Hotels", "Statement credit"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Taj vouchers on milestone spend"],
        "excluded_categories": [],
        "forex_markup": 3.5,
        "lounge_access": "Unlimited domestic & international + guest + Centurion lounges",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 500000,
        "min_credit_score": 800,
        "category_bonuses": {"travel": 5.0, "dining": 2.0, "hotels": 5.0}
    },
    {
        "id": "axis-ace",
        "bank_name": "Axis Bank",
        "card_name": "Ace",
        "card_type": "lifetime_free",
        "joining_fee": 0,
        "annual_fee": 0,
        "is_lifetime_free": True,
        "welcome_benefits": "₹500 cashback on ₹10,000 spend in 45 days",
        "reward_rate": 0.0,
        "cashback_rate": 5.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Statement credit"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": 15000,
        "milestone_benefits": [],
        "excluded_categories": ["Fuel", "Rent", "Wallet loads"],
        "forex_markup": 3.5,
        "lounge_access": "None",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 20000,
        "min_credit_score": 600,
        "category_bonuses": {"google_pay": 5.0, "utilities": 2.0}
    },
    {
        "id": "indusind-legend",
        "bank_name": "IndusInd Bank",
        "card_name": "Legend",
        "card_type": "premium",
        "joining_fee": 10000,
        "annual_fee": 10000,
        "is_lifetime_free": False,
        "welcome_benefits": "₹25,000 welcome vouchers + Golf rounds",
        "reward_rate": 3.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Airmiles", "Vouchers", "Statement credit"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Annual fee waiver on ₹8L spend"],
        "excluded_categories": ["Fuel"],
        "forex_markup": 1.75,
        "lounge_access": "Unlimited domestic & international + guest",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 200000,
        "min_credit_score": 750,
        "category_bonuses": {"travel": 5.0, "dining": 3.0, "shopping": 3.0}
    },
    {
        "id": "sc-ultimate",
        "bank_name": "Standard Chartered",
        "card_name": "Ultimate",
        "card_type": "premium",
        "joining_fee": 5000,
        "annual_fee": 5000,
        "is_lifetime_free": False,
        "welcome_benefits": "10,000 reward points",
        "reward_rate": 3.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 0.8,
        "redemption_options": ["Airmiles", "Vouchers", "Statement credit"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Annual fee waiver on ₹4L spend"],
        "excluded_categories": ["Fuel", "Utilities"],
        "forex_markup": 3.5,
        "lounge_access": "Unlimited domestic & 6 international",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 150000,
        "min_credit_score": 720,
        "category_bonuses": {"travel": 5.0, "dining": 5.0, "shopping": 1.5}
    },
    {
        "id": "hsbc-cashback",
        "bank_name": "HSBC",
        "card_name": "Cashback",
        "card_type": "cashback",
        "joining_fee": 0,
        "annual_fee": 0,
        "is_lifetime_free": True,
        "welcome_benefits": "₹500 cashback on first transaction",
        "reward_rate": 0.0,
        "cashback_rate": 10.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Statement credit"],
        "reward_cap_monthly": 1000,
        "reward_cap_yearly": None,
        "milestone_benefits": [],
        "excluded_categories": ["Fuel", "Rent", "Utilities"],
        "forex_markup": 3.5,
        "lounge_access": "None",
        "fuel_surcharge_waiver": False,
        "emi_available": True,
        "min_income": 50000,
        "min_credit_score": 700,
        "category_bonuses": {"online_shopping": 10.0, "groceries": 5.0}
    },
    {
        "id": "kotak-white-reserve",
        "bank_name": "Kotak Mahindra Bank",
        "card_name": "White Reserve",
        "card_type": "premium",
        "joining_fee": 5000,
        "annual_fee": 5000,
        "is_lifetime_free": False,
        "welcome_benefits": "10,000 reward points",
        "reward_rate": 2.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 0.5,
        "redemption_options": ["Airmiles", "Vouchers", "Statement credit"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Annual fee reversal on ₹4L spend"],
        "excluded_categories": ["Fuel", "Rent"],
        "forex_markup": 2.5,
        "lounge_access": "8 domestic & 4 international per year",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 120000,
        "min_credit_score": 700,
        "category_bonuses": {"dining": 4.0, "travel": 3.0, "shopping": 2.0}
    },
    {
        "id": "citi-rewards",
        "bank_name": "Citi Bank",
        "card_name": "Rewards",
        "card_type": "lifestyle",
        "joining_fee": 1000,
        "annual_fee": 1000,
        "is_lifetime_free": False,
        "welcome_benefits": "2,500 reward points",
        "reward_rate": 2.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 0.25,
        "redemption_options": ["Vouchers", "Statement credit", "Products"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Annual fee waiver on ₹3L spend"],
        "excluded_categories": ["Fuel"],
        "forex_markup": 3.5,
        "lounge_access": "4 domestic per year",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 80000,
        "min_credit_score": 680,
        "category_bonuses": {"dining": 5.0, "shopping": 2.0}
    },
    {
        "id": "yes-marquee",
        "bank_name": "Yes Bank",
        "card_name": "Marquee",
        "card_type": "premium",
        "joining_fee": 10000,
        "annual_fee": 10000,
        "is_lifetime_free": False,
        "welcome_benefits": "Club Vistara Gold membership",
        "reward_rate": 6.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Airmiles", "Statement credit", "Vouchers"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["₹10,000 voucher on ₹8L spend"],
        "excluded_categories": ["Fuel"],
        "forex_markup": 1.75,
        "lounge_access": "Unlimited domestic & 6 international",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 250000,
        "min_credit_score": 750,
        "category_bonuses": {"travel": 12.0, "dining": 6.0, "shopping": 3.0}
    },
    {
        "id": "rbl-shoprite",
        "bank_name": "RBL Bank",
        "card_name": "Shoprite",
        "card_type": "cashback",
        "joining_fee": 0,
        "annual_fee": 0,
        "is_lifetime_free": True,
        "welcome_benefits": "₹500 gift voucher",
        "reward_rate": 0.0,
        "cashback_rate": 5.0,
        "redemption_ratio": 1.0,
        "redemption_options": ["Statement credit"],
        "reward_cap_monthly": 2000,
        "reward_cap_yearly": None,
        "milestone_benefits": [],
        "excluded_categories": ["Fuel", "Rent"],
        "forex_markup": 3.5,
        "lounge_access": "None",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 30000,
        "min_credit_score": 650,
        "category_bonuses": {"groceries": 10.0, "dining": 5.0}
    },
    {
        "id": "federal-celesta",
        "bank_name": "Federal Bank",
        "card_name": "Celesta",
        "card_type": "travel",
        "joining_fee": 1500,
        "annual_fee": 1500,
        "is_lifetime_free": False,
        "welcome_benefits": "2 complimentary movie tickets",
        "reward_rate": 2.0,
        "cashback_rate": 0.0,
        "redemption_ratio": 0.5,
        "redemption_options": ["Airmiles", "Vouchers"],
        "reward_cap_monthly": None,
        "reward_cap_yearly": None,
        "milestone_benefits": ["Fee waiver on ₹2L spend"],
        "excluded_categories": ["Fuel"],
        "forex_markup": 3.0,
        "lounge_access": "4 domestic per year",
        "fuel_surcharge_waiver": True,
        "emi_available": True,
        "min_income": 60000,
        "min_credit_score": 680,
        "category_bonuses": {"travel": 4.0, "dining": 2.0}
    }
]

@api_router.get("/")
async def root():
    return {"message": "FinSelect India - Credit Card Comparison API"}

@api_router.get("/cards", response_model=List[CreditCard])
async def get_all_cards(
    card_type: Optional[str] = Query(None),
    bank_name: Optional[str] = Query(None),
    is_lifetime_free: Optional[bool] = Query(None)
):
    cards = [CreditCard(**card) for card in INDIAN_CREDIT_CARDS]
    
    if card_type:
        cards = [c for c in cards if c.card_type == card_type]
    if bank_name:
        cards = [c for c in cards if c.bank_name == bank_name]
    if is_lifetime_free is not None:
        cards = [c for c in cards if c.is_lifetime_free == is_lifetime_free]
    
    return cards

@api_router.get("/cards/{card_id}", response_model=CreditCard)
async def get_card(card_id: str):
    for card_data in INDIAN_CREDIT_CARDS:
        card = CreditCard(**card_data)
        if card.id == card_id:
            return card
    raise HTTPException(status_code=404, detail="Card not found")

@api_router.post("/cards/filter", response_model=List[CreditCard])
async def filter_cards(filter_req: FilterRequest):
    cards = [CreditCard(**card) for card in INDIAN_CREDIT_CARDS]
    
    if filter_req.income_range:
        cards = [c for c in cards if c.min_income <= filter_req.income_range]
    
    if filter_req.min_credit_score:
        cards = [c for c in cards if c.min_credit_score <= filter_req.min_credit_score]
    
    if filter_req.annual_fee_preference == "free":
        cards = [c for c in cards if c.is_lifetime_free]
    elif filter_req.annual_fee_preference == "low":
        cards = [c for c in cards if c.annual_fee <= 2500]
    elif filter_req.annual_fee_preference == "premium":
        cards = [c for c in cards if c.annual_fee > 5000]
    
    if filter_req.preferred_bank:
        cards = [c for c in cards if c.bank_name == filter_req.preferred_bank]
    
    if filter_req.card_type:
        cards = [c for c in cards if c.card_type == filter_req.card_type]
    
    return cards

@api_router.post("/calculate-rewards")
async def calculate_rewards(calc_req: RewardCalculationRequest):
    card = None
    for card_data in INDIAN_CREDIT_CARDS:
        temp_card = CreditCard(**card_data)
        if temp_card.id == calc_req.card_id:
            card = temp_card
            break
    
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    monthly_rewards = 0
    category_breakdown = {}
    
    for category, amount in calc_req.monthly_spending.items():
        if category.lower() in [e.lower() for e in card.excluded_categories]:
            continue
        
        rate = card.category_bonuses.get(category, card.reward_rate if card.reward_rate > 0 else card.cashback_rate)
        reward = (amount * rate) / 100
        
        if card.reward_cap_monthly and reward > card.reward_cap_monthly:
            reward = card.reward_cap_monthly
        
        monthly_rewards += reward
        category_breakdown[category] = reward
    
    yearly_rewards = monthly_rewards * 12
    
    if card.reward_cap_yearly and yearly_rewards > card.reward_cap_yearly:
        yearly_rewards = card.reward_cap_yearly
    
    real_value = yearly_rewards * card.redemption_ratio
    net_benefit = real_value - card.annual_fee
    
    return {
        "card_id": card.id,
        "card_name": f"{card.bank_name} {card.card_name}",
        "monthly_rewards": round(monthly_rewards, 2),
        "yearly_rewards": round(yearly_rewards, 2),
        "real_value_inr": round(real_value, 2),
        "annual_fee": card.annual_fee,
        "net_benefit": round(net_benefit, 2),
        "category_breakdown": category_breakdown,
        "redemption_ratio": card.redemption_ratio
    }

@api_router.post("/compare", response_model=List[CreditCard])
async def compare_cards(compare_req: CompareRequest):
    if len(compare_req.card_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 cards can be compared")
    
    cards = []
    for card_id in compare_req.card_ids:
        for card_data in INDIAN_CREDIT_CARDS:
            card = CreditCard(**card_data)
            if card.id == card_id:
                cards.append(card)
                break
    
    return cards

@api_router.get("/insights/best-by-category")
async def get_best_cards_by_category():
    cards = [CreditCard(**card) for card in INDIAN_CREDIT_CARDS]
    
    best_fuel = max([c for c in cards if "fuel" in c.category_bonuses], 
                    key=lambda x: x.category_bonuses.get("fuel", 0), default=None)
    
    best_travel = max([c for c in cards if "travel" in c.category_bonuses], 
                      key=lambda x: x.category_bonuses.get("travel", 0), default=None)
    
    best_online = max([c for c in cards if "online_shopping" in c.category_bonuses], 
                      key=lambda x: x.category_bonuses.get("online_shopping", 0), default=None)
    
    best_dining = max([c for c in cards if "dining" in c.category_bonuses], 
                      key=lambda x: x.category_bonuses.get("dining", 0), default=None)
    
    lifetime_free = [c for c in cards if c.is_lifetime_free]
    premium = sorted([c for c in cards if c.annual_fee > 10000], 
                    key=lambda x: x.reward_rate, reverse=True)[:3]
    
    return {
        "best_for_fuel": best_fuel.model_dump() if best_fuel else None,
        "best_for_travel": best_travel.model_dump() if best_travel else None,
        "best_for_online_shopping": best_online.model_dump() if best_online else None,
        "best_for_dining": best_dining.model_dump() if best_dining else None,
        "best_lifetime_free": [c.model_dump() for c in lifetime_free[:3]],
        "best_premium_cards": [c.model_dump() for c in premium]
    }

@api_router.post("/recommend-ai")
async def ai_recommendation(req: AIRecommendationRequest):
    try:
        spending_summary = ", ".join([f"{cat}: ₹{amt}" for cat, amt in req.monthly_spending.items()])
        
        prompt = f"""
You are a credit card expert in India. Based on the following user profile, recommend the top 3 credit cards from the available options.

User Profile:
- Monthly Spending: {spending_summary}
- Income: ₹{req.income}
- Credit Score: {req.credit_score}
- Preferences: {req.preferences}

Analyze the user's spending pattern and recommend cards that will maximize their rewards and benefits. 
Provide your response in this exact JSON format:
{{
  "recommendations": [
    {{
      "card_name": "Bank Name Card Name",
      "reason": "Brief reason why this card is recommended",
      "estimated_yearly_benefit": "Estimated value in ₹"
    }}
  ]
}}
"""
        
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"recommendation_{uuid.uuid4()}",
            system_message="You are a helpful credit card advisor for Indian users."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {"ai_response": response, "user_profile": req.model_dump()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI recommendation failed: {str(e)}")

@api_router.get("/banks")
async def get_banks():
    banks = list(set([card["bank_name"] for card in INDIAN_CREDIT_CARDS]))
    return {"banks": sorted(banks)}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()