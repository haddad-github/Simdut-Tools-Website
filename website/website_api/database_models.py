from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

#Initialize SQLAlchemy with Flask app
database = SQLAlchemy()

class User(database.Model):
    __tablename__ = 'users'
    id = database.Column(database.Integer, primary_key=True)
    username = database.Column(database.String(32), unique=True, nullable=False)
    password_hash = database.Column(database.String(128))
    email = database.Column(database.String(128), unique=True, nullable=True)

    #Relationships
    search_history = database.relationship('SearchActivity', backref='user', lazy=True)
    lists = database.relationship('ProductList', backref='user', lazy=True)

class UserSession(database.Model):
    __tablename__ = 'user_sessions'
    id = database.Column(database.Integer, primary_key=True)
    session_id = database.Column(database.String, unique=True, nullable=False)
    last_seen = database.Column(database.DateTime, default=datetime.utcnow)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), nullable=True)

class SearchActivity(database.Model):
    __tablename__ = 'search_activity'
    id = database.Column(database.Integer, primary_key=True)
    timestamp = database.Column(database.DateTime, default=datetime.utcnow)
    search_query = database.Column(database.String)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'), nullable=True)

class ProductList(database.Model):
    __tablename__ = 'product_lists'
    id = database.Column(database.Integer, primary_key=True)
    name = database.Column(database.String)
    timestamp = database.Column(database.DateTime, default=datetime.utcnow)
    user_id = database.Column(database.Integer, database.ForeignKey('users.id'))

class ListItem(database.Model):
    __tablename__ = 'list_items'
    id = database.Column(database.Integer, primary_key=True)
    product_list_id = database.Column(database.Integer, database.ForeignKey('product_lists.id'))
    product_id = database.Column(database.String)
