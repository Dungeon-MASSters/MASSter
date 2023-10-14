import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

from pocketbase import PocketBase  # Client also works the same
from pocketbase.client import FileUpload
import time
import re
import pathlib
from libs import logger
from libs.models import Translator, VideoParser
import urllib.request

class Pipeline:
    def __init__(self) -> None:
        self.pb: PocketBase = PocketBase("https://pb.apps.npod.space/")
        self.admin_data = self.pb.admins.auth_with_password(
            "dev@email.local", 
            "6c6297287af76472")
        
        #self.translator = Translator()
        self.vparser = VideoParser()

    def run(self):
        while True:
            try:
                records = self.pb.collection('text_generation_mvp').get_list(
                    page=1,
                    per_page=1,
                    query_params={
                        "filter": 'status = "open"',
                        "sort": '+created'
                    }
                )

                if len(records.items) == 0:
                    logger.info(f'Не найдено ожидающих запросов')
                    time.sleep(3)
                    continue

                prompt, negative_prompt = self.preprocess(
                    records.items[0].prompt, records.items[0].negative_prompt)
                
                corr = {
                    'Вестерн': 'Western',
                    'Ретро': 'Retro',
                    'Фэнтези': 'Fantasy',
                    'Киберпанк': 'Cyberpunk'
                }

                try:
                    style = corr[records.items[0].style]
                except:
                    style = records.items[0].style

                video_url = self.pb.collection('text_generation_mvp').get_file_url(records.items[0], filename=records.items[0].video)
                
                video_name = 'video.mp4'
                urllib.request.urlretrieve(video_url, video_name)
                
                summary = self.vparser.get_desc_from_video(video_name)[0]['summary_text']
                print(summary)

                if prompt != '':
                    prompt = summary + ', ' + prompt
                else:
                    prompt = summary

                self.pb.collection('text_generation_mvp').update(
                    id=records.items[0].id,
                    body_params={
                        "status": "preprocessed",
                        "prompt": prompt,
                        "negative_prompt": negative_prompt,
                        "style": style
                    }
                )

            except:
                raise
                logger.error('Ошибка при чтении коллекции')
                time.sleep(3)

    def preprocess(self, prompt: str, negative_prompt: str) -> str:
        if prompt != '' and re.search(r'[А-ЯЁа-яё]', prompt):
            prompt = self.translator.translate(prompt)

        if negative_prompt != '' and re.search(r'[А-ЯЁа-яё]', negative_prompt):
            negative_prompt = self.translator.translate(negative_prompt)

        return prompt, negative_prompt

if __name__ == '__main__':
    pipeline = Pipeline()
    pipeline.run()
