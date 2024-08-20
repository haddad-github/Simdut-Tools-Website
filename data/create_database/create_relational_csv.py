def extract_product_classifications(source_csv):
    """
    Reads the source CSV, extracts the CAS per row and its respective classifications in a list of tuples,
    ensuring no entries with empty 'CAS' are included, and entries are unique based on the combination of 'CAS' and 'Classification'

    :param source_csv: Path to the source CSV that needs converting
    """
    #Use a set for uniqueness to automatically handle deduplication
    product_classifications_set = set()

    with open(source_csv, 'r', encoding='utf-8') as file:
        #Skip the header
        next(file)

        #Loop through every line
        for line in file:
            #Separate columns into lists (their separator is "|")
            columns = line.strip().split('|')

            #CAS is the 4th column and Classifications is the 6th column
            cas = columns[3]
            classifications = columns[5].split(',')

            # Skip entries where 'CAS' is empty
            if not cas:
                continue

            #Loop through each classification and create a tuple for every unique combination
            for classification in classifications:
                classification = classification.strip()
                if classification:  # Ensure classification is not empty
                    product_classifications_set.add((cas, classification))

    #Convert the set back to a list of tuples
    product_classifications = list(product_classifications_set)
    return product_classifications

def write_new_csv(product_classifications, target_csv):
    """
    Writes the extracted and deduplicated product classifications to the output file

    :param product_classifications: List of tuples (CAS, classification) pairings
    :param target_csv: Path of the new CSV to be created off the aforementioned list of tuples
    """
    with open(target_csv, 'w', encoding='utf-8') as file:
        #Write the header
        file.write("CAS|ClassificationCode\n")
        #Write every tuple on every line
        for cas, classification in product_classifications:
            file.write(f"{cas}|{classification}\n")

    print("product_classification CSV created successfully.")

if __name__ == '__main__':
    source_simdut = '../fixed_source_data/SIMDUT-2015_fixed.txt'
    product_classifications = extract_product_classifications(source_simdut)
    write_new_csv(product_classifications=product_classifications, target_csv='product_classifications.txt')
