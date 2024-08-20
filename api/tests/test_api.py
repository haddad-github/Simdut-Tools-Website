import sys
import os
import pytest

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from api.app import app as flask_app

@pytest.fixture
def app():
    """
    Return the app instance
    """
    return flask_app

@pytest.fixture
def client(app):
    """
    Returns test client
    :param app: App instance
    """
    return app.test_client()

def test_get_all_products(client):
    """
    Test the /products/all route to ensure it returns a 200 status code and the correct structure of products data.
    """
    response = client.get("/products/all")

    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_product_search(client):
    """
    Test the /products/search route with query parameters
    """
    response = client.get("/products/search?nomfrancais=Abate")

    assert response.status_code == 200
    assert any("Abate" in product["nomfrancais"] for product in response.json)

def test_get_all_classifications(client):
    """
    Test the /classifications/all route to ensure it returns a 200 status code and the correct structure of classification data as a list
    """
    response = client.get("/classifications/all")

    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_get_all_product_classifications(client):
    """
    Test the /product_classifications/all route to ensure it returns a 200 status code and the correct structure of product-classification linkage data as a list
    """
    response = client.get("/product_classifications/all")

    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_search_by_cas(client):
    """
    Test the /products/search route using a CAS number as a filter
    This test ensures that the response contains the specific product with the given CAS number
    """
    cas_number = '3383-96-8'
    response = client.get(f"/products/search?cas={cas_number}")

    assert response.status_code == 200
    assert any(product['cas'] == cas_number for product in response.json)

def test_search_with_date_filter(client):
    """
    Test the /products/search route with start and end date filters
    This test verifies that the response contains products whose dates fall within the specified range
    """
    response = client.get("/products/search?start_date=2020-01-01&end_date=2020-12-31")

    assert response.status_code == 200
    assert all('2020-01-01' <= product['date'] <= '2020-12-31' for product in response.json)

def test_get_last_updated_products(client):
    """
    Test the /products/last_updated route to ensure it returns a 200 status code
    and the products are ordered by their update date in descending order, with the latest updated product first
    """
    response = client.get("/products/last_updated")

    assert response.status_code == 200
    dates = [product['date'] for product in response.json]
    assert dates == sorted(dates, reverse=True)

if __name__ == "__main__":
    pytest.main()
