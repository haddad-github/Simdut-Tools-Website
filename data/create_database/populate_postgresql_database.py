import psycopg2
import os

#Database parameters from environment variables
DATABASE_PARAMS = {
    'database_name': os.getenv('DATABASE_NAME'),
    'username': os.getenv('USERNAME', 'postgres'),
    'password': os.getenv('PASSWORD'),
    'host': os.getenv('HOST', 'localhost'),
    'port': os.getenv('PORT', '5432'),
}

#Establish a connection to the database
def connect_to_database(DATABASE_PARAMS):
    """
    Connects to the PostgreSQL database

    :param DATABASE_PARAMS: dictionary that contains the database parameters
    """
    conn = psycopg2.connect(
        dbname=DATABASE_PARAMS['database_name'],
        user=DATABASE_PARAMS['username'],
        password=DATABASE_PARAMS['password'],
        host=DATABASE_PARAMS['host'],
        port=DATABASE_PARAMS['port']
    )
    return conn

#Create the tables
def create_tables(conn):
    """
    Runs an SQL command to directly create the tables in the PostgreSQL database

    :param conn: connection to the PostgreSQL database
    """
    #Create the 3 tables
    commands = (
        """
        CREATE TABLE IF NOT EXISTS Products (
            NomFrancais TEXT,
            NomAnglais TEXT,
            Date DATE,
            CAS TEXT PRIMARY KEY,
            NoUN TEXT,
            Classification TEXT,
            PourcentageDeDivulgation TEXT,
            Annexe4 TEXT,
            Commentaire TEXT
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS Classifications (
            ClassificationKey TEXT PRIMARY KEY,
            ClassificationCdn2015 TEXT
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS Product_Classification (
            CAS TEXT,
            ClassificationKey TEXT,
            PRIMARY KEY (CAS, ClassificationKey),
            FOREIGN KEY (CAS) REFERENCES Products(CAS),
            FOREIGN KEY (ClassificationKey) REFERENCES Classifications(ClassificationKey)
        );
        """
    )

    #Execute SQL command to create the tables
    cur = conn.cursor()
    for command in commands:
        cur.execute(command)
    cur.close()
    conn.commit()
    print('Tables created!')

def populateProducts(csv, conn):
    """
    Populates the Products table in the PostgreSQL database based on the CSV

    :param csv: csv that contains all the products' data
    :param conn: connection to the PostgreSQL database
    """
    with open(csv, 'r', encoding='utf-8') as file:
        #Skip header
        next(file)

        #Use the copy_from function to directly migrate the data from CSV to SQL
        with conn.cursor() as cur:
            cur.copy_from(file=file, table='products', sep='|', null='NULL')
            conn.commit()
    print('Populated the Products table.')

def populateClassifications(csv, conn):
    """
    Populates the Classifications table in the PostgreSQL database based on the CSV

    :param csv: csv that contains all the products' data
    :param conn: connection to the PostgreSQL database
    """
    with conn.cursor() as cur:
        with open(csv, 'r', encoding='utf-8') as file:
            #Skip the header row
            next(file)

            #Use the copy_from function to directly migrate the data from CSV to SQL
            cur.copy_from(file=file, table='classifications', sep='|', null='NULL')
        conn.commit()
    print('Populated the Classifications table.')


def populateProductClassification(csv, conn):
    """
    Populates the Product_Classification table in the PostgreSQL database based on the CSV

    :param csv: csv that contains all the products' data
    :param conn: connection to the PostgreSQL database
    """
    with conn.cursor() as cur:
        with open(csv, 'r', encoding='utf-8') as file:
            #Skip the header row
            next(file)

            #Use the copy_from function to directly migrate the data from CSV to SQL
            cur.copy_from(file=file, table='product_classification', sep='|', null='NULL')
        conn.commit()
    print('Populated the Product Classification table.')
    pass

if __name__ == '__main__':
    #Connect to the database
    conn = connect_to_database(DATABASE_PARAMS=DATABASE_PARAMS)

    #Create the tables
    create_tables(conn=conn)

    #Populate the tables from their respective CSVs
    populateProducts(csv='./normalized_csv/SIMDUT-2015_fixed_normalized.txt', conn=conn)
    populateClassifications(csv='./normalized_csv/Clé_classification_fixed_normalized.txt', conn=conn)
    populateProductClassification(csv='product_classifications.txt', conn=conn)

    print("Database populated successfully.")

    #Close connection
    conn.close()
