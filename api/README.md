## API

### Database Models
`database_models.py` contains the database model setup for AlchemySQL

#### Issues encountered and solutions
1. A column being named `Annexe 4` was problematic, therefore the database was re-populated with a the column being named `Annexe4` as seen in `../create_database/populate_postgresql_database.py`
<br></br>
2. The `date` had a problem being converted with Flask's jsonify, there it was converted to `isoformat` in `database_models.py` for the `Product` model
<br></br>
~~3. The characters like `é` were displayed in unicode in the response, due to Flask's `jsonify` not being able to enforce utf-8 format, therefore Flask's `Response` in joint with `json.dumps()`, the issue was fixed: `    response = Response(json.dumps(products_data, ensure_ascii=False), mimetype='application/json; charset=utf-8')`~~

*Unicode characters are actually fine to use, they're automatically dealt with in practically all relevant scenarios

### Routes
`/products/all`: dumps all products and their attributes

`/classifications/all`: dumps all classifications

`/product_classifications/all`: dumps all product classifications

`/products/last_updated`: returns all products but ordered by last updated in the SIMDUT (descending date)

`/products/search`: supports multi-arguments and search by any column, also with dates intervals

`/products/autocomplete`: autocompletes based on french and english name

`/products/<string:cas>`: retrieves a product based on a give CAS number (unique identifier)

### SQL Injection
SQLAlchemy (wrapper for SQL queries / ORM) will be used.

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