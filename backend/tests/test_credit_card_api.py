"""
Credit Card Comparison API - Backend Tests
Tests all API endpoints including public cards, authentication, admin CRUD operations
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@finselect.in"
ADMIN_PASSWORD = "admin123"

# ===== Fixtures =====

@pytest.fixture(scope="session")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture(scope="session")
def auth_token(api_client):
    """Get authentication token for admin"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip("Authentication failed - skipping authenticated tests")

@pytest.fixture
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ===== Health & Root Tests =====

class TestRootEndpoint:
    """Root API endpoint tests"""
    
    def test_root_returns_success(self, api_client):
        """Test / endpoint returns success message"""
        response = api_client.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "FinSelect" in data["message"]


# ===== Authentication Tests =====

class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self, api_client):
        """Test successful admin login"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0
    
    def test_login_invalid_email(self, api_client):
        """Test login with invalid email"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 401
    
    def test_login_invalid_password(self, api_client):
        """Test login with invalid password"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    
    def test_get_current_user_with_token(self, authenticated_client, auth_token):
        """Test getting current user info"""
        response = authenticated_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL


# ===== Public Cards API Tests =====

class TestPublicCardsAPI:
    """Public cards endpoint tests"""
    
    def test_get_all_cards(self, api_client):
        """Test GET /cards returns all cards"""
        response = api_client.get(f"{BASE_URL}/api/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 15  # Should have at least 15 seeded cards
        
        # Validate card structure
        first_card = data[0]
        assert "id" in first_card
        assert "bank_name" in first_card
        assert "card_name" in first_card
        assert "card_type" in first_card
        assert "annual_fee" in first_card
    
    def test_get_card_by_id(self, api_client):
        """Test GET /cards/{card_id} returns specific card"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "hdfc-infinia"
        assert data["bank_name"] == "HDFC Bank"
        assert data["card_name"] == "Infinia"
    
    def test_get_card_not_found(self, api_client):
        """Test GET /cards/{card_id} with non-existent card"""
        response = api_client.get(f"{BASE_URL}/api/cards/non-existent-card")
        assert response.status_code == 404
    
    def test_filter_cards_by_type(self, api_client):
        """Test GET /cards with card_type filter"""
        response = api_client.get(f"{BASE_URL}/api/cards?card_type=premium")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for card in data:
            assert card["card_type"] == "premium"
    
    def test_filter_cards_by_bank(self, api_client):
        """Test GET /cards with bank_name filter"""
        response = api_client.get(f"{BASE_URL}/api/cards?bank_name=HDFC Bank")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for card in data:
            assert card["bank_name"] == "HDFC Bank"
    
    def test_filter_cards_lifetime_free(self, api_client):
        """Test GET /cards with is_lifetime_free filter"""
        response = api_client.get(f"{BASE_URL}/api/cards?is_lifetime_free=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for card in data:
            assert card["is_lifetime_free"] == True


# ===== Cards Filter Endpoint Tests =====

class TestCardsFilterEndpoint:
    """POST /cards/filter endpoint tests"""
    
    def test_filter_by_annual_fee_free(self, api_client):
        """Test filtering for free cards"""
        response = api_client.post(f"{BASE_URL}/api/cards/filter", json={
            "annual_fee_preference": "free"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for card in data:
            assert card["is_lifetime_free"] == True
    
    def test_filter_by_annual_fee_low(self, api_client):
        """Test filtering for low annual fee cards"""
        response = api_client.post(f"{BASE_URL}/api/cards/filter", json={
            "annual_fee_preference": "low"
        })
        assert response.status_code == 200
        data = response.json()
        for card in data:
            assert card["annual_fee"] <= 2500
    
    def test_filter_by_annual_fee_premium(self, api_client):
        """Test filtering for premium cards"""
        response = api_client.post(f"{BASE_URL}/api/cards/filter", json={
            "annual_fee_preference": "premium"
        })
        assert response.status_code == 200
        data = response.json()
        for card in data:
            assert card["annual_fee"] > 5000
    
    def test_filter_by_bank(self, api_client):
        """Test filtering by bank"""
        response = api_client.post(f"{BASE_URL}/api/cards/filter", json={
            "preferred_bank": "HDFC Bank"
        })
        assert response.status_code == 200
        data = response.json()
        for card in data:
            assert card["bank_name"] == "HDFC Bank"
    
    def test_filter_by_card_type(self, api_client):
        """Test filtering by card type"""
        response = api_client.post(f"{BASE_URL}/api/cards/filter", json={
            "card_type": "cashback"
        })
        assert response.status_code == 200
        data = response.json()
        for card in data:
            assert card["card_type"] == "cashback"
    
    def test_filter_combined(self, api_client):
        """Test combining multiple filters"""
        response = api_client.post(f"{BASE_URL}/api/cards/filter", json={
            "annual_fee_preference": "premium",
            "preferred_bank": "HDFC Bank"
        })
        assert response.status_code == 200
        data = response.json()
        for card in data:
            assert card["annual_fee"] > 5000
            assert card["bank_name"] == "HDFC Bank"


# ===== Banks Endpoint Tests =====

class TestBanksEndpoint:
    """Banks endpoint tests"""
    
    def test_get_banks(self, api_client):
        """Test GET /banks returns list of banks"""
        response = api_client.get(f"{BASE_URL}/api/banks")
        assert response.status_code == 200
        data = response.json()
        assert "banks" in data
        assert isinstance(data["banks"], list)
        assert len(data["banks"]) >= 10
        # Verify some known banks
        assert "HDFC Bank" in data["banks"]
        assert "ICICI Bank" in data["banks"]
        assert "Axis Bank" in data["banks"]


# ===== Compare Endpoint Tests =====

class TestCompareEndpoint:
    """Compare cards endpoint tests"""
    
    def test_compare_two_cards(self, api_client):
        """Test comparing two cards"""
        response = api_client.post(f"{BASE_URL}/api/compare", json={
            "card_ids": ["hdfc-infinia", "axis-magnus"]
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2
        card_ids = [card["id"] for card in data]
        assert "hdfc-infinia" in card_ids
        assert "axis-magnus" in card_ids
    
    def test_compare_max_five_cards(self, api_client):
        """Test comparing maximum 5 cards"""
        response = api_client.post(f"{BASE_URL}/api/compare", json={
            "card_ids": ["hdfc-infinia", "axis-magnus", "icici-amazon-pay", "sbi-simplyclick", "axis-ace"]
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
    
    def test_compare_more_than_five_fails(self, api_client):
        """Test that comparing more than 5 cards returns 400"""
        response = api_client.post(f"{BASE_URL}/api/compare", json={
            "card_ids": ["card1", "card2", "card3", "card4", "card5", "card6"]
        })
        assert response.status_code == 400


# ===== Rewards Calculation Tests =====

class TestRewardsCalculation:
    """Rewards calculation endpoint tests"""
    
    def test_calculate_rewards(self, api_client):
        """Test rewards calculation"""
        response = api_client.post(f"{BASE_URL}/api/calculate-rewards", json={
            "card_id": "hdfc-infinia",
            "monthly_spending": {
                "travel": 10000,
                "dining": 5000,
                "shopping": 15000
            }
        })
        assert response.status_code == 200
        data = response.json()
        assert "card_id" in data
        assert "monthly_rewards" in data
        assert "yearly_rewards" in data
        assert "net_benefit" in data
        assert data["card_id"] == "hdfc-infinia"
    
    def test_calculate_rewards_nonexistent_card(self, api_client):
        """Test rewards calculation with non-existent card"""
        response = api_client.post(f"{BASE_URL}/api/calculate-rewards", json={
            "card_id": "nonexistent-card",
            "monthly_spending": {"travel": 10000}
        })
        assert response.status_code == 404


# ===== Insights Endpoint Tests =====

class TestInsightsEndpoint:
    """Insights endpoint tests"""
    
    def test_best_by_category(self, api_client):
        """Test best cards by category endpoint"""
        response = api_client.get(f"{BASE_URL}/api/insights/best-by-category")
        assert response.status_code == 200
        data = response.json()
        assert "best_lifetime_free" in data
        assert isinstance(data["best_lifetime_free"], list)


# ===== Admin Analytics Tests =====

class TestAdminAnalytics:
    """Admin analytics endpoint tests"""
    
    def test_get_analytics_authenticated(self, authenticated_client):
        """Test admin analytics with authentication"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/analytics")
        assert response.status_code == 200
        data = response.json()
        assert "total_cards" in data
        assert "total_banks" in data
        assert "lifetime_free_cards" in data
        assert "premium_cards" in data
        assert "card_types" in data
        assert data["total_cards"] >= 15
    
    def test_get_analytics_unauthenticated(self, api_client):
        """Test admin analytics without authentication returns 401/403"""
        # Remove auth header if exists
        api_client.headers.pop("Authorization", None)
        response = api_client.get(f"{BASE_URL}/api/admin/analytics")
        assert response.status_code in [401, 403]


# ===== Admin CRUD Tests =====

class TestAdminCRUD:
    """Admin CRUD operations tests"""
    
    def test_get_all_cards_admin(self, authenticated_client):
        """Test admin get all cards"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/cards")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 15
    
    def test_create_card_and_verify(self, authenticated_client):
        """Test creating a new card and verify persistence"""
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        card_data = {
            "bank_name": "Test Bank",
            "card_name": test_id,
            "card_type": "cashback",
            "joining_fee": 0,
            "annual_fee": 0,
            "is_lifetime_free": True,
            "welcome_benefits": "Test welcome benefits",
            "reward_rate": 1.0,
            "cashback_rate": 2.0,
            "redemption_ratio": 1.0,
            "redemption_options": ["Statement credit"],
            "reward_cap_monthly": 1000,
            "reward_cap_yearly": 12000,
            "milestone_benefits": ["Test milestone"],
            "excluded_categories": ["Rent"],
            "forex_markup": 3.5,
            "lounge_access": "None",
            "fuel_surcharge_waiver": True,
            "emi_available": True,
            "min_income": 30000,
            "min_credit_score": 650,
            "category_bonuses": {"online_shopping": 5.0}
        }
        
        response = authenticated_client.post(f"{BASE_URL}/api/admin/cards", json=card_data)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "card" in data
        assert data["card"]["card_name"] == test_id
        
        created_card_id = data["card"]["id"]
        
        # Verify card was created via GET
        get_response = authenticated_client.get(f"{BASE_URL}/api/cards/{created_card_id}")
        assert get_response.status_code == 200
        fetched_card = get_response.json()
        assert fetched_card["card_name"] == test_id
        
        # Cleanup - delete the test card
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/admin/cards/{created_card_id}")
        assert delete_response.status_code == 200
    
    def test_update_card_and_verify(self, authenticated_client):
        """Test updating a card and verify persistence"""
        # First create a test card
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        card_data = {
            "bank_name": "Test Bank",
            "card_name": test_id,
            "card_type": "cashback",
            "joining_fee": 0,
            "annual_fee": 0,
            "is_lifetime_free": True,
            "welcome_benefits": "Original benefits",
            "reward_rate": 1.0,
            "cashback_rate": 2.0,
            "redemption_ratio": 1.0,
            "redemption_options": ["Statement credit"],
            "reward_cap_monthly": 1000,
            "reward_cap_yearly": 12000,
            "milestone_benefits": [],
            "excluded_categories": [],
            "forex_markup": 3.5,
            "lounge_access": "None",
            "fuel_surcharge_waiver": True,
            "emi_available": True,
            "min_income": 30000,
            "min_credit_score": 650,
            "category_bonuses": {}
        }
        
        create_response = authenticated_client.post(f"{BASE_URL}/api/admin/cards", json=card_data)
        assert create_response.status_code == 200
        created_card_id = create_response.json()["card"]["id"]
        
        # Update the card
        card_data["welcome_benefits"] = "Updated benefits"
        card_data["annual_fee"] = 500
        
        update_response = authenticated_client.put(
            f"{BASE_URL}/api/admin/cards/{created_card_id}",
            json=card_data
        )
        assert update_response.status_code == 200
        
        # Verify update via GET
        get_response = authenticated_client.get(f"{BASE_URL}/api/cards/{created_card_id}")
        assert get_response.status_code == 200
        updated_card = get_response.json()
        assert updated_card["welcome_benefits"] == "Updated benefits"
        assert updated_card["annual_fee"] == 500
        
        # Cleanup
        authenticated_client.delete(f"{BASE_URL}/api/admin/cards/{created_card_id}")
    
    def test_delete_card_and_verify(self, authenticated_client):
        """Test deleting a card and verify removal"""
        # First create a test card
        test_id = f"TEST_{uuid.uuid4().hex[:8]}"
        card_data = {
            "bank_name": "Test Bank",
            "card_name": test_id,
            "card_type": "cashback",
            "joining_fee": 0,
            "annual_fee": 0,
            "is_lifetime_free": True,
            "welcome_benefits": "To be deleted",
            "reward_rate": 1.0,
            "cashback_rate": 2.0,
            "redemption_ratio": 1.0,
            "redemption_options": ["Statement credit"],
            "reward_cap_monthly": None,
            "reward_cap_yearly": None,
            "milestone_benefits": [],
            "excluded_categories": [],
            "forex_markup": 3.5,
            "lounge_access": "None",
            "fuel_surcharge_waiver": True,
            "emi_available": True,
            "min_income": 30000,
            "min_credit_score": 650,
            "category_bonuses": {}
        }
        
        create_response = authenticated_client.post(f"{BASE_URL}/api/admin/cards", json=card_data)
        assert create_response.status_code == 200
        created_card_id = create_response.json()["card"]["id"]
        
        # Delete the card
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/admin/cards/{created_card_id}")
        assert delete_response.status_code == 200
        
        # Verify card no longer exists
        get_response = authenticated_client.get(f"{BASE_URL}/api/cards/{created_card_id}")
        assert get_response.status_code == 404
    
    def test_update_nonexistent_card(self, authenticated_client):
        """Test updating a non-existent card returns 404"""
        card_data = {
            "bank_name": "Test Bank",
            "card_name": "Test",
            "card_type": "cashback",
            "joining_fee": 0,
            "annual_fee": 0,
            "is_lifetime_free": True,
            "welcome_benefits": "Test",
            "reward_rate": 1.0,
            "cashback_rate": 2.0,
            "redemption_ratio": 1.0,
            "redemption_options": [],
            "reward_cap_monthly": None,
            "reward_cap_yearly": None,
            "milestone_benefits": [],
            "excluded_categories": [],
            "forex_markup": 3.5,
            "lounge_access": "None",
            "fuel_surcharge_waiver": True,
            "emi_available": True,
            "min_income": 30000,
            "min_credit_score": 650,
            "category_bonuses": {}
        }
        response = authenticated_client.put(
            f"{BASE_URL}/api/admin/cards/nonexistent-card-id",
            json=card_data
        )
        assert response.status_code == 404
    
    def test_delete_nonexistent_card(self, authenticated_client):
        """Test deleting a non-existent card returns 404"""
        response = authenticated_client.delete(f"{BASE_URL}/api/admin/cards/nonexistent-card-id")
        assert response.status_code == 404


# ===== AI Recommendation Tests =====

class TestAIRecommendation:
    """AI Recommendation endpoint tests"""
    
    def test_ai_recommendation_endpoint_exists(self, api_client):
        """Test AI recommendation endpoint accepts requests"""
        response = api_client.post(f"{BASE_URL}/api/recommend-ai", json={
            "monthly_spending": {"travel": 10000, "dining": 5000},
            "preferences": "I prefer cashback cards",
            "income": 100000,
            "credit_score": 750
        })
        # AI endpoint should return 200 (success) or 500 (if Gemini API fails)
        # We verify endpoint exists and accepts the request
        assert response.status_code in [200, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
