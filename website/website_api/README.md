## Website API

### Database Models
`database_models.py` contains the database model setup for AlchemySQL

#### Issues encountered and solutions
Problem: 

```from ._bcrypt import (ImportError: DLL load failed while importing _bcrypt: The specified procedure could not be found.```

Solution: 

`pip install bcrypt==3.2`

### Routes
`/register`: registers user

`/user/change_password`: change a user's password

`/user/update_email`: update a user's email address

`/request_password_reset`: request a password reset link through email

`/user/details/<int:user_id>`: retrieve the details of a specific user based on his ID

`/login`: authenticate user and login

`/lists/<int:list_id>/delete` (**TOKEN REQUIRED**): delete a specific list based on its ID

`/logout`: logs out user

`/track_search`: record a user's search activity

`/create_list`: create a new product list for a user

`/lists/<int:list_id>/add_product`: add a product to a user's product list based on its ID

`/lists/<int:list_id>/remove_product/<string:product_id>`: remove a product from a list based on its ID and the list's ID

`/lists/<int:list_id>/items`: fetch and display products in a specified list based on its ID, with options to download as CSV, XLSX, or PDF

`/user/<int:user_id>/search_history` [**DEPRECATED**]: fetch a user's search history based on his ID

`/user/<int:user_id>/lists`: retrieve all product lists created by a specific user based on his ID

`/users_online` [**DEPRECATED**]: get the count of users currently online (logged out and logged in)

`/total_users`: get the total count of registered users

`/total_products_searched`: get the total number of product searches made

`/most_searched`: retrieve the most frequently searched query

`/total_lists_created`: get the total number of product lists created by users

### SQL Injection
SQLAlchemy (wrapper for SQL queries) will be used

### Swagger integration

For Swagger integration, `Flask-Swagger` and `Flask-Swagger-UI` are used, directly integrated into `app.py`

In `app.py`, the routes require a YAML-style route docstrings (meaning the description in the text below every route function).

An alternative to docstrings can be to use `.yaml` and load them in.

Access the specs with the route: `/spec`

Access Swagger-UI with the route: `/swagger`

### Tests

`pytest` is used in `test_api.py` in the `tests/` folder

Running `tests` in the `tests/` directory is enough, otherwise simply run `python test_api.py`

### How To

1. run `python app.py`
<br></br>
2. Access Swagger-UI with: `/swagger`
<br></br>
3. Access Swagger specifications with: `/spec`
