import os
import sys
import pytest
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app import app as flask_app

@pytest.fixture
def app():
    """
    Return the Flask app instance
    """
    return flask_app


@pytest.fixture
def client(app):
    """
    Returns a test client for the Flask app
    :param app: Flask app instance
    """
    return app.test_client()


def test_register_user(client):
    """
    Test registering a new user
    """
    data = {
        "username": "test123",
        "password": "rAndoMpassWord!123",
        "email": "testrandom21@hotmail.com"
    }

    response = client.post("/register", json=data)

    assert response.status_code == 201


def test_change_password(client):
    """
    Test changing a user's password
    """
    data = {
        "user_id": 1,
        "current_password": "oldPassword!123",
        "new_password": "newSecurePassword!456",
        "confirm_password": "newSecurePassword!456"
    }

    response = client.post("/user/change_password", json=data)

    assert response.status_code == 200


def test_update_email(client):
    """
    Test updating a user's email address
    """
    data = {
        "user_id": 1,
        "new_email": "newemail@example.com"
    }

    response = client.post("/user/update_email", json=data)

    assert response.status_code == 200


def test_request_password_reset(client):
    """
    Test requesting a password reset link
    """
    data = {
        "email": "user@example.com"
    }

    response = client.post("/request_password_reset", json=data)

    assert response.status_code == 200


def test_get_user_details(client):
    """
    Test retrieving user details
    """
    response = client.get("/user/details/1")

    assert response.status_code == 200

    expected_details = {
        'username': 'testuser',
        'email': 'testuser@example.com'
    }
    assert response.json == expected_details


def test_login_user(client):
    """
    Test authenticating a user
    """
    data = {
        "username": "testuser",
        "password": "whaTevEr123!"
    }

    response = client.post("/login", json=data)

    assert response.status_code == 200

    assert response.json['message'] == 'Login successful'
    assert 'token' in response.json
    assert 'userId' in response.json


def test_delete_list(client):
    """
    Test deleting a list
    """
    response = client.delete("/lists/1/delete")

    assert response.status_code == 200


def test_logout_user(client):
    """
    Test logging out a user
    """
    data = {
        "session_id": "abc123xyz"
    }

    response = client.post("/logout", json=data)

    assert response.status_code == 200


def test_track_search(client):
    """
    Test recording a user's search activity
    """
    data = {
        "search_query": "abate",
        "user_id": 1
    }

    response = client.post("/track_search", json=data)

    assert response.status_code == 201


def test_create_list(client):
    """
    Test creating a new product list
    """
    data = {
        "name": "My Favorite Chemicals",
        "user_id": 1
    }

    response = client.post("/create_list", json=data)

    assert response.status_code == 201


def test_add_product_to_list(client):
    """
    Test adding a product to a user's product list
    """
    data = {
        "productId": "12345"
    }

    response = client.post("/lists/1/add_product", json=data)

    assert response.status_code == 200

def test_remove_product_from_list(client):
    """
    Test the /lists/<list_id>/remove_product/<product_id> route with DELETE method
    """
    list_id = 101
    product_id = "abate"
    response = client.delete(f"/lists/{list_id}/remove_product/{product_id}")

    assert response.status_code == 200
    assert response.json['message'] == "Product removed from list successfully"

def test_get_list_items(client):
    """
    Test the /lists/<list_id>/items route to ensure it returns a 200 status code and the correct structure of list items data.
    """
    list_id = 101
    response = client.get(f"/lists/{list_id}/items")

    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_search_history(client):
    """
    Test the /user/<user_id>/search_history route to ensure it returns a 200 status code and the correct structure of search history data.
    """
    user_id = 1
    response = client.get(f"/user/{user_id}/search_history")

    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_user_lists(client):
    """
    Test the /user/<user_id>/lists route to ensure it returns a 200 status code and the correct structure of user lists data.
    """
    user_id = 1
    response = client.get(f"/user/{user_id}/lists")

    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_users_online(client):
    """
    Test the /users_online route to ensure it returns a 200 status code and the correct structure of online users data.
    """
    response = client.get("/users_online")

    assert response.status_code == 200
    assert 'users_online' in response.json

def test_total_users(client):
    """
    Test the /total_users route to ensure it returns a 200 status code and the correct structure of total users data.
    """
    response = client.get("/total_users")

    assert response.status_code == 200
    assert 'total_users' in response.json

def test_total_products_searched(client):
    """
    Test the /total_products_searched route to ensure it returns a 200 status code and the correct structure of total products searched data.
    """
    response = client.get("/total_products_searched")

    assert response.status_code == 200
    assert 'total_products_searched' in response.json

def test_most_searched(client):
    """
    Test the /most_searched route to ensure it returns a 200 status code and the correct structure of most searched query data.
    """
    response = client.get("/most_searched")

    assert response.status_code == 200
    assert 'query' in response.json
    assert 'count' in response.json

def test_total_lists_created(client):
    """
    Test the /total_lists_created route to ensure it returns a 200 status code and the correct structure of total lists created data.
    """
    response = client.get("/total_lists_created")

    assert response.status_code == 200
    assert 'total_lists_created' in response.json

if __name__ == "__main__":
    pytest.main()