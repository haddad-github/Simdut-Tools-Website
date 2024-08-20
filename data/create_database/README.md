## Create Database

### Source data

The `SIMDUT-2015_fixed.txt` and `Clé_classification_fixed.txt` files from the `fixed_source_data/` folder are used to generate the database.

### Tech used

PostgreSQL will be used as the database

### Relational database logic

1. `SIMDUT-2015_fixed.txt` has 9 columns which define a **product**:
    
    | Column Name            | Description                                                                                 |
    |---------------------------------------------------------------------------------------------|-------------|
    | NomFrançais            | Product's name in french                                                                    |
    | NomAnglais             | Product's name in english                                                                   |
    | Date                   | Date it was last updated                                                                    |
    | CAS                    | Unique numerical (with dashes) identifier for international literary purposes               |
    | NoUN                   | United Nations identifier for international transport by the UN                             |
    | Classification         | Health Hazard categorization                                                                |
    | PourcentageDeDivulgation | % disclosure about the product                                                              |
    | Annexe 4               | https://publications.gc.ca/collections/collection_2017/sc-hc/H129-64-1-2016-fra.pdf (p.165) |
    | Commentaire            | Comments about the product                                                                  |

<br></br>
2. `Clé_classification_fixed.txt` has 2 columns which define a **classification**:

    | Column Name            | Description                                                                                                            |
    |------------------------------------------------------------------------------------------------------------------------|-------------|
    | Clé SIMDUT Cdn 2015            | A classification code (the same that are found in the `Classification` column for a product in `SIMDUT-2015_fixed.txt` |
    | Classification Cdn 2015             | Classification's descriptive categorization                                                                            |

<br></br>

3. We note that:
   1. `SIMDUT-2015_fixed.txt` has a unique **product** per row
   <br></br>
   2. `Clé_classification_fixed.txt` has a unique **classification** per row
   <br></br>
   3. One **product** can have multiple **classifications** (ex: the product with the CAS `3383-96-8` has the classifications `DS.1c.3` and `DS.1o.4`)
   <br></br>
   4. The `Clé SIMDUT Cdn 2015` column from `Clé_classification_fixed.txt` refers to the classifications found in the column `Classification` for a product in `SIMDUT-2015_fixed.txt`

<br></br>

4. We require a way to link a product to its classifications' descriptive categorization (`Classification Cdn 2015` column in `Clé_classification_fixed.txt`), ex:
   1. In `SIMDUT-2015_fixed.txt`, there's a product with the **french name** `Abate` has the unique identifier **CAS** `3383-96-8` and the **classification**(s) `DS.1c.3` and `DS.1o.4`
   <br></br>
   2. In `Clé_classifcation_fixed.txt`, the **Clé SIMDUT Cdn 2015** `DS.1c.3` has **Classification Cdn 2015** `Toxicité aiguë - cutanée / Catégorie 3` and the **Clé SIMDUT Cdn 2015** `DS.1o.4` has the **Classification Cdn 2015** `Toxicité aiguë - orale / Catégorie 4`
   <br></br>
   3. Through this relation, we note therefore that the product `Abate` (CAS: `3383-96-8`) has the **Classification Cdn 2015**(s) `Toxicité aiguë - cutanée / Catégorie 3` and `Toxicité aiguë - orale / Catégorie 4`
   <br></br>
   4. We therefore need a way to create this relation out of these 2 given tables

<br></br>
5. We conclude that:
   1. The primary key for products in `SIMDUT-2015_fixed.txt` should be `CAS` since it's a unique identifier
   <br></br>
   2. The primary key for classifications in `Clé_classification_fixed.txt` should be `Clé SIMDUT Cdn 2015`
   <br></br>
   3. A new table named `Product_Classification` will be created to establish the many-to-many relationship between products and classifications. This table will use both original tables' primary keys:
    
    | Column Name      | Description                                         |
    |------------------|-----------------------------------------------------|
    | CAS              | Foreign Key to `Products` table                     |
    | ClassificationKey| Foreign Key to `Classifications` table              |

   <br></br>

### Implementation - Creation of the schema

1. `SIMDUT-2015_fixed.txt` will be used to create the **Table 1**: `Products`, using the column `CAS` as the primary key
   <br></br>
2. `Clé_classification_fixed.txt` will be used to create the **Table 2**: `Classifications`, using `Clé SIMDUT Cdn 2015` (will be renamed to `ClassificationKey`) as the primary key
   <br></br>
3. Junction **Table 3**: `Product_Classification`, using `CAS` from the **Table 1** and `ClassificationKey` from the **Table 2** as the link between a product and a classification


### Implementation - Issue and Solution

In `SIMDUT-2015_fixed.txt`, we notice that a product can have multiple classifications in the column `Classifications`.

Ex: product with **CAS** `3383-96-8` has the following **Classifications** `DS.1c.3, DS.1o.4`, which is a string

Therefore, we need to split those strings into separate classifications.

**Solution**:

Create a new CSV where we will store a product's **CAS** and each every **Classifications** it has will be a separate row.

1. Example for product `Abate` with **CAS** `3383-96-8` and **Classifications** `DS.1c.3, DS.1o.4`:

    | CAS |	ClassificationCode | 
    |---------|--------------|
    | 3383-96-8 |	DS.1c.3 |
    | 3383-96-8 |	DS.1o.4 |

This will be the 3rd CSV, created through a script and then implemented as the table `Product_Classification`.

### Implementation - Creation of the PostgreSQL database

The `create_postgresql_database.py` will create a PostgreSQL database directly (without creating a .sql and running it), using `psycopg2` (PostgreSQL adapter)

For security reasons, the database parameters found in `create_postgresql_database.py` are going to be environment variables. They will be set as such (i.e.): `$env:DATABASE_NAME='simdut_api'` in the terminal.`echo $env:DATABASE_NAME` can be used to see what it's currently set at.

### Implementation - Populating the database

The creation of the tables and insertion of the database is done in `populate_postgresql_database.py`

We have **3 Tables**:

1. `Products` which comes from `../fixed_source_data/SIMDUT-2015-fixed.txt`:

1. `Products` which comes from `../fixed_source_data/SIMDUT-2015-fixed.txt`:
    
    | Column Name               | Type | Key         |
    |---------------------------|------|-------------|
    | CAS                       | TEXT | Primary Key |
    | NomFrancais               | TEXT |             |
    | NomAnglais                | TEXT |             |
    | Date                      | DATE |             |
    | NoUN                      | TEXT |             |
    | Classification            | TEXT |             |
    | PourcentageDeDivulgation  | TEXT |             |
    | Annexe4                   | TEXT |             |
    | Commentaire               | TEXT |             |


2. `Classifications` which comes from `../fixed_source_data/Clé_classification_fixed.txt`:

    | Column Name          | Type   | Key       |
    |----------------------|-----------|------|
    | ClassificationKey    | TEXT   | Primary Key |
    | ClassificationCdn2015| TEXT   |           |
3. `Product_Classification` which comes `product_classifications.txt`:

    | Column Name          | Type   | Key                       | Constraint                       |
    |----------------------|---------------------------|---------|----------------------------------|
    | CAS                  | TEXT   | Foreign Key (Primary Key) | REFERENCES Products (CAS)        |
    | ClassificationKey    | TEXT   | Foreign Key (Primary Key) | REFERENCES Classifications (ClassificationKey) |

### Data normalization and manual editing

Issue #1: `../fixed_source_data/SIMDUT-2015_fixed.txt` had duplicates for CAS and trailing "|" separators, they were removed in `./normalized_csv/SIMDUT-2015_fixed_normalized.txt` with the use of the `.\normalize_csv.py` script

Issue #2: `../normalized_csv/Clé_classification_fixed_normalized.txt` had 2 missing datapoints and were **manually** added to the CSV:
1. Produit non contrôlé|Produit non contrôlé
2. DP.2.99|Non-défini

Issue #4: The column `Annexe 4` is problematic to leave it named as such upon populating the database, therefore in `populate_postgresql_database.py`, the column is named `Annexe4` instead (no spaces)

### How To
1. run `normalize_csv.py` to create the normalized CSVs
2. run `create_relational_CSV.py` to create the 3rd CSV representing the 3rd table (product_classifications)
3. Bring the manual change of Issue #2 in the Data normalization and manual editing section above
4. run `create_postgres_sql_database.py` to create the database in PostgreSQL
5. run `populate_postgresql_database.py` to populate the database

*Note: If it is needed to change the database, delete it manually (i.e. using pgAdmin 4) and re-run starting from step 4
