import opennsfw2 as n2


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