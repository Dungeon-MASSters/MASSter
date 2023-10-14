import opennsfw2 as n2
from rus_rule_based_insult_classifier.core import insult_classifier

def check_nudity_one(image_path):
    nsfw_probability = n2.predict_image(image_path)
    if nsfw_probability > 0.75:
        return False
    return True


def check_nudity_lot(image_paths):
    result = []
    for image_path in image_paths:
        result.append(check_nudity_one(image_path))
    return result

#pip install git+https://github.com/kudep/rus_rule_based_insult_classifier
def check_profanity_ru(text):
    return insult_classifier(text)