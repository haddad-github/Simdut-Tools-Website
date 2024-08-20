import os
import jwt
import csv
import boto3
import pdfkit
import bcrypt
import requests
import datetime
from functools import wraps
from flask_cors import CORS
from openpyxl import Workbook
from datetime import timedelta
from io import StringIO, BytesIO
from flask_swagger import swagger
from botocore.exceptions import ClientError
from itsdangerous import URLSafeTimedSerializer
from flask_swagger_ui import get_swaggerui_blueprint
from flask import Flask, request, jsonify, make_response, render_template
from database_models import database, User, SearchActivity, ProductList, ListItem, UserSession

###DATABASE###
#Initialize app
app = Flask(__name__)
CORS(app)

#Database variables
DATABASE = {
    'source': os.getenv('SOURCE'),
    'username': os.getenv('USERNAME'),
    'password': os.getenv('PASSWORD'),
    'host': os.getenv('HOST', 'localhost'),
    'port': os.getenv('PORT'),
    'db_name': os.getenv('DB_NAME')
}

#app secret key
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')

#Connect to database
app.config['SQLALCHEMY_DATABASE_URI'] = f"{DATABASE['source']}://{DATABASE['username']}:{DATABASE['password']}@{DATABASE['host']}:{DATABASE['port']}/{DATABASE['db_name']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Bind the SQLAlchemy instance to the Flask app
database.init_app(app)

#Create the database tables based on your models
with app.app_context():
    database.create_all()

#AWS SES configuration
AWS_REGION = os.getenv('AWS_REGION')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')

#Initialize Serializer
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

###Authentication Token###
def token_required(f):
    """
    Protects route that require user authentication

    :param f: function that'll use tokens
    """
    #@wraps preserves the information of the original function
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        #Extract token from the Authorization header
        if 'Authorization' in request.headers:
            #Format: `Bearer <token>`, thereby splitting the space and taking the 2nd element to grab the token
            token = request.headers['Authorization'].split(" ")[1]

        #If token is missing
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            #Decode the token to grab the user assigned to the token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

### ROUTES ###
@app.route('/register', methods=['POST'])
def register_user():
    """
    Register a new user.
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: body
        schema:
          id: User
          required:
            - username
            - password
          properties:
            username:
              type: string
              description: The user's username.
            password:
              type: string
              description: The user's password.
            email:
              type: string
              description: The user's email.
          example:
              {
                "username": "test123",
                "password": "rAndoMpassWord!123",
                "email": "testrandom21@hotmail.com"
              }
    responses:
      201:
        description: User successfully registered
      400:
        description: Missing username, password or email
      409:
        description: Username or email already exists
    """
    #Receive data that includes username, password and email
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    #Check if all 3 values are non-empty
    if not all([username, password, email]):
        return jsonify({'message': 'Missing username, password, or email'}), 400

    #Check if username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 409

    #Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already used'}), 409

    #Hash the user's password before storing it
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    #Initialize new user
    new_user = User(username=username, password_hash=hashed_password.decode('utf-8'), email=email)

    #Add new user to database
    database.session.add(new_user)
    database.session.commit()

    return jsonify({'message': 'User successfully registered'}), 201

@app.route('/user/change_password', methods=['POST'])
def change_password():
    """
    Change a user's password.
    ---
    tags:
      - Authentication
    description: Allows a user to update their password after verifying the current password.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - user_id
            - current_password
            - new_password
            - confirm_password
          properties:
            user_id:
              type: integer
              description: The unique identifier of the user.
            current_password:
              type: string
              description: The current password of the user for verification.
            new_password:
              type: string
              description: The new password the user wishes to set.
            confirm_password:
              type: string
              description: A repeat of the new password for confirmation purposes.
          example:
            user_id: 1
            current_password: "oldPassword!123"
            new_password: "newSecurePassword!456"
            confirm_password: "newSecurePassword!456"
    responses:
      200:
        description: Password updated successfully.
      400:
        description: New passwords do not match.
      401:
        description: Current password is incorrect or unauthorized action.
      404:
        description: User not found.
    """
    #Get user's ID and inputted information
    user_id = request.json.get('user_id')
    current_password = request.json.get('current_password')
    new_password = request.json.get('new_password')
    confirm_password = request.json.get('confirm_password')

    #Check if new pass matches confirmation
    if new_password != confirm_password:
        return jsonify({'message': 'New passwords do not match'}), 400

    #Fetch user, check password
    user = User.query.get(user_id)
    if user and bcrypt.checkpw(current_password.encode('utf-8'), user.password_hash.encode('utf-8')):
        #Create new hashing for the new password and update it to the database
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        user.password_hash = hashed_password.decode('utf-8')
        database.session.commit()
        return jsonify({'message': 'Password updated successfully'}), 200
    else:
        return jsonify({'message': 'Current password is incorrect'}), 401

@app.route('/user/update_email', methods=['POST'])
def update_email():
    """
    Update a user's email address.
    ---
    tags:
      - User Management
    description: Allows a user to update their registered email address.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - user_id
            - new_email
          properties:
            user_id:
              type: integer
              description: The unique identifier of the user.
            new_email:
              type: string
              description: The new email address to be associated with the user.
          example:
            user_id: 1
            new_email: "newemail@example.com"
    responses:
      200:
        description: Email updated successfully.
      404:
        description: User not found.
    """
    #Get user's id and email
    user_id = request.json.get('user_id')
    new_email = request.json.get('new_email')

    #Fetch user, update email and push change to database
    user = User.query.get(user_id)
    if user:
        user.email = new_email
        database.session.commit()
        return jsonify({'message': 'Email updated successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404


@app.route('/request_password_reset', methods=['POST'])
def request_password_reset():
    """
    Request a password reset link.
    ---
    tags:
      - Authentication
    description: Sends a password reset email to the user if the email is registered in the system.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - captcha_response
          properties:
            email:
              type: string
              description: The email address associated with the user account.
            captcha_response:
              type: string
              description: The reCAPTCHA response token.
          example:
            email: "user@example.com"
            captcha_response: "some-recaptcha-response-token"
    responses:
      200:
        description: Password reset email sent successfully.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Email sent successfully"
            MessageId:
              type: string
              description: AWS SES message ID for the email sent.
      404:
        description: Email address not found in the database.
      500:
        description: Failed to send the email due to server error.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Failed to send email"
            error:
              type: string
              description: Error message from the email service.
    """
    email = request.json.get('email')
    captcha_response = request.json.get('captcha_response')

    #Verify reCAPTCHA
    recaptcha_secret = os.getenv('RECAPTCHA_SECRET_KEY')
    recaptcha_verification_response = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        data={'secret': recaptcha_secret, 'response': captcha_response}
    )
    recaptcha_verification_result = recaptcha_verification_response.json()

    if not recaptcha_verification_result.get('success'):
        return jsonify({'message': 'reCAPTCHA verification failed'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'message': 'Email address not found'}), 404

    token = serializer.dumps(email, salt='password-reset-salt')
    user.password_reset_token = token
    user.password_reset_expiration = datetime.datetime.utcnow() + timedelta(hours=24)
    database.session.commit()

    reset_link = f"https://www.simduttools.com/reset_password/{token}"

    ses_client = boto3.client(
        'ses',
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    )

    try:
        response = ses_client.send_email(
            Source='contact@simduttools.com',
            Destination={'ToAddresses': [email]},
            Message={
                'Subject': {'Data': 'Password Reset Request'},
                'Body': {
                    'Text': {'Data': f'Please click on the link to reset your password: {reset_link}'}
                }
            }
        )
        return jsonify({'message': 'Email sent successfully', 'MessageId': response['MessageId']}), 200
    except ClientError as e:
        app.logger.error(f"Failed to send email: {str(e)}")
        return jsonify({'message': 'Failed to send email', 'error': str(e)}), 500


@app.route('/reset_password', methods=['POST'])
def reset_password():
    """
    Reset user password using the provided token.
    ---
    tags:
      - Authentication
    description: Resets the user password using the provided token and new password.
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - token
            - new_password
          properties:
            token:
              type: string
              description: The token received in the password reset email.
            new_password:
              type: string
              description: The new password to set for the user.
          example:
            token: "some-token"
            new_password: "newpassword123"
    responses:
      200:
        description: Password reset successfully.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Password reset successfully"
      400:
        description: Invalid or expired token.
      500:
        description: Failed to reset the password due to server error.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Failed to reset password"
            error:
              type: string
              description: Error message from the server.
    """
    #Get token and password
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    try:
        email = serializer.loads(token, salt='password-reset-salt', max_age=86400)
    except:
        return jsonify({'message': 'Invalid or expired token'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found'}), 404

    hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    user.password_hash = hashed_password.decode('utf-8')
    user.password_reset_token = None
    user.password_reset_expiration = None
    database.session.commit()

    return jsonify({'message': 'Password reset successfully'}), 200


@app.route('/user/details/<int:user_id>', methods=['GET'])
@token_required
def get_user_details(current_user, user_id):
    """
    Retrieve the details of a specific user.
    ---
    tags:
      - User Management
    description: Fetches the details of the user specified by the user ID, but only if the requestor's token matches the user ID.
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: The unique identifier of the user.
    responses:
      200:
        description: User details retrieved successfully.
        schema:
          type: object
          properties:
            username:
              type: string
              description: The username of the user.
            email:
              type: string
              description: The email address of the user.
          example:
            username: "testuser"
            email: "testuser@example.com"
      403:
        description: Unauthorized to access this resource.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Unauthorized to access this resource"
      404:
        description: User not found in the database.
        schema:
          type: object
          properties:
            message:
              type: string
              example: "User not found"
    security:
      - Bearer: []
    """
    #Check if current logged user, as to not access others' details
    if not current_user.id == user_id:
        return jsonify({'message': 'Unauthorized to access this resource'}), 403

    #Fetch user
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    #Get details
    user_details = {
        'username': user.username,
        'email': user.email
    }
    return jsonify(user_details), 200

@app.route('/login', methods=['POST'])
def login_user():
    """
    Authenticate a user
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: user_credentials
        description: The user's login credentials
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
              example: testuser
            password:
              type: string
              example: whaTevEr123!
    responses:
      200:
        description: Login was successful
        schema:
          type: object
          properties:
            message:
              type: string
              example: Login successful
      400:
        description: Username or password not provided
        schema:
          type: object
          properties:
            message:
              type: string
              example: Missing username or password
      401:
        description: Invalid login credentials were provided
        schema:
          type: object
          properties:
            message:
              type: string
              example: Invalid username or password
    """
    #Receive request, extract username & password
    data = request.json
    username = data.get('username')
    password = data.get('password')

    #If either is missing, return missing parameter
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400

    #Get the User that matches the username (returns the first but is also implicitly the only because it's unique)
    user = User.query.filter_by(username=username).first()

    if user and bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        #Generate a JWT token
        expiration_time = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        token = jwt.encode({'user_id': user.id, 'exp': expiration_time}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'message': 'Login successful', 'token': token, 'userId': user.id}), 200
    else:
        return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/lists/<int:list_id>/delete', methods=['DELETE'])
@token_required
def delete_list(current_user, list_id):
    """
    Delete a specific list
    ---
    tags:
      - List Management
    parameters:
      - name: list_id
        in: path
        type: integer
        required: true
        description: The ID of the list to be deleted.
    security:
      - bearerAuth: []
    responses:
      200:
        description: List deleted successfully.
      403:
        description: Unauthorized to delete this list.
      404:
        description: List not found.
    """
    #Get list
    list_to_delete = ProductList.query.get_or_404(list_id)

    #Make sure it belongs to the currently logged in user
    if list_to_delete.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized to delete this list'}), 403

    #Delete list
    ListItem.query.filter_by(product_list_id=list_id).delete()
    database.session.delete(list_to_delete)
    database.session.commit()

    return jsonify({'message': 'List deleted successfully'}), 200

@app.route('/logout', methods=['POST'])
def logout_user():
    """
    Log a user out
    ---
    tags:
      - Authentication
    parameters:
      - in: body
        name: session_info
        description: The session ID to invalidate
        schema:
          type: object
          required:
            - session_id
          properties:
            session_id:
              type: string
              example: abc123xyz
    responses:
      200:
        description: Logout was successful
        schema:
          type: object
          properties:
            message:
              type: string
              example: User logged out successfully
      400:
        description: Session ID was not provided
        schema:
          type: object
          properties:
            message:
              type: string
              example: Session ID required for logout
    """
    #Get session id
    session_id = request.json.get('session_id')
    if session_id:
        return jsonify({'message': 'User logged out successfully'}), 200
    else:
        return jsonify({'message': 'Session ID required for logout'}), 400


@app.route('/track_search', methods=['POST'])
def track_search():
    """
    Record a user's search activity
    ---
    tags:
      - Search Activity
    parameters:
      - in: body
        name: search_data
        description: The search query and the user ID (optional for unregistered users)
        schema:
          type: object
          properties:
            search_query:
              type: string
              example: abate
            user_id:
              type: integer
              example: 1
              description: The ID of the user who performed the search (optional)
    responses:
      201:
        description: Search activity recorded successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Search activity recorded successfully
      400:
        description: Missing search query data
        schema:
          type: object
          properties:
            message:
              type: string
              example: Missing search query data
    """
    #Get the search and the user id associated (no user id if it's an unregistered user)
    data = request.json
    search_query = data.get('search_query')
    user_id = data.get('user_id', None)

    app.logger.info(f"Recording search: {search_query}, User ID: {user_id}")

    #Store that search activity in the database and associate it to the user
    new_search_activity = SearchActivity(search_query=search_query, user_id=user_id)
    database.session.add(new_search_activity)
    database.session.commit()

    return jsonify({'message': 'Search activity recorded successfully'}), 201

@app.route('/create_list', methods=['POST'])
def create_list():
    """
    Create a new product list for a user
    ---
    tags:
      - List Management
    parameters:
      - in: body
        name: list_data
        description: The name of the new list and the user ID who is creating it
        schema:
          type: object
          required:
            - name
          properties:
            name:
              type: string
              example: My Favorite Chemicals
            user_id:
              type: integer
              example: 1
              description: The ID of the user creating the list
    responses:
      201:
        description: Product list created successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Product list created successfully
      400:
        description: Missing list name or user ID
        schema:
          type: object
          properties:
            message:
              type: string
              example: Missing list name or user ID
    """
    #Get the list name and the user who filed the request
    data = request.json
    name = data.get('name')
    user_id = data.get('user_id', None)

    #If either is missing, return 400
    if not name or not user_id:
        return jsonify({'message': 'Missing list name or user ID'}), 400

    #Store the new list into the database with the user id associated
    new_product_list = ProductList(name=name, user_id=user_id)
    database.session.add(new_product_list)
    database.session.commit()

    return jsonify({'message': 'Product list created successfully'}), 201

@app.route('/lists/<int:list_id>/add_product', methods=['POST'])
def add_product_to_list(list_id):
    """
    Add a product to a user's product list
    ---
    tags:
      - List Management
    parameters:
      - in: path
        name: list_id
        required: true
        type: integer
        description: The ID of the list to add the product to
      - in: body
        name: product_data
        required: true
        schema:
          type: object
          properties:
            productId:
              type: string
              description: The ID of the product to add to the list
    responses:
      200:
        description: Product added to list successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: Product added to list successfully
      400:
        description: Missing product ID
        schema:
          type: object
          properties:
            message:
              type: string
              example: Missing product ID
      404:
        description: List not found
        schema:
          type: object
          properties:
            message:
              type: string
              example: List not found
      500:
        description: Internal server error
        schema:
          type: object
          properties:
            message:
              type: string
              example: An error occurred while adding the product to the list
    """
    #Get product ID
    data = request.get_json()
    product_id = data.get('productId')

    if not product_id:
        return jsonify({'message': 'Missing product ID'}), 400

    #Make sure the list ID exists
    product_list = ProductList.query.get(list_id)
    if not product_list:
        return jsonify({'message': 'List not found'}), 404

    #Add item's product ID to list
    try:
        new_list_item = ListItem(product_list_id=list_id, product_id=product_id)
        database.session.add(new_list_item)
        database.session.commit()
        return jsonify({'message': 'Product added to list successfully'}), 200
    except Exception as e:
        database.session.rollback()
        return jsonify({'message': 'An error occurred while adding the product to the list', 'error': str(e)}), 500

@app.route('/lists/<int:list_id>/remove_product/<string:product_id>', methods=['DELETE'])
def remove_product_from_list(list_id, product_id):
    """
    Remove a product from a list
    ---
    tags:
      - List Management
    parameters:
      - in: path
        name: list_id
        required: true
        type: integer
        description: The ID of the list from which the product is to be removed.
        example: 101
      - in: path
        name: product_id
        required: true
        type: string
        description: The ID of the product to be removed from the list.
        example: "abate"
    responses:
      200:
        description: Product removed from list successfully.
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Product removed from list successfully"
      404:
        description: Product or list not found.
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "Product or list not found"
    """
    #Find item in list
    list_item = ListItem.query.filter_by(product_list_id=list_id, product_id=product_id).first()

    #Delete item from list
    if list_item:
        database.session.delete(list_item)
        database.session.commit()
        return jsonify({'message': 'Product removed from list successfully'}), 200
    else:
        return jsonify({'message': 'Product or list not found'}), 404

def get_product_details(product_id):
    """
    Retrieves product based on its id (CAS)

    :param product_id: product's id
    """
    response = requests.get(f'https://api.simduttools.com/products/{product_id}')
    if response.status_code == 200:
        return response.json()
    else:
        return None

@app.route('/lists/<int:list_id>/items', methods=['GET'])
def get_list_items(list_id):
    """
    Fetch and display products in a specified list, with options to download as CSV, XLSX, or PDF.
    ---
    tags:
      - List Management
    parameters:
      - in: path
        name: list_id
        required: true
        type: integer
        description: The unique identifier of the list whose items are to be retrieved.
        example: 101
      - in: query
        name: format
        type: string
        required: false
        description: The format to download the list items. Accepts 'csv', 'xlsx', or 'pdf'. If not provided, returns JSON.
        example: csv
    responses:
      200:
        description: Successfully retrieved list items. The content type of the response depends on the requested format.
        content:
          application/json:
            schema:
              type: array
              items:
                type: object
                properties:
                  id:
                    type: integer
                  product_list_id:
                    type: integer
                  product_id:
                    type: string
                  product_details:
                    type: object
                    properties:
                      nomfrancais:
                        type: string
                      nomanglais:
                        type: string
                      cas:
                        type: string
                      noun:
                        type: string
                      classification:
                        type: string
                      date:
                        type: string
            example:
              - id: 1
                product_list_id: 101
                product_id: "C123456"
                product_details:
                  nomfrancais: "Acétone"
                  nomanglais: "Acetone"
                  cas: "67-64-1"
                  noun: "UN1090"
                  classification: "Flammable"
                  date: "2023-01-01"
      404:
        description: List not found or no items in the list.
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "List not found"
    """
    #Format type being 'pdf', 'csv' or 'xlsx'
    format_type = request.args.get('format')

    #Fetch the list to get the name
    list_obj = ProductList.query.get(list_id)
    if not list_obj:
        return jsonify({'message': 'List not found'}), 404
    list_name = list_obj.name

    #Use list's name to fetch its items
    list_items = ListItem.query.filter_by(product_list_id=list_id).all()
    if not list_items:
        return jsonify({'message': 'No items in the list'}), 404

    #Aggregate all the data of every product in the list
    products_details = []
    for item in list_items:
        response = requests.get(f'https://api.simduttools.com/products/{item.product_id}')
        if response.status_code == 200:
            product_details = response.json()
            products_details.append(product_details)
        else:
            print(f"Failed to fetch product details for product_id: {item.product_id}")

    #Prepare data for CSV, Excel, or PDF
    data = [
        ['Nom français', 'Nom anglais', 'CAS', 'No. UN', 'Classification(s)', 'Last Updated'],
        *[[
            product['nomfrancais'],
            product['nomanglais'],
            product['cas'],
            product['noun'],
            product['classification'],
            product['date']
          ] for product in products_details]
    ]

    #CSV
    #StringIO
    if format_type == 'csv':
        si = StringIO()
        cw = csv.writer(si)
        cw.writerows(data)
        output = make_response(si.getvalue())
        output.headers["Content-Disposition"] = f"attachment; filename={list_name}.csv"
        output.headers["Content-type"] = "text/csv; charset=utf-8"
        return output

    #Excel (xlsx)
    #Workbook (Excel workbook)
    elif format_type == 'xlsx':
        wb = Workbook()
        ws = wb.active
        for row in data:
            ws.append(row)
        stream = BytesIO()
        wb.save(stream)
        stream.seek(0)
        output = make_response(stream.read())
        output.headers["Content-Disposition"] = f"attachment; filename={list_name}.xlsx"
        output.headers["Content-type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        return output

    #PDF
    #wkhtmltopdf
    #HTML structure for the PDF output
    elif format_type == 'pdf':
        #path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
        #config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
        config = pdfkit.configuration()
        rendered_html = render_template('list_template.html', list_name=list_name, products=products_details)
        pdf = pdfkit.from_string(rendered_html, False, configuration=config)
        response = make_response(pdf)
        response.headers["Content-Disposition"] = f"attachment; filename={list_name}.pdf"
        response.headers["Content-type"] = "application/pdf"
        return response

    return jsonify([{
        'id': item.id,
        'product_list_id': item.product_list_id,
        'product_id': item.product_id,
        'product_details': next((p for p in products_details if p['cas'] == item.product_id), None)
    } for item in list_items])


@app.route('/user/<int:user_id>/search_history', methods=['GET'])
def get_search_history(user_id):
    """
    Fetch a user's search history
    ---
    tags:
      - User Management
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: The ID of the user whose search history is being requested
    responses:
      200:
        description: A list of search queries made by the user
        schema:
          type: array
          items:
            type: string
          example: ["sodium chloride", "hydrochloric acid"]
      404:
        description: User not found
        schema:
          type: object
          properties:
            message:
              type: string
              example: User not found
    """
    #Get user's ID
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    #Query for searches that were done by the said user ID
    search_activities = SearchActivity.query.filter_by(user_id=user_id).all()

    #Return the searches (basically the search history)
    return jsonify([activity.search_query for activity in search_activities]), 200

@app.route('/user/<int:user_id>/lists', methods=['GET'])
def get_user_lists(user_id):
    """
    Retrieve all product lists created by a specific user
    ---
    tags:
      - User Management
    parameters:
      - in: path
        name: user_id
        type: integer
        required: true
        description: The ID of the user whose lists are to be retrieved
    responses:
      200:
        description: An array of product lists including list IDs and names
        schema:
          type: array
          items:
            type: object
            properties:
              list_id:
                type: integer
              name:
                type: string
          example:
            - list_id: 1
              name: "Chemical Supplies"
            - list_id: 2
              name: "Lab Reagents"
      404:
        description: User not found
        schema:
          type: object
          properties:
            message:
              type: string
              example: "User not found"
    """
    #Query all lists that were done by given user ID
    user_lists = ProductList.query.filter_by(user_id=user_id).all()

    #Query for these lists' names
    lists_data = [{'list_id': lst.id, 'name': lst.name} for lst in user_lists]

    #Return the list of list IDs and names
    return jsonify(lists_data), 200


@app.route('/users_online', methods=['GET'])
def users_online():
    """
    Get the count of users currently online
    ---
    tags:
      - Statistics
    responses:
      200:
        description: The number of users that are currently online based on activity in the last 10 minutes.
        schema:
          type: object
          properties:
            users_online:
              type: integer
              example: 5
    """
    #Get the current time 10 minutes ago
    recent_threshold = datetime.datetime.utcnow() - timedelta(minutes=10)

    #Get sessions where last seen is below 10 minutes ago and count them
    online_users_count = UserSession.query.filter(UserSession.last_seen > recent_threshold).count()

    print(f"Users online count: {online_users_count}")

    #Return the number of sessions (online users)
    return jsonify({'users_online': online_users_count}), 200


@app.route('/total_users', methods=['GET'])
def total_users():
    """
    Get the total count of registered users
    ---
    tags:
      - Statistics
    responses:
      200:
        description: The total number of registered users in the system.
        schema:
          type: object
          properties:
            total_users:
              type: integer
              example: 150
    """
    #Get total user count
    user_count = User.query.count()
    return jsonify({'total_users': user_count}), 200


@app.route('/total_products_searched', methods=['GET'])
def total_products_searched():
    """
    Get the total number of product searches made
    ---
    tags:
      - Statistics
    responses:
      200:
        description: The total number of searches made by all users.
        schema:
          type: object
          properties:
            total_products_searched:
              type: integer
              example: 12345
    """
    #Get total searches count
    search_count = SearchActivity.query.count()
    return jsonify({'total_products_searched': search_count}), 200


@app.route('/most_searched', methods=['GET'])
def most_searched():
    """
    Retrieve the most frequently searched query.
    ---
    tags:
      - Search Activity
    responses:
      200:
        description: Returns the most frequently searched query along with its count.
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: The search query that has been searched the most.
                  example: "acetone"
                count:
                  type: integer
                  description: The number of times the query has been searched.
                  example: 150
      404:
        description: No searches have been recorded.
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: "No searches found"
    """
    # Query the database to find the most searched query
    result = database.session.query(
        SearchActivity.search_query,
        database.func.count(SearchActivity.search_query).label('query_count')
    ).group_by(
        SearchActivity.search_query
    ).order_by(
        database.desc('query_count')
    ).first()

    # Check if a result was found and return the query and count
    if result:
        return jsonify({
            'query': result.search_query,
            'count': result.query_count
        }), 200
    else:
        # If no search activities have been recorded, return a 404 error
        return jsonify({'message': 'No searches found'}), 404


@app.route('/total_lists_created', methods=['GET'])
def total_lists_created():
    """
    Get the total number of product lists created by users
    ---
    tags:
      - Statistics
    responses:
      200:
        description: The total number of product lists created by both registered and unregistered users.
        schema:
          type: object
          properties:
            total_lists_created:
              type: integer
              example: 37
    """
    #Get total lists created
    lists_count = ProductList.query.count()
    return jsonify({'total_lists_created': lists_count}), 200


@app.errorhandler(404)
def resource_not_found(e):
    """
    Error handling
    """
    return jsonify(error=str(e)), 404

###SWAGGER###
@app.route('/spec')
def spec():
    """
    Endpoint to generate Swagger specification from the Flask app
    """
    swag = swagger(app)
    swag['info']['version'] = "1.0"
    swag['info']['title'] = "WEBSITE API"
    return jsonify(swag)

#URL paths for accessing the Swagger UI and specifications
SWAGGER_URL = '/swagger'
API_URL = '/spec'

#Swagger UI blueprint
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "WEBSITE API"
    }
)

#Register the Swagger UI blueprint on the Flask app
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

#Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)