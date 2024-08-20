## Source Data

##### <u>CSVs come directly from the CNESST's website</u>
https://reptox.cnesst.gouv.qc.ca/Pages/liste-simdut-2015-a.aspx


##### <u>CSVs' direct links</u>
SIMDUT-2015.txt: https://reptox.cnesst.gouv.qc.ca/Documents/SIMDUT-2015.txt

Clé_classification.txt: https://reptox.cnesst.gouv.qc.ca/Documents/Cl%C3%A9_classification.txt

### Encoding
The CSVs are encoded as ANSI (Windows-1252).

They need to be re-encoded into UTF-8 to allow for french accents to be recognized (i.e. 'é').

This re-encoding is found in the `fixed_source_data/` folder of this repository.