import os
from flask_cors import CORS
from flask_swagger import swagger
from database_models import database
from flask import Flask, request, jsonify
from flask_swagger_ui import get_swaggerui_blueprint
from database_models import Product, Classification, ProductClassification

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

#Connect to database
app.config['SQLALCHEMY_DATABASE_URI'] = f"{DATABASE['source']}://{DATABASE['username']}:{DATABASE['password']}@{DATABASE['host']}:{DATABASE['port']}/{DATABASE['db_name']}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

#Bind the SQLAlchemy instance to the Flask app
database.init_app(app)

#Create the database tables based on your models
with app.app_context():
    database.create_all()

###ROUTES###
@app.route('/products/all', methods=['GET'])
def get_all_products():
    """
    Retrieve all products
    ---
    tags:
        - Full dump
    get:
      summary: Retrieve all products from the database.
      description: This will dump the entire Products table data.
    responses:
        200:
          description: A list of products in JSON format.
          schema:
            type: array
            items:
                type: object
                properties:
                    annexe4:
                        type: string
                    cas:
                        type: string
                    classification:
                        type: string
                    classifications_cdn:
                        type: string
                    commentaire:
                        type: string
                    date:
                        type: date
                    nomanglais:
                        type: string
                    nomfrancais:
                        type: string
                    noun:
                        type: string
                    pourcentagededivulgation:
                        type: string
                example:
                      {
                        "annexe4": "",
                        "cas": "14351-66-7",
                        "classification": "DS.1c.99, DS.1i.99, DS.1o.99, DS.7a.99, DS.8.99",
                        "classifications_cdn": {
                          "DS.1c.99": "Toxicité aiguë - cutanée / Non évalué",
                          "DS.1i.99": "Toxicité aiguë - inhalation / Non évalué",
                          "DS.1o.99": "Toxicité aiguë - orale / Non évalué",
                          "DS.7a.99": "Toxicité pour la reproduction (allaitement) / Effets sur ou via l'allaitement : Non évalué",
                          "DS.8.99": "Toxicité pour certains organes cibles - exposition unique / Non évalué"
                        },
                        "commentaire": "Cette classification provient d’une conversion informatique de la classification établie en vertu du Règlement sur les produits contrôlés. La classification complète selon le Règlement sur les produits dangereux sera établie ultérieurement.  Ce produit n’était pas contrôlé en vertu du Règlement sur les produits contrôlés.",
                        "date": "2014-11-14",
                        "nomanglais": "Sodium abietate",
                        "nomfrancais": "Abiétate de sodium",
                        "noun": "",
                        "pourcentagededivulgation": "Réglementation"
                      }
    """
    products = Product.query.all()

    return jsonify([product.to_dict() for product in products]), 200

@app.route('/classifications/all', methods=['GET'])
def get_all_classifications():
    """
    Retrieve all classifications
    ---
    tags:
        - Full dump
    get:
      summary: Retrieve all classifications from the database
      description: This will dump the entire Classifications table data.
    responses:
        200:
          description: A list of classifications in JSON format.
          schema:
            type: array
            items:
                type: object
                properties:
                    classificationcdn2015:
                        type: string
                    classificationkey:
                        type: string
                example:
                      {
                        "classificationcdn2015": "Gaz inflammables / Catégorie 1",
                        "classificationkey": "DP.2.1"
                      }
    """
    classifications = Classification.query.all()
    return jsonify([classification.to_dict() for classification in classifications]), 200

@app.route('/product_classifications/all', methods=['GET'])
def get_all_product_classifications():
    """
    Retrieve all product classifications
    ---
    tags:
        - Full dump
    get:
      summary: Retrieve all product classification linkages from the database.
      description: This will dump the entire Product_Classifications table data.
    responses:
        200:
          description: A list of product classification linkages in JSON format.
          schema:
            type: array
            items:
                type: object
                properties:
                    cas:
                        type: string
                    classificationkey:
                        type: string
                example:
                      {
                        "cas": "7803-51-2",
                        "classificationkey": "DP.5.2"
                      }

    """
    product_classifications = ProductClassification.query.all()
    return jsonify([product_classification.to_dict() for product_classification in product_classifications]), 200

@app.route('/products/last_updated', methods=['GET'])
def get_last_updated_products():
    """
    Retrieve latest updated products
    ---
    tags:
        - Ordered
    get:
      summary: Get all products ordered by the last updated date.
      description: This will return products sorted by the descending date, showing the latest updated products first.
    responses:
        200:
          description: A list of products sorted by the last updated date in JSON format.
          schema:
            type: array
            items:
                type: object
                properties:
                    annexe4:
                        type: string
                    cas:
                        type: string
                    classification:
                        type: string
                    classifications_cdn:
                        type: string
                    commentaire:
                        type: string
                    date:
                        type: date
                    nomanglais:
                        type: string
                    nomfrancais:
                        type: string
                    noun:
                        type: string
                    pourcentagededivulgation:
                        type: string
                example:
                      {
                        "annexe4": "",
                        "cas": "14351-66-7",
                        "classification": "DS.1c.99, DS.1i.99, DS.1o.99, DS.7a.99, DS.8.99",
                        "classifications_cdn": {
                          "DS.1c.99": "Toxicité aiguë - cutanée / Non évalué",
                          "DS.1i.99": "Toxicité aiguë - inhalation / Non évalué",
                          "DS.1o.99": "Toxicité aiguë - orale / Non évalué",
                          "DS.7a.99": "Toxicité pour la reproduction (allaitement) / Effets sur ou via l'allaitement : Non évalué",
                          "DS.8.99": "Toxicité pour certains organes cibles - exposition unique / Non évalué"
                        },
                        "commentaire": "Cette classification provient d’une conversion informatique de la classification établie en vertu du Règlement sur les produits contrôlés. La classification complète selon le Règlement sur les produits dangereux sera établie ultérieurement.  Ce produit n’était pas contrôlé en vertu du Règlement sur les produits contrôlés.",
                        "date": "2014-11-14",
                        "nomanglais": "Sodium abietate",
                        "nomfrancais": "Abiétate de sodium",
                        "noun": "",
                        "pourcentagededivulgation": "Réglementation"
                      }
    """
    #Order by date, descending
    products = Product.query.order_by(Product.date.desc()).all()
    return jsonify([product.to_dict() for product in products]), 200

@app.route('/products/search', methods=['GET'])
def search_product():
    """
    Search for products with various filters
    ---
    tags:
      - Search products
    parameters:
      - name: cas
        in: query
        type: string
        required: false
        description: The CAS number of the product to search for.
      - name: nomfrancais
        in: query
        type: string
        required: false
        description: The French name of the product to search for.
      - name: nomanglais
        in: query
        type: string
        required: false
        description: The English name of the product to search for.
      - name: date
        in: query
        type: string
        format: date
        required: false
        description: The date of product entry to search for.
      - name: start_date
        in: query
        type: string
        format: date
        required: false
        description: The start date for the product search range.
      - name: end_date
        in: query
        type: string
        format: date
        required: false
        description: The end date for the product search range.
      - name: noun
        in: query
        type: string
        required: false
        description: The noun of the product to search for.
      - name: classification
        in: query
        type: string
        required: false
        description: The classification of the product to search for.
      - name: pourcentagededivulgation
        in: query
        type: string
        required: false
        description: The percentage of disclosure for the product to search for.
      - name: annexe4
        in: query
        type: string
        required: false
        description: The annex 4 related to the product to search for.
      - name: commentaire
        in: query
        type: string
        required: false
        description: The comment related to the product to search for.
    responses:
      200:
        description: A list of products that match the search criteria.
        schema:
            type: array
            items:
                type: object
                properties:
                    annexe4:
                        type: string
                    cas:
                        type: string
                    classification:
                        type: string
                    classifications_cdn:
                        type: string
                    commentaire:
                        type: string
                    date:
                        type: date
                    nomanglais:
                        type: string
                    nomfrancais:
                        type: string
                    noun:
                        type: string
                    pourcentagededivulgation:
                        type: string
                example:
                      {
                        "annexe4": "",
                        "cas": "14351-66-7",
                        "classification": "DS.1c.99, DS.1i.99, DS.1o.99, DS.7a.99, DS.8.99",
                        "classifications_cdn": {
                          "DS.1c.99": "Toxicité aiguë - cutanée / Non évalué",
                          "DS.1i.99": "Toxicité aiguë - inhalation / Non évalué",
                          "DS.1o.99": "Toxicité aiguë - orale / Non évalué",
                          "DS.7a.99": "Toxicité pour la reproduction (allaitement) / Effets sur ou via l'allaitement : Non évalué",
                          "DS.8.99": "Toxicité pour certains organes cibles - exposition unique / Non évalué"
                        },
                        "commentaire": "Cette classification provient d’une conversion informatique de la classification établie en vertu du Règlement sur les produits contrôlés. La classification complète selon le Règlement sur les produits dangereux sera établie ultérieurement.  Ce produit n’était pas contrôlé en vertu du Règlement sur les produits contrôlés.",
                        "date": "2014-11-14",
                        "nomanglais": "Sodium abietate",
                        "nomfrancais": "Abiétate de sodium",
                        "noun": "",
                        "pourcentagededivulgation": "Réglementation"
                      }
      400:
        description: Invalid input provided.
      404:
        description: No products found matching the criteria.
    """
    query = Product.query

    #Optional filters
    cas = request.args.get('casNumber')
    nomfrancais = request.args.get('nomfrancais')
    nomanglais = request.args.get('nomanglais')
    date = request.args.get('date')
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')
    noun = request.args.get('unNumber')
    classification = request.args.get('classification')
    pourcentagededivulgation = request.args.get('pourcentagededivulgation')
    annexe4 = request.args.get('annexe4')
    commentaire = request.args.get('commentaire')

    #Filter general knowledge:
    #.filter() = "WHERE"
    #.ilike() = case insensitive matching
    #Format: query.filter([Class].[table_name].ilike()
    if cas:
        query = query.filter(Product.cas == cas)

    if nomfrancais:
        query = query.filter(Product.nomfrancais.ilike(f'%{nomfrancais}%'))

    if nomanglais:
        query = query.filter(Product.nomanglais.ilike(f'%{nomanglais}%'))

    if date:
        query = query.filter(Product.date == date)

    #Date interval filters
    if start_date and end_date:
        query = query.filter(Product.date.between(start_date, end_date))
    elif start_date:
        query = query.filter(Product.date >= start_date)
    elif end_date:
        query = query.filter(Product.date <= end_date)

    if noun:
        query = query.filter(Product.noun == noun)

    if classification:
        #Split by comma for OR operation in the search filters
        or_groups = classification.split(',')
        or_conditions = []

        for group in or_groups:
            #Split by semi-column for AND operation in the search filters
            and_classifications = group.split(';')
            and_conditions = [Product.classification.ilike(f'%{cls.strip()}%') for cls in and_classifications]

            #Combine with AND
            or_conditions.append(database.and_(*and_conditions))

        #Combine all groups with OR
        classification_filter = database.or_(*or_conditions)
        query = query.filter(classification_filter)

    if pourcentagededivulgation:
        query = query.filter(Product.pourcentagededivulgation.ilike(f'%{pourcentagededivulgation}%'))

    if annexe4:
        query = query.filter(Product.annexe4.ilike(f'%{annexe4}%'))

    if commentaire:
        query = query.filter(Product.commentaire.ilike(f'%{commentaire}%'))

    #Results (all products found) from the query
    products = query.all()

    #Jsonify response
    return jsonify([product.to_dict() for product in products]), 200

@app.route('/products/autocomplete', methods=['GET'])
def autocomplete():
    """
    Autocomplete search query
    ---
    tags:
      - Autocomplete
    parameters:
      - name: approx
        in: query
        type: string
        required: true
        description: Partial search query for autocomplete suggestions
    responses:
      200:
        description: A list of autocomplete suggestions containing both French and English names
        schema:
          type: array
          items:
            type: object
            properties:
              nomfrancais:
                type: string
              nomanglais:
                type: string
            example:
                {
                    "nomanglais": "d-Arabinose",
                    "nomfrancais": "Arabinose (d-)"
                }
    """
    query = request.args.get('approx', '')
    if not query:
        return jsonify([]), 200

    #Query for matching products in both the French and English name fields
    suggestions = Product.query.filter(
        database.or_(
            Product.nomfrancais.ilike(f'%{query}%'),
            Product.nomanglais.ilike(f'%{query}%')
        )
    ).limit(10).all()

    #Return suggestions with both French and English names
    return jsonify([
        {'nomfrancais': product.nomfrancais, 'nomanglais': product.nomanglais}
        for product in suggestions
    ]), 200

@app.route('/products/<string:cas>', methods=['GET'])
def get_product_by_cas(cas):
    """
    Search for products with CAS
    ---
    tags:
      - Search products
    parameters:
      - name: cas
        in: query
        type: string
        required: true
        description: The CAS number of the product to search for.
    responses:
      200:
        description: A list of products that match the search criteria.
        schema:
            type: array
            items:
                type: object
                properties:
                    annexe4:
                        type: string
                    cas:
                        type: string
                    classification:
                        type: string
                    classifications_cdn:
                        type: string
                    commentaire:
                        type: string
                    date:
                        type: date
                    nomanglais:
                        type: string
                    nomfrancais:
                        type: string
                    noun:
                        type: string
                    pourcentagededivulgation:
                        type: string
                example:
                      {
                        "annexe4": "",
                        "cas": "14351-66-7",
                        "classification": "DS.1c.99, DS.1i.99, DS.1o.99, DS.7a.99, DS.8.99",
                        "classifications_cdn": {
                          "DS.1c.99": "Toxicité aiguë - cutanée / Non évalué",
                          "DS.1i.99": "Toxicité aiguë - inhalation / Non évalué",
                          "DS.1o.99": "Toxicité aiguë - orale / Non évalué",
                          "DS.7a.99": "Toxicité pour la reproduction (allaitement) / Effets sur ou via l'allaitement : Non évalué",
                          "DS.8.99": "Toxicité pour certains organes cibles - exposition unique / Non évalué"
                        },
                        "commentaire": "Cette classification provient d’une conversion informatique de la classification établie en vertu du Règlement sur les produits contrôlés. La classification complète selon le Règlement sur les produits dangereux sera établie ultérieurement.  Ce produit n’était pas contrôlé en vertu du Règlement sur les produits contrôlés.",
                        "date": "2014-11-14",
                        "nomanglais": "Sodium abietate",
                        "nomfrancais": "Abiétate de sodium",
                        "noun": "",
                        "pourcentagededivulgation": "Réglementation"
                      }
      400:
        description: Invalid input provided.
      404:
        description: No products found matching the criteria.
    """
    product = Product.query.filter_by(cas=cas).first()
    if product:
        return jsonify(product.to_dict()), 200
    else:
        return jsonify({'message': 'Product not found'}), 404

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
    swag['info']['title'] = "SIMDUT API"
    return jsonify(swag)

#URL paths for accessing the Swagger UI and specifications
SWAGGER_URL = '/swagger'
API_URL = '/spec'

#Swagger UI blueprint
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "SIMDUT API"
    }
)

#Register the Swagger UI blueprint on the Flask app
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

#Run the app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
