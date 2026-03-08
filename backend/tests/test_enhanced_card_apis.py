"""
Enhanced Credit Card Detail APIs - Backend Tests
Tests for new features: Eligibility Check, Lead Capture, Reviews
These endpoints support the 16-section card detail pages
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


# ===== Eligibility Check API Tests =====

class TestEligibilityCheckAPI:
    """Tests for /api/check-eligibility endpoint"""
    
    def test_eligibility_check_eligible_user(self, api_client):
        """Test eligibility check with eligible parameters"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 30,
            "annual_income": 4000000,
            "employment_type": "salaried",
            "credit_score": 780,
            "card_id": "hdfc-infinia"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "card_id" in data
        assert "card_name" in data
        assert "is_eligible" in data
        assert "issues" in data
        assert "requirements" in data
        
        # Verify eligibility
        assert data["card_id"] == "hdfc-infinia"
        assert data["is_eligible"] == True
        assert len(data["issues"]) == 0
        
        # Verify requirements returned
        assert "min_age" in data["requirements"]
        assert "max_age" in data["requirements"]
        assert "min_annual_income" in data["requirements"]
        assert "min_credit_score" in data["requirements"]
    
    def test_eligibility_check_ineligible_age_too_young(self, api_client):
        """Test eligibility check with user too young"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 18,
            "annual_income": 4000000,
            "employment_type": "salaried",
            "credit_score": 780,
            "card_id": "hdfc-infinia"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_eligible"] == False
        assert len(data["issues"]) > 0
        assert any("age" in issue.lower() for issue in data["issues"])
    
    def test_eligibility_check_ineligible_low_income(self, api_client):
        """Test eligibility check with low income"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 30,
            "annual_income": 500000,  # Below HDFC Infinia requirements
            "employment_type": "salaried",
            "credit_score": 780,
            "card_id": "hdfc-infinia"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_eligible"] == False
        assert len(data["issues"]) > 0
        assert any("income" in issue.lower() for issue in data["issues"])
    
    def test_eligibility_check_ineligible_low_credit_score(self, api_client):
        """Test eligibility check with low credit score"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 30,
            "annual_income": 4000000,
            "employment_type": "salaried",
            "credit_score": 600,  # Below requirement
            "card_id": "hdfc-infinia"
        })
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_eligible"] == False
        assert len(data["issues"]) > 0
        assert any("credit" in issue.lower() for issue in data["issues"])
    
    def test_eligibility_check_nonexistent_card(self, api_client):
        """Test eligibility check with non-existent card"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 30,
            "annual_income": 4000000,
            "employment_type": "salaried",
            "credit_score": 780,
            "card_id": "nonexistent-card"
        })
        assert response.status_code == 404
    
    def test_eligibility_check_without_credit_score(self, api_client):
        """Test eligibility check without optional credit score"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 30,
            "annual_income": 4000000,
            "employment_type": "salaried",
            "card_id": "hdfc-infinia"
        })
        assert response.status_code == 200
        data = response.json()
        assert "is_eligible" in data
    
    def test_eligibility_check_lifetime_free_card(self, api_client):
        """Test eligibility check for lifetime free card with lower requirements"""
        response = api_client.post(f"{BASE_URL}/api/check-eligibility", json={
            "age": 25,
            "annual_income": 400000,
            "employment_type": "salaried",
            "credit_score": 680,
            "card_id": "icici-amazon-pay"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["is_eligible"] == True


# ===== Lead Capture API Tests =====

class TestLeadCaptureAPI:
    """Tests for /api/apply-lead endpoint"""
    
    def test_submit_lead_success(self, api_client):
        """Test successful lead submission"""
        test_mobile = f"98765{str(uuid.uuid4().int)[:5]}"
        response = api_client.post(f"{BASE_URL}/api/apply-lead", json={
            "card_id": "hdfc-infinia",
            "card_name": "Infinia",
            "bank_name": "HDFC Bank",
            "user_name": "TEST_LeadUser",
            "mobile_number": test_mobile,
            "email": "test.lead@example.com",
            "annual_income": 4000000,
            "employment_type": "salaried",
            "created_at": "2026-01-15T10:00:00Z"
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "message" in data
        assert "lead_id" in data
        assert "next_steps" in data
        
        assert "submitted" in data["message"].lower() or "success" in data["message"].lower()
        assert len(data["lead_id"]) > 0
    
    def test_submit_lead_minimal_data(self, api_client):
        """Test lead submission with minimal required data"""
        test_mobile = f"98765{str(uuid.uuid4().int)[:5]}"
        response = api_client.post(f"{BASE_URL}/api/apply-lead", json={
            "card_id": "axis-magnus",
            "card_name": "Magnus",
            "bank_name": "Axis Bank",
            "mobile_number": test_mobile,
            "created_at": "2026-01-15T10:00:00Z"
        })
        assert response.status_code == 200
        data = response.json()
        assert "lead_id" in data


# ===== Reviews API Tests =====

class TestReviewsAPI:
    """Tests for /api/cards/{id}/reviews endpoints"""
    
    def test_submit_review_success(self, api_client):
        """Test successful review submission"""
        response = api_client.post(f"{BASE_URL}/api/cards/hdfc-infinia/reviews", json={
            "card_id": "hdfc-infinia",
            "reviewer_name": "TEST_ReviewerSubmit",
            "rating": 4.5,
            "title": "Excellent premium card",
            "content": "Great rewards and lounge access. Worth the annual fee for frequent travelers."
        })
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "message" in data
        assert "review" in data
        
        review = data["review"]
        assert review["card_id"] == "hdfc-infinia"
        assert review["reviewer_name"] == "TEST_ReviewerSubmit"
        assert review["rating"] == 4.5
        assert review["title"] == "Excellent premium card"
        assert review["reviewer_type"] == "user"
        assert "id" in review
        assert "created_at" in review
    
    def test_submit_review_with_category_ratings(self, api_client):
        """Test review submission with category ratings"""
        response = api_client.post(f"{BASE_URL}/api/cards/axis-magnus/reviews", json={
            "card_id": "axis-magnus",
            "reviewer_name": "TEST_CategoryReviewer",
            "rating": 5.0,
            "title": "Best rewards card",
            "content": "12% value back is unmatched",
            "category_ratings": {
                "rewards": 5.0,
                "travel": 4.5,
                "fees": 3.5
            }
        })
        assert response.status_code == 200
        data = response.json()
        
        review = data["review"]
        assert "category_ratings" in review
        assert review["category_ratings"]["rewards"] == 5.0
    
    def test_get_reviews_for_card(self, api_client):
        """Test getting reviews for a card"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia/reviews")
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        # Should have at least one review from our test
        if len(data) > 0:
            review = data[0]
            assert "card_id" in review
            assert "reviewer_name" in review
            assert "rating" in review
    
    def test_get_reviews_empty_card(self, api_client):
        """Test getting reviews for card with no reviews"""
        response = api_client.get(f"{BASE_URL}/api/cards/federal-celesta/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_submit_review_nonexistent_card(self, api_client):
        """Test submitting review for non-existent card"""
        response = api_client.post(f"{BASE_URL}/api/cards/nonexistent-card/reviews", json={
            "card_id": "nonexistent-card",
            "reviewer_name": "TEST_User",
            "rating": 4.0,
            "title": "Test",
            "content": "Test content"
        })
        assert response.status_code == 404


# ===== Extended Card Data Tests =====

class TestExtendedCardData:
    """Tests to verify all 16 sections of card data are available"""
    
    def test_card_has_quick_highlights(self, api_client):
        """Test card has quick highlights section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # Quick Highlights fields
        assert "joining_fee" in data
        assert "annual_fee" in data
        assert "value_back_percent" in data or "reward_rate" in data
        assert "lounge_access_summary" in data or "lounge_access" in data
        assert "forex_markup" in data
        assert "welcome_bonus_summary" in data
    
    def test_card_has_about_section(self, api_client):
        """Test card has about section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # About section fields
        assert "card_description" in data
        assert "best_suited_for" in data
        assert "key_benefits" in data
    
    def test_card_has_rewards_program(self, api_client):
        """Test card has rewards program section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # Rewards program fields
        assert "reward_earning" in data
        assert "category_bonuses" in data
        assert "redemption_options" in data
    
    def test_card_has_travel_benefits(self, api_client):
        """Test card has travel benefits section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # Travel benefits fields
        assert "travel_benefits" in data
        assert "lounge_access" in data
        assert "fuel_surcharge_waiver" in data
    
    def test_card_has_eligibility_criteria(self, api_client):
        """Test card has eligibility section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # Eligibility fields
        assert "min_income" in data
        assert "min_credit_score" in data
        assert "eligibility_criteria" in data
    
    def test_card_has_pros_cons(self, api_client):
        """Test card has pros and cons section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # Pros and cons fields
        assert "pros" in data
        assert "cons" in data
        assert isinstance(data["pros"], list)
        assert isinstance(data["cons"], list)
    
    def test_card_has_similar_cards(self, api_client):
        """Test card has similar cards section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        assert "similar_cards" in data
        assert isinstance(data["similar_cards"], list)
    
    def test_card_has_faqs(self, api_client):
        """Test card has FAQs section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        assert "faqs" in data
        assert isinstance(data["faqs"], list)
        if len(data["faqs"]) > 0:
            faq = data["faqs"][0]
            assert "question" in faq
            assert "answer" in faq
    
    def test_card_has_apply_links(self, api_client):
        """Test card has apply links section data"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        # At least one apply link should exist
        assert "affiliate_link" in data or "bank_apply_link" in data
    
    def test_card_has_reviews_data(self, api_client):
        """Test card includes user reviews"""
        response = api_client.get(f"{BASE_URL}/api/cards/hdfc-infinia")
        assert response.status_code == 200
        data = response.json()
        
        assert "user_reviews" in data
        assert isinstance(data["user_reviews"], list)


# ===== Admin Leads & Reviews Tests =====

class TestAdminLeadsReviews:
    """Tests for admin leads and reviews management"""
    
    def test_admin_get_leads(self, authenticated_client):
        """Test admin can get all leads"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/leads")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_get_reviews(self, authenticated_client):
        """Test admin can get all reviews"""
        response = authenticated_client.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


# ===== Networks and Category Tags Tests =====

class TestMetadataEndpoints:
    """Tests for metadata endpoints"""
    
    def test_get_networks(self, api_client):
        """Test GET /networks returns card networks"""
        response = api_client.get(f"{BASE_URL}/api/networks")
        assert response.status_code == 200
        data = response.json()
        assert "networks" in data
        assert isinstance(data["networks"], list)
        # Should include Visa, Mastercard, Amex
        networks = data["networks"]
        assert "Visa" in networks
    
    def test_get_category_tags(self, api_client):
        """Test GET /category-tags returns all category tags"""
        response = api_client.get(f"{BASE_URL}/api/category-tags")
        assert response.status_code == 200
        data = response.json()
        assert "tags" in data
        assert isinstance(data["tags"], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
