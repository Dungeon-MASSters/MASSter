from diffusers import KandinskyV22Pipeline, KandinskyV22PriorPipeline, KandinskyV22ControlnetPipeline
import torch
from PIL import Image
from typing import Callable
from transformers import CLIPVisionModelWithProjection
from diffusers.models import UNet2DConditionModel
import gc

def collect_cache() -> None:
    torch.cuda.empty_cache()
    gc.collect()

def free_cache(func: Callable) -> Callable:
    def wrapper(*args, **kwargs):
        result = func(*args, **kwargs)
        collect_cache()
        return result
    
    return wrapper

class ImageGenerationModel:
    def __init__(self) -> None:
        self.DEVICE = torch.device('cuda:0')

    @free_cache
    def load_kandinsky(self) -> None:
        self.image_encoder = CLIPVisionModelWithProjection.from_pretrained(
            'kandinsky-community/kandinsky-2-2-prior',
            subfolder='image_encoder'
        ).half().to(self.DEVICE)

        self.unet = UNet2DConditionModel.from_pretrained(
            'kandinsky-community/kandinsky-2-2-decoder',
            subfolder='unet'
        ).half().to(self.DEVICE)

        self.prior = KandinskyV22PriorPipeline.from_pretrained(
            'kandinsky-community/kandinsky-2-2-prior',
            image_encoder=self.image_encoder,
            torch_dtype=torch.float16
        ).to(self.DEVICE)

        self.decoder = KandinskyV22Pipeline.from_pretrained(
            'kandinsky-community/kandinsky-2-2-decoder',
            unet=self.unet,
            torch_dtype=torch.float16
        ).to(self.DEVICE)

    # @free_cache
    # def load_depth_model(self):
    #     self.pipe = KandinskyV22ControlnetPipeline.from_pretrained(
    #         "kandinsky-community/kandinsky-2-2-controlnet-depth", torch_dtype=torch.float16
    #     ).to(self.DEVICE)

    # @free_cache
    # def remove_depth_model(self):
    #     del self.pipe

    @free_cache
    def generate(self, 
        num_steps: int, 
        guidance_scale: float, 
        height: int, 
        width: int,
        prompt: str,
        style: str,
        negative_prompt: str,
        num_images: int) -> list[Image.Image]:

        if prompt == '': return []

        if negative_prompt == '':
            negative_prompt = (
                'lowres, text, error, cropped, worst quality, '
                +'low quality, jpeg artifacts, ugly, duplicate, '
                + 'morbid, mutilated, out of frame, extra fingers, '
                + 'mutated hands, poorly drawn hands, poorly drawn face, '
                + 'mutation, deformed, blurry, dehydrated, bad anatomy, '
                + 'bad proportions, extra limbs, cloned face, disfigured, '
                + 'gross proportions, malformed limbs, missing arms, '
                + 'missing legs, extra arms, extra legs, fused fingers, '
                + 'too many fingers, long neck, username, watermark, signature'
            )

        if num_steps < 1: num_steps = 1
        if height < 1: height = 380
        if width < 1: width = 720
        if guidance_scale < 0: guidance_scale = 4.0
        if style != '': prompt +=  f', {style}'

        try:
            img_emb = self.prior(
                prompt=prompt,
                num_inference_steps=num_steps,
                num_images_per_prompt=num_images
            )

            negative_emb = self.prior(
                prompt=negative_prompt,
                num_inference_steps=num_steps,
                num_images_per_prompt=num_images
            )

            images = self.decoder(
                image_embeds=img_emb.image_embeds,
                negative_image_embeds=negative_emb.image_embeds,
                num_inference_steps=num_steps,
                guidance_scale=guidance_scale,
                height=height,
                width=width)
        except:
            raise
            return []

        return images.images
