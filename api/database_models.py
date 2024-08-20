from datetime import date
from flask_sqlalchemy import SQLAlchemy

#Initialize SQLAlchemy with Flask app
database = SQLAlchemy()

#Define the models (a Class represents a Table in the database)
class Product(database.Model):
    """
    Class represents the table Product and its columns
    """
    #Table name (should match actual name, otherwise generates a name based on the class name)
    __tablename__ = 'products'

    #Columns
    cas = database.Column(database.String, primary_key=True, name='cas')
    nomfrancais = database.Column(database.String, nullable=True, name='nomfrancais')
    nomanglais = database.Column(database.String, nullable=True, name='nomanglais')
    date = database.Column(database.Date, nullable=True, name='date')
    noun = database.Column(database.String, nullable=True, name='noun')
    classification = database.Column(database.String, nullable=True, name='classification')
    pourcentagededivulgation = database.Column(database.String, nullable=True, name='pourcentagededivulgation')
    annexe4 = database.Column(database.String, nullable=True, name='annexe4')
    commentaire = database.Column(database.String, nullable=True, name='commentaire')

    #Relationship to ProductClassification, then indirectly to Classification
    classifications = database.relationship('Classification', secondary='product_classification', back_populates='products')

    #Convert to dictionary for JSON serialization
    #{'column.name': self.column.name, ...} for every column name
    def to_dict(self):
        data = {}

        #Iterate through each column in the table
        for column in self.__table__.columns:
            #Retrieve the attribute value
            value = getattr(self, column.name)

            #Check if the value is a date instance and convert it to a string in ISO format
            if isinstance(value, date):
                data[column.name] = value.isoformat()
            else:
                data[column.name] = value

        #Classification categories
        classifications_cdn = {}
        for classification in self.classifications:
            key = classification.classificationkey
            value = classification.classificationcdn2015
            classifications_cdn[key] = value

        data['classifications_cdn'] = classifications_cdn

        return data

class Classification(database.Model):
    """
    Class represents the table Classifications and its columns
    """
    #Table name
    __tablename__ = 'classifications'  # ensure this matches the actual table name, otherwise generates a name based on the class name

    #Columns
    classificationkey = database.Column(database.String, primary_key=True, name='classificationkey')
    classificationcdn2015 = database.Column(database.String, name='classificationcdn2015')

    #Backpopulate for Product_Classification table
    #Bidirectional relationship --> access a product directly through here
    products = database.relationship('Product', secondary='product_classification', back_populates='classifications')

    #Convert to dictionary for JSON serialization
    #{'column.name': self.column.name, ...} for every column name
    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

class ProductClassification(database.Model):
    """
    Class represents the table Product_Classification and its columns
    """
    #Table name
    __tablename__ = 'product_classification'  # ensure this matches the actual table name, otherwise generates a name based on the class name

    #Columns
    cas = database.Column(database.String, database.ForeignKey('products.cas'), name='cas', primary_key=True)
    classificationkey = database.Column(database.String, database.ForeignKey('classifications.classificationkey'), name='classificationkey', primary_key=True)

    #Convert to dictionary for JSON serialization
    #{'column.name': self.column.name, ...} for every column name
    def to_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}