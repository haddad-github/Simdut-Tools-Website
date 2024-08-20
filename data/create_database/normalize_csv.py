import os

def read_and_clean_csv(source_csv, delimiter='|', deduplicate_key_index=None):
    """
    Reads a CSV file, removes trailing delimiters from each line, and optionally removes duplicate entries based on a specified key column

    :param source_csv: Path to the source CSV that needs converting
    :param delimiter: Delimiter used in the CSV file
    :param deduplicate_key_index: Index of the column to deduplicate by, if any
    """
    cleaned_lines = []

    #Track keys for deduplication
    seen_keys = set()

    with open(source_csv, 'r', encoding='utf-8') as file:

        #Clean header
        header = next(file)
        cleaned_header = delimiter.join(header.strip().split(delimiter)[:-1]) + '\n'
        cleaned_lines.append(cleaned_header)

        #Removing trailing delimiters
        for line in file:
            parts = line.strip().split(delimiter)
            cleaned_line = delimiter.join(parts[:-1]) + '\n'

            #Deduplication check
            if deduplicate_key_index is not None:
                key = parts[deduplicate_key_index].strip()
                if key in seen_keys:
                    continue
                seen_keys.add(key)

            #Clean lines
            cleaned_lines.append(cleaned_line)

    return cleaned_lines


def write_cleaned_csv(cleaned_lines, target_csv):
    """
    Writes the cleaned lines to a new CSV file

    :param cleaned_lines: List of cleaned lines to write
    :param target_csv: Path of the new CSV to be created
    """
    with open(target_csv, 'w', encoding='utf-8') as file:
        file.writelines(cleaned_lines)
    print(f"Written to {os.path.basename(target_csv)}")


if __name__ == "__main__":
    source_csv_paths = {
        'SIMDUT-2015_fixed.txt': {'deduplicate_key_index': 3}, #CAS being the 4th column
        'Clé_classification_fixed.txt': {'deduplicate_key_index': None}
    }

    #Create directory to store normalized CSV if not already created
    output_dir = 'normalized_csv'
    os.makedirs(output_dir, exist_ok=True)

    for filename, options in source_csv_paths.items():
        source_csv = os.path.join('../fixed_source_data', filename)
        target_csv = os.path.join(output_dir, os.path.splitext(filename)[0] + '_normalized.txt')
        cleaned_lines = read_and_clean_csv(source_csv, deduplicate_key_index=options['deduplicate_key_index'])
        write_cleaned_csv(cleaned_lines, target_csv)
