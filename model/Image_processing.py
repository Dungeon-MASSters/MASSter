from rembg import remove
from PIL import Image


def delete_background(image_path):
    inp = Image.open(image_path)
    out = remove(inp)
    return out


def resize_img_to_eq(obj_img, back_img):
    w_b, h_b = back_img.size
    w_o, h_o = obj_img.size
    if w_o > w_b or w_o < w_b:
        width_percent = (w_b / float(obj_img.size[0]))
        height_size = int((float(obj_img.size[1]) * float(width_percent)))
        obj_img = obj_img.resize((w_b, height_size))
    if h_o > h_b or h_o < h_b:
        hight_percent = (h_b / float(obj_img.size[1]))
        width_size = int((float(obj_img.size[0]) * float(hight_percent)))
        obj_img = obj_img.resize((width_size, h_b))
    return obj_img


def combine_images(obj_img, background, pos_x = 0, pos_y = 0, scale = 1, rotation = 0):
    back_img = Image.open(background)
    obj_img = Image.open(obj_img)

    obj_img = resize_img_to_eq(obj_img, back_img)

    #restrictions
    if scale > 1: scale = 1
    if scale < 0.2: scale = 0.2

    obj_img = obj_img.resize((int(obj_img.width * scale), int(obj_img.height * scale)))

    obj_img = obj_img.rotate(angle = rotation)

    # centering
    back_img.paste(
        obj_img,
        (round(back_img.width / 2 - obj_img.width / 2 + pos_x), round(back_img.height / 2 - obj_img.height / 2 + pos_y)),
        mask=obj_img
    )

    return back_img
