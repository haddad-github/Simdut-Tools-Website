## Fixed Source Data

### Re-encoding
The source CSVs are encoded as ANSI (Windows-1252) and need to be re-encoded into UTF-8 to allow for french accents to be recognized (i.e. 'é').

`reencode_csv.py` creates the re-encoded UTF-8 CSVs as `Clé_classification_fixed.txt` and `SIMDUT-2015_fixed.txt` in this folder.

These CSVs will be used to create a relational PostgreSQL database in the `create_database/` folder.

### How To
run `reencode_csv.py` to generate the 2 CSV
