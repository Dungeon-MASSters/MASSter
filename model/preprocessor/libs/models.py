import argostranslate.package
import argostranslate.translate

# from libs import logger

from moviepy.editor import VideoFileClip
import numpy as np
import os
from datetime import timedelta
import random

import requests
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration, pipeline
import torch
import shutil

class Translator:
    def __init__(self) -> None:
        self.from_code = "ru"
        self.to_code = "en"

        argostranslate.package.update_package_index()
        available_packages = argostranslate.package.get_available_packages()
        package_to_install = next(
            filter(
                lambda x: x.from_code == self.from_code and x.to_code == self.to_code, available_packages
            )
        )
        argostranslate.package.install_from_path(package_to_install.download())

    def translate(self, text: str) -> str:
        try:
            text = argostranslate.translate.translate(text, self.from_code, self.to_code)
        except:
            logger.error(f'Ошибка при переводе текста: {text}')

        return text
    

class VideoParser:

    def __init__(self):
        self.DEVICE = torch.device('cuda:0')
        self.processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-large")
        self.model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-large").to(self.DEVICE)

        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device = self.DEVICE)

    def generate_desc(self, filename):

        raw_image = Image.open(filename).convert('RGB')

        # conditional image captioning
        inputs = self.processor(raw_image, return_tensors="pt").to(self.DEVICE)

        out = self.model.generate(**inputs)
        return self.processor.decode(out[0], skip_special_tokens=True)

    def format_timedelta(self, td):
        """Служебная функция для классного форматирования объектов timedelta (например, 00: 00: 20.05)
        исключая микросекунды и сохраняя миллисекунды"""
        result = str(td)
        try:
            result, ms = result.split(".")
        except ValueError:
            return result + ".00".replace(":", "-")
        ms = int(ms)
        ms = round(ms / 1e4)
        return f"{result}.{ms:02}".replace(":", "-")

    def video_parser(self, video_file):
        # загрузить видеоклип
        video_clip = VideoFileClip(video_file)

        # создаем папку по названию видео файла
        folder_dir, _ = os.path.splitext(video_file)
        folder_dir += "-moviepy"
        if not os.path.isdir(folder_dir):
            os.mkdir(folder_dir)

        filename = folder_dir

        # перебираем каждый возможный кадр
        for i in range(int(video_clip.duration / 60 * 5)):
        #10 рандомных кадров из видео
        #for i in range(20):
            current_duration = random.uniform(video_clip.duration * 0.15, video_clip.duration * 0.85)
            # отформатируйте имя файла и сохраните его
            frame_duration_formatted = self.format_timedelta(timedelta(seconds=current_duration)).replace(":", "-")
            frame_filename = os.path.join(filename, f"frame{frame_duration_formatted}.jpg")
            # сохраняем кадр с текущей длительностью
            video_clip.save_frame(frame_filename, current_duration)
        return folder_dir

    def get_desc_from_video(self, video_file: str) -> str:
        if not video_file.endswith('.mp4'):
            return ''

        folder_dir = self.video_parser(video_file)
        desc = []
        for images in os.listdir(folder_dir):
            desc.append(self.generate_desc(folder_dir + '/' + images))

        if os.path.exists(folder_dir):
            shutil.rmtree(folder_dir)

        summary_desc = self.get_summary(desc)
        return summary_desc
    
    def get_summary(self, desc) -> str:

        article = ''.join(str(x) for x in desc)
        
        return self.summarizer(article, max_length=130, min_length=30, do_sample=False)
    
