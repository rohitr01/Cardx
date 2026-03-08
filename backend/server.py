from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from cards_data import CREDIT_CARDS_DATABASE
from auth import create_access_token, get_current_user, get_current_admin, security

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")

# Auth Models
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class AdminCardCreate(BaseModel):
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
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None

# Hardcoded admin credentials (in production, use database with hashed passwords)
ADMIN_USERS = {
    "admin@finselect.in": {
        "password": "admin123",  # In production, this should be hashed
        "role": "admin",
        "name": "Admin User"
    }
}

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

# Import card database from cards_data.py
INDIAN_CREDIT_CARDS = CREDIT_CARDS_DATABASE

# Store cards in memory (in production, use database)
cards_storage = INDIAN_CREDIT_CARDS.copy()

# Authentication Routes
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = ADMIN_USERS.get(request.email)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token_data = {
        "email": request.email,
        "role": user["role"],
        "name": user["name"]
    }
    token = create_access_token(token_data)
    
    return {
        "token": token,
        "user": {
            "email": request.email,
            "name": user["name"],
            "role": user["role"]
        }
    }

@api_router.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return current_user

# Admin Routes
@admin_router.get("/analytics")
async def get_admin_analytics(current_user: dict = Depends(get_current_admin)):
    total_cards = len(cards_storage)
    active_cards = len([c for c in cards_storage if c.get("is_active", True)])
    banks = len(set([c["bank_name"] for c in cards_storage]))
    lifetime_free = len([c for c in cards_storage if c.get("is_lifetime_free")])
    premium_cards = len([c for c in cards_storage if c.get("annual_fee", 0) > 5000])
    
    card_types = {}
    for card in cards_storage:
        card_type = card.get("card_type", "other")
        card_types[card_type] = card_types.get(card_type, 0) + 1
    
    return {
        "total_cards": total_cards,
        "active_cards": active_cards,
        "total_banks": banks,
        "lifetime_free_cards": lifetime_free,
        "premium_cards": premium_cards,
        "card_types": card_types,
        "recent_activity": []
    }

@admin_router.post("/cards")
async def create_card(card: AdminCardCreate, current_user: dict = Depends(get_current_admin)):
    # Generate ID from card name
    card_id = f"{card.bank_name.lower().replace(' ', '-')}-{card.card_name.lower().replace(' ', '-')}"
    
    new_card = {
        "id": card_id,
        **card.dict()
    }
    
    # Check if card already exists
    if any(c["id"] == card_id for c in cards_storage):
        raise HTTPException(status_code=400, detail="Card with this ID already exists")
    
    cards_storage.append(new_card)
    
    # Update the global INDIAN_CREDIT_CARDS list
    global INDIAN_CREDIT_CARDS
    INDIAN_CREDIT_CARDS = cards_storage.copy()
    
    return {"message": "Card created successfully", "card": new_card}

@admin_router.put("/cards/{card_id}")
async def update_card(card_id: str, card: AdminCardCreate, current_user: dict = Depends(get_current_admin)):
    # Find card index
    card_index = None
    for i, c in enumerate(cards_storage):
        if c["id"] == card_id:
            card_index = i
            break
    
    if card_index is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    updated_card = {
        "id": card_id,
        **card.dict()
    }
    
    cards_storage[card_index] = updated_card
    
    # Update the global INDIAN_CREDIT_CARDS list
    global INDIAN_CREDIT_CARDS
    INDIAN_CREDIT_CARDS = cards_storage.copy()
    
    return {"message": "Card updated successfully", "card": updated_card}

@admin_router.delete("/cards/{card_id}")
async def delete_card(card_id: str, current_user: dict = Depends(get_current_admin)):
    # Find and remove card
    card_index = None
    for i, c in enumerate(cards_storage):
        if c["id"] == card_id:
            card_index = i
            break
    
    if card_index is None:
        raise HTTPException(status_code=404, detail="Card not found")
    
    removed_card = cards_storage.pop(card_index)
    
    # Update the global INDIAN_CREDIT_CARDS list
    global INDIAN_CREDIT_CARDS
    INDIAN_CREDIT_CARDS = cards_storage.copy()
    
    return {"message": "Card deleted successfully", "card": removed_card}

@admin_router.get("/cards")
async def get_all_cards_admin(current_user: dict = Depends(get_current_admin)):
    return cards_storage

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
app.include_router(admin_router)

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