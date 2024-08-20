import base64

def image_to_base64(image_path):
    """
    Converts a given image into a base64 encoded string

    :param image_path: image's path
    """
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

image_path = '../../website/simdut-search-website/src/assets/logo.png'
base64_string = image_to_base64(image_path)
print(base64_string)