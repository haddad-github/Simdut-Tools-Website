import pandas as pd
import json
from pathlib import Path

#Read the Excel file
translations = pd.read_excel('Translations.xlsx')

#The folder where we want to save the .json files
folder_path = Path('translations')

#Create the folder if it doesn't exist
folder_path.mkdir(parents=True, exist_ok=True)

#Iterate through each column in the dataframe except the first one (which is the key)
for language in translations.columns[1:]:
    #Create a dictionary from the dataframe
    translation_dict = pd.Series(translations[language].values, index=translations['KEY']).to_dict()

    #Remove any NaN values (empty cells in the excel)
    translation_dict = {k: v for k, v in translation_dict.items() if pd.notna(v)}

    #Set the file path using the language as the file name
    file_path = folder_path / f'{language.lower()}.json'

    #Save the dictionary to a json file
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(translation_dict, file, ensure_ascii=False, indent=4)

print(f"JSON files created in {folder_path.resolve()}")
