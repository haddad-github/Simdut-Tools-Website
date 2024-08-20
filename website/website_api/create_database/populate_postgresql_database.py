import psycopg2
import os

#Database parameters
DATABASE_PARAMS = {
    'database_name': os.getenv('DATABASE_NAME'),
    'username': os.getenv('USERNAME', 'postgres'),
    'password': os.getenv('PASSWORD'),
    'host': os.getenv('HOST', 'localhost'),
    'port': os.getenv('PORT'),
}

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

def create_tables(conn):
    """
    Runs an SQL command to directly create the tables in the PostgreSQL database
    :param conn: connection to the PostgreSQL database
    """
    commands = (
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            password_hash VARCHAR(128) NOT NULL,
            email VARCHAR(128) UNIQUE NOT NULL
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS user_sessions (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) UNIQUE NOT NULL,
            last_seen TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
            user_id INTEGER REFERENCES users(id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS search_activity (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
            search_query VARCHAR(255),
            user_id INTEGER REFERENCES users(id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS product_lists (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            user_id INTEGER REFERENCES users(id),
            timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS list_items (
            id SERIAL PRIMARY KEY,
            product_list_id INTEGER REFERENCES product_lists(id),
            product_id VARCHAR(255)  -- Assuming you're using a string identifier for products
        );
        """
    )

    cur = conn.cursor()
    for command in commands:
        cur.execute(command)
    cur.close()
    conn.commit()
    print('Tables created successfully!')

if __name__ == '__main__':
    conn = connect_to_database(DATABASE_PARAMS)
    create_tables(conn)
    print("Database and tables setup complete.")
    conn.close()