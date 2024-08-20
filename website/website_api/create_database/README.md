## Create Database

### Tech used

PostgreSQL will be used as the database

### Relational Database Logic

1. **Tables**:
   - `users`: Stores user information, including username, password, and email.
   - `user_sessions`: Tracks user sessions for active users.
   - `search_activity`: Logs user search queries.
   - `product_lists`: Stores lists created by users for products.
   - `list_items`: Links products to a user's product list.

### Implementation

1. **Users**:
   - Stores unique usernames, passwords, and emails.

   | Column Name   | Type         | Key         |
   |---------------|--------------|-------------|
   | id            | SERIAL       | Primary Key |
   | username      | VARCHAR(80)  | Unique      |
   | password_hash | VARCHAR(128) |             |
   | email         | VARCHAR(128) | Unique      |

2. **User Sessions**:
   - Tracks active user sessions and their last activity.

   | Column Name   | Type         | Key         |
   |---------------|--------------|-------------|
   | id            | SERIAL       | Primary Key |
   | session_id    | VARCHAR(255) | Unique      |
   | last_seen     | TIMESTAMP    |             |
   | user_id       | INTEGER      | Foreign Key (references users.id) |

3. **Search Activity**:
   - Logs each search performed by a user.

   | Column Name   | Type         | Key         |
   |---------------|--------------|-------------|
   | id            | SERIAL       | Primary Key |
   | timestamp     | TIMESTAMP    |             |
   | search_query  | VARCHAR(255) |             |
   | user_id       | INTEGER      | Foreign Key (references users.id) |

4. **Product Lists**:
   - Stores lists of products created by users.

   | Column Name   | Type         | Key         |
   |---------------|--------------|-------------|
   | id            | SERIAL       | Primary Key |
   | name          | VARCHAR(255) |             |
   | user_id       | INTEGER      | Foreign Key (references users.id) |
   | timestamp     | TIMESTAMP    |             |

5. **List Items**:
   - Associates products with a user's product list.

   | Column Name      | Type        | Key                       | Constraint                         |
   |------------------|-------------|--------------------------|------------------------------------|
   | id               | SERIAL      | Primary Key              |                                   |
   | product_list_id  | INTEGER     | Foreign Key (references product_lists.id) |
   | product_id       | VARCHAR(255)|                          |                                   |

### Implementation - Creating the Schema

1. Use the `create_postgresql_database.py` script to create the PostgreSQL database
2. Run the `create_tables` function from `create_postgre_sql_database.py` to set up the required tables

### How to Run

1. **Set Environment Variables**: Set the required database parameters as environment variables (e.g., `DATABASE_NAME`, `USERNAME`, `PASSWORD`, etc.).
2. **Create Database**:
   - Run `create_postgresql_database.py` to create the main database in PostgreSQL
3. **Create Tables**:
   - Execute `create_postgre_sql_database.py` to create tables in the database

*Note: If changes are needed, you can delete the existing database using a management tool like pgAdmin or SQL commands and rerun the above scripts.