# Translation Script

### Information

The excel sheet file (`Translations.xlsx`) contains languages (columns) and words (rows). The python script converts that excel data sheet into .json's for each language.

These are then used in the frontend with a translation hook from `i18n` (https://react.i18next.com/latest/usetranslation-hook)

### How to

1. Add every translation of a word to a row
2. Run `pip install -r requirements.txt`
3. Run `python convert_to_jsons.py`

The .json files for each language in `/translations` will have been edited
