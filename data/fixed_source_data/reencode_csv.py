def reencode_as_utf8(source_csv, target_csv):
    """
    Re-encodes the given CSV file into UTF-8

    :param source_file: Path to the source CSV that needs converting
    :param target_file: Path of the output file after conversion
    """
    #Open the source CSV and hold its content
    with open(source_csv, 'r') as file:
        content = file.read()

    #Write the content back to a new CSV file that will have UTF-8 encoding
    with open(target_csv, 'w', encoding='utf-8') as file:
        file.write(content)

    print(f'File {source_csv} has been re-encoded to UTF-8 as {target_csv}')

#Source files
source_simdut = '../source_data/SIMDUT-2015.txt'
source_classification = '../source_data/Clé_classification.txt'

#Target files
target_simdut = 'SIMDUT-2015_fixed.txt'
target_classification = 'Clé_classification_fixed.txt'

if __name__ == '__main__':
    #Re-encode them as UTF-8
    reencode_as_utf8(source_csv=source_simdut, target_csv=target_simdut)
    reencode_as_utf8(source_csv=source_classification, target_csv=target_classification)
