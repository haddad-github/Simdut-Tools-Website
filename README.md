## SIMDUT API & WEBSITE

### General Structure
Every folder contains its own `README` for more details.

## Data

`data/source_data/` contains the CSV data downloaded directly from the official source

`data/fixed_source_data/` contains the CSV re-encoded as UTF-8, to support French accents (i.e. 'é')

`data/create_database/` contains the normalization of the CSV data, the creation of another CSV to represent a relational table, the creation of the PostgreSQL database and its data population

## SIMDUT API

`api/` contains the API app, tests, including the Swagger-UI integration

### How to (from scratch)
1. Get packages: <br>
`pip install -r requirements.txt`
<br></br>

2. Go in the `data/create_database/` folder and follow the README's `How To` at the bottom of the page
<br></br>

3. Go in the `api/` folder and follow the README's `How To` instructions at the bottom of the page
<br>

## Website API

`website/website_api` contains the API app, tests, including the Swagger-UI integration

### How to (from scratch)
1. Get packages: <br>
`pip install -r requirements.txt`
<br></br>

2. Go in the `website/website_api/create_database/` folder and follow the README's `How To` at the bottom of the page
<br></br>

3. Go in the `website/website_api/` folder and follow the README's `How To` instructions at the bottom of the page
<br>

### Set your environment variables
Variables to set:

`$env:SOURCE` --> database source <br>
`$env:USERNAME` --> database username <br>
`$env:PASSWORD` --> database password <br>
`$env:HOST` --> database host <br>
`$env:PORT` --> database port <br>
`$env:DB_NAME` --> database name <br>

Ex to set environment variable: <br>
`$env:SOURCE='postgresql'`
<br></br>
Ex to see environment variable: <br>
`echo $env:SOURCE`


### Running the 3 microservices

This will be a copy of the bash scripts; this will not be exactly replicated in production, as it's going to be running on a different OS, however it gaves a baseline for understanding what needs to be set in order to have the microservices running.

#### Microservice #1 - Running the Website's frontend:
```shell
#Navigate to directory
cd 'XXXXX\website\simdut-search-website'

#Activate the virtual environment
$venvScript = 'XXXXX\venv\Scripts\Activate.ps1'
. $venvScript

#Start the website
npm start
```

#### Microservice #2 - Running the SIMDUT API (backend):
```shell
#Setting environment variables
$env:SOURCE='XXXXX'

$env:USERNAME='XXXXX'

$env:PASSWORD='XXXXX'

$env:PORT='XXXXX'

$env:DB_NAME='XXXXX'

#Navigate to the API directory
cd 'XXXXX\api'

#Activate the virtual environment
$venvScript = 'XXXXX\venv\Scripts\Activate.ps1'
. $venvScript

#Run the SIMDUT API
python .\app.py
```

#### Microservice #3 - Running the Website's API (backend):
```shell
#Set environment variables 

$env:SOURCE = 'XXXXX'

$env:USERNAME = 'XXXXX'

$env:PASSWORD = 'XXXXX'

$env:PORT = 'XXXXX'

$env:DB_NAME = 'XXXXX'

#Secret key for authentifications
$env:SECRET_KEY = 'XXXXX'

#Navigate to the website API directory
cd 'XXXXX\website\website_api'

#Activate the virtual environment
$venvScript = 'XXXXX\venv\Scripts\Activate.ps1'
. $venvScript

#Run the Website API
python .\app.py
```

#### Running all 3 at once:
```shell
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "& 'XXXXX\RunSimdutAPI'"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "& 'XXXXX\RunWebsiteAPI'"
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "& 'XXXXX\RunWebsite'"
```