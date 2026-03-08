from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
from cards_data import CREDIT_CARDS_DATABASE
from auth import create_access_token, get_current_user, get_current_admin, security
from models import CreditCardExtended, EligibilityCheckRequest, LeadCapture

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# MongoDB Collections
cards_collection = db['credit_cards']
reviews_collection = db['reviews']
leads_collection = db['leads']

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
    # Basic Info
    bank_name: str
    card_name: str
    card_network: str = "Visa"
    card_type: str
    category_tags: List[str] = []
    image_url: Optional[str] = None
    overall_rating: float = 4.0
    
    # Quick Highlights
    joining_fee: int = 0
    annual_fee: int = 0
    is_lifetime_free: bool = False
    reward_rate: float = 0
    cashback_rate: float = 0
    value_back_percent: float = 0
    lounge_access_summary: str = ""
    forex_markup: float = 3.5
    welcome_bonus_summary: str = ""
    
    # About the Card
    card_description: str = ""
    best_suited_for: List[str] = []
    key_benefits: List[str] = []
    spending_categories: List[str] = []
    
    # Rewards Program
    reward_earning: Optional[Dict[str, Any]] = None
    reward_redemption: Optional[Dict[str, Any]] = None
    redemption_ratio: float = 1.0
    reward_cap_monthly: Optional[int] = None
    reward_cap_yearly: Optional[int] = None
    category_bonuses: Dict[str, float] = {}
    redemption_options: List[str] = []
    
    # Welcome Benefits
    welcome_benefits: str = ""
    welcome_benefits_list: List[str] = []
    welcome_bonus_conditions: Optional[str] = None
    
    # Milestone Benefits
    milestone_benefits: List[str] = []
    milestone_details: List[Dict[str, str]] = []
    
    # Travel Benefits
    travel_benefits: Optional[Dict[str, Any]] = None
    lounge_access: str = ""
    fuel_surcharge_waiver: bool = False
    
    # Lifestyle Benefits
    lifestyle_benefits: Optional[Dict[str, Any]] = None
    
    # Fees and Charges
    fees_charges: Optional[Dict[str, Any]] = None
    emi_available: bool = True
    
    # Excluded Categories
    excluded_categories: List[str] = []
    
    # Eligibility
    min_income: int = 0
    min_credit_score: int = 700
    eligibility_criteria: Optional[Dict[str, Any]] = None
    
    # Pros and Cons
    pros: List[str] = []
    cons: List[str] = []
    
    # Similar Cards
    similar_cards: List[str] = []
    
    # Reviews
    expert_rating: float = 4.0
    expert_review: Optional[str] = None
    category_ratings: Dict[str, float] = {}
    
    # FAQs
    faqs: List[Dict[str, str]] = []
    
    # Apply Links
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None
    bank_apply_link: Optional[str] = None

# Review Submit Model
class ReviewSubmit(BaseModel):
    card_id: str
    reviewer_name: str
    rating: float
    title: str
    content: str
    category_ratings: Dict[str, float] = {}

# Hardcoded admin credentials
ADMIN_USERS = {
    "admin@finselect.in": {
        "password": "admin123",
        "role": "admin",
        "name": "Admin User"
    }
}

# Backward compatible CreditCard model
class CreditCard(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    bank_name: str
    card_name: str
    card_network: str = "Visa"
    card_type: str
    category_tags: List[str] = []
    image_url: Optional[str] = None
    overall_rating: float = 4.0
    joining_fee: int = 0
    annual_fee: int = 0
    is_lifetime_free: bool = False
    reward_rate: float = 0
    cashback_rate: float = 0
    value_back_percent: float = 0
    lounge_access_summary: str = ""
    forex_markup: float = 3.5
    welcome_bonus_summary: str = ""
    card_description: str = ""
    best_suited_for: List[str] = []
    key_benefits: List[str] = []
    spending_categories: List[str] = []
    reward_earning: Optional[Dict[str, Any]] = None
    reward_redemption: Optional[Dict[str, Any]] = None
    redemption_ratio: float = 1.0
    reward_cap_monthly: Optional[int] = None
    reward_cap_yearly: Optional[int] = None
    category_bonuses: Dict[str, float] = {}
    redemption_options: List[str] = []
    welcome_benefits: str = ""
    welcome_benefits_list: List[str] = []
    welcome_bonus_conditions: Optional[str] = None
    milestone_benefits: List[str] = []
    milestone_details: List[Dict[str, str]] = []
    travel_benefits: Optional[Dict[str, Any]] = None
    lounge_access: str = ""
    fuel_surcharge_waiver: bool = False
    lifestyle_benefits: Optional[Dict[str, Any]] = None
    fees_charges: Optional[Dict[str, Any]] = None
    emi_available: bool = True
    excluded_categories: List[str] = []
    min_income: int = 0
    min_credit_score: int = 700
    eligibility_criteria: Optional[Dict[str, Any]] = None
    pros: List[str] = []
    cons: List[str] = []
    similar_cards: List[str] = []
    expert_rating: float = 4.0
    expert_review: Optional[str] = None
    user_reviews: List[Dict[str, Any]] = []
    category_ratings: Dict[str, float] = {}
    faqs: List[Dict[str, str]] = []
    affiliate_link: Optional[str] = None
    bankbazaar_link: Optional[str] = None
    paisabazaar_link: Optional[str] = None
    bank_apply_link: Optional[str] = None

class FilterRequest(BaseModel):
    monthly_spending: Optional[int] = None
    spending_categories: Optional[Dict[str, int]] = None
    annual_fee_preference: Optional[str] = None
    preferred_bank: Optional[str] = None
    min_credit_score: Optional[int] = None
    income_range: Optional[int] = None
    card_type: Optional[str] = None
    card_network: Optional[str] = None
    has_lounge_access: Optional[bool] = None
    category_tag: Optional[str] = None

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

# Helper function to get all cards from MongoDB
async def get_cards_from_db():
    cards = []
    cursor = cards_collection.find({}, {"_id": 0})
    async for card in cursor:
        cards.append(card)
    return cards

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
    cards = await get_cards_from_db()
    total_cards = len(cards)
    active_cards = len([c for c in cards if c.get("is_active", True)])
    banks = len(set([c["bank_name"] for c in cards]))
    lifetime_free = len([c for c in cards if c.get("is_lifetime_free")])
    premium_cards = len([c for c in cards if c.get("annual_fee", 0) > 5000])
    
    # Count leads
    total_leads = await leads_collection.count_documents({})
    new_leads = await leads_collection.count_documents({"status": "new"})
    
    # Count reviews
    total_reviews = await reviews_collection.count_documents({})
    
    card_types = {}
    for card in cards:
        card_type = card.get("card_type", "other")
        card_types[card_type] = card_types.get(card_type, 0) + 1
    
    return {
        "total_cards": total_cards,
        "active_cards": active_cards,
        "total_banks": banks,
        "lifetime_free_cards": lifetime_free,
        "premium_cards": premium_cards,
        "card_types": card_types,
        "total_leads": total_leads,
        "new_leads": new_leads,
        "total_reviews": total_reviews,
        "recent_activity": []
    }

@admin_router.post("/cards")
async def create_card(card: AdminCardCreate, current_user: dict = Depends(get_current_admin)):
    card_id = f"{card.bank_name.lower().replace(' ', '-')}-{card.card_name.lower().replace(' ', '-')}"
    
    existing = await cards_collection.find_one({"id": card_id})
    if existing:
        raise HTTPException(status_code=400, detail="Card with this ID already exists")
    
    new_card = {
        "id": card_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "is_active": True,
        "user_reviews": [],
        **card.dict()
    }
    
    await cards_collection.insert_one(new_card)
    new_card.pop("_id", None)
    return {"message": "Card created successfully", "card": new_card}

@admin_router.put("/cards/{card_id}")
async def update_card(card_id: str, card: AdminCardCreate, current_user: dict = Depends(get_current_admin)):
    existing = await cards_collection.find_one({"id": card_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Card not found")
    
    updated_card = {
        "id": card_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_at": existing.get("created_at"),
        "user_reviews": existing.get("user_reviews", []),
        "is_active": existing.get("is_active", True),
        **card.dict()
    }
    
    await cards_collection.update_one({"id": card_id}, {"$set": updated_card})
    return {"message": "Card updated successfully", "card": updated_card}

@admin_router.delete("/cards/{card_id}")
async def delete_card(card_id: str, current_user: dict = Depends(get_current_admin)):
    existing = await cards_collection.find_one({"id": card_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Card not found")
    
    await cards_collection.delete_one({"id": card_id})
    existing.pop("_id", None)
    return {"message": "Card deleted successfully", "card": existing}

@admin_router.get("/cards")
async def get_all_cards_admin(current_user: dict = Depends(get_current_admin)):
    return await get_cards_from_db()

@admin_router.get("/leads")
async def get_leads(current_user: dict = Depends(get_current_admin)):
    leads = []
    cursor = leads_collection.find({}, {"_id": 0}).sort("created_at", -1)
    async for lead in cursor:
        leads.append(lead)
    return leads

@admin_router.put("/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, status: str, current_user: dict = Depends(get_current_admin)):
    await leads_collection.update_one(
        {"id": lead_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Lead status updated"}

@admin_router.get("/reviews")
async def get_reviews_admin(current_user: dict = Depends(get_current_admin)):
    reviews = []
    cursor = reviews_collection.find({}, {"_id": 0}).sort("created_at", -1)
    async for review in cursor:
        reviews.append(review)
    return reviews

# Public API Routes
@api_router.get("/")
async def root():
    return {"message": "FinSelect India - Credit Card Comparison API"}

@api_router.get("/cards", response_model=List[CreditCard])
async def get_all_cards(
    card_type: Optional[str] = Query(None),
    bank_name: Optional[str] = Query(None),
    is_lifetime_free: Optional[bool] = Query(None),
    card_network: Optional[str] = Query(None),
    category_tag: Optional[str] = Query(None)
):
    cards_data = await get_cards_from_db()
    cards = [CreditCard(**card) for card in cards_data]
    
    if card_type:
        cards = [c for c in cards if c.card_type == card_type]
    if bank_name:
        cards = [c for c in cards if c.bank_name == bank_name]
    if is_lifetime_free is not None:
        cards = [c for c in cards if c.is_lifetime_free == is_lifetime_free]
    if card_network:
        cards = [c for c in cards if c.card_network == card_network]
    if category_tag:
        cards = [c for c in cards if category_tag in c.category_tags]
    
    return cards

@api_router.get("/cards/{card_id}", response_model=CreditCard)
async def get_card(card_id: str):
    card_data = await cards_collection.find_one({"id": card_id}, {"_id": 0})
    if not card_data:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # Fetch reviews for this card
    reviews = []
    cursor = reviews_collection.find({"card_id": card_id}, {"_id": 0}).sort("created_at", -1).limit(10)
    async for review in cursor:
        reviews.append(review)
    
    card_data["user_reviews"] = reviews
    return CreditCard(**card_data)

@api_router.post("/cards/filter", response_model=List[CreditCard])
async def filter_cards(filter_req: FilterRequest):
    cards_data = await get_cards_from_db()
    cards = [CreditCard(**card) for card in cards_data]
    
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
    
    if filter_req.card_network:
        cards = [c for c in cards if c.card_network == filter_req.card_network]
    
    if filter_req.has_lounge_access:
        cards = [c for c in cards if c.lounge_access and c.lounge_access.lower() != "none"]
    
    if filter_req.category_tag:
        cards = [c for c in cards if filter_req.category_tag in c.category_tags]
    
    return cards

@api_router.post("/calculate-rewards")
async def calculate_rewards(calc_req: RewardCalculationRequest):
    card_data = await cards_collection.find_one({"id": calc_req.card_id}, {"_id": 0})
    if not card_data:
        raise HTTPException(status_code=404, detail="Card not found")
    
    card = CreditCard(**card_data)
    
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
        category_breakdown[category] = round(reward, 2)
    
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
        card_data = await cards_collection.find_one({"id": card_id}, {"_id": 0})
        if card_data:
            cards.append(CreditCard(**card_data))
    
    return cards

@api_router.get("/insights/best-by-category")
async def get_best_cards_by_category():
    cards_data = await get_cards_from_db()
    cards = [CreditCard(**card) for card in cards_data]
    
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

# Eligibility Check Endpoint
@api_router.post("/check-eligibility")
async def check_eligibility(req: EligibilityCheckRequest):
    card_data = await cards_collection.find_one({"id": req.card_id}, {"_id": 0})
    if not card_data:
        raise HTTPException(status_code=404, detail="Card not found")
    
    card = CreditCard(**card_data)
    
    eligibility = card.eligibility_criteria or {}
    min_age = eligibility.get("min_age", 21)
    max_age = eligibility.get("max_age", 60)
    min_income = card.min_income * 12  # Convert monthly to annual
    min_credit_score = card.min_credit_score
    
    issues = []
    is_eligible = True
    
    # Age check
    if req.age < min_age:
        issues.append(f"Minimum age requirement is {min_age} years")
        is_eligible = False
    if req.age > max_age:
        issues.append(f"Maximum age limit is {max_age} years")
        is_eligible = False
    
    # Income check
    if req.annual_income < min_income:
        issues.append(f"Minimum annual income required is ₹{min_income:,}")
        is_eligible = False
    
    # Credit score check
    if req.credit_score and req.credit_score < min_credit_score:
        issues.append(f"Minimum credit score required is {min_credit_score}")
        is_eligible = False
    
    return {
        "card_id": req.card_id,
        "card_name": f"{card.bank_name} {card.card_name}",
        "is_eligible": is_eligible,
        "issues": issues,
        "requirements": {
            "min_age": min_age,
            "max_age": max_age,
            "min_annual_income": min_income,
            "min_credit_score": min_credit_score
        }
    }

# Lead Capture Endpoint
@api_router.post("/apply-lead")
async def submit_lead(lead: LeadCapture):
    lead_data = {
        "id": str(uuid.uuid4()),
        **lead.dict(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "new"
    }
    
    await leads_collection.insert_one(lead_data)
    lead_data.pop("_id", None)
    
    return {
        "message": "Application submitted successfully",
        "lead_id": lead_data["id"],
        "next_steps": "Our team will contact you within 24 hours"
    }

# Submit Review Endpoint
@api_router.post("/cards/{card_id}/reviews")
async def submit_review(card_id: str, review: ReviewSubmit):
    card_data = await cards_collection.find_one({"id": card_id})
    if not card_data:
        raise HTTPException(status_code=404, detail="Card not found")
    
    review_data = {
        "id": str(uuid.uuid4()),
        "card_id": card_id,
        "reviewer_name": review.reviewer_name,
        "reviewer_type": "user",
        "rating": review.rating,
        "title": review.title,
        "content": review.content,
        "category_ratings": review.category_ratings,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "helpful_count": 0,
        "verified_user": False
    }
    
    await reviews_collection.insert_one(review_data)
    review_data.pop("_id", None)
    
    return {"message": "Review submitted successfully", "review": review_data}

# Get Reviews for Card
@api_router.get("/cards/{card_id}/reviews")
async def get_card_reviews(card_id: str):
    reviews = []
    cursor = reviews_collection.find({"card_id": card_id}, {"_id": 0}).sort("created_at", -1)
    async for review in cursor:
        reviews.append(review)
    return reviews

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
    cards = await get_cards_from_db()
    banks = list(set([card["bank_name"] for card in cards]))
    return {"banks": sorted(banks)}

@api_router.get("/networks")
async def get_networks():
    cards = await get_cards_from_db()
    networks = list(set([card.get("card_network", "Visa") for card in cards]))
    return {"networks": sorted(networks)}

@api_router.get("/category-tags")
async def get_category_tags():
    cards = await get_cards_from_db()
    tags = set()
    for card in cards:
        for tag in card.get("category_tags", []):
            tags.add(tag)
    return {"tags": sorted(list(tags))}

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

# Seed database with initial cards on startup
@app.on_event("startup")
async def seed_database():
    count = await cards_collection.count_documents({})
    if count == 0:
        logger.info("Seeding database with initial credit cards...")
        for card in CREDIT_CARDS_DATABASE:
            await cards_collection.insert_one(card.copy())
        logger.info(f"Seeded {len(CREDIT_CARDS_DATABASE)} credit cards to MongoDB")
    else:
        logger.info(f"Database already contains {count} credit cards")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
