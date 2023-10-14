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
from libs.config import settings
import re

class Pipeline:
    def __init__(self) -> None:
        self.pb: PocketBase = PocketBase(settings.PB_LINK)
        self.admin_data = self.pb.admins.auth_with_password(
            settings.PB_LOGIN, 
            settings.PB_PWD)
        
        self.translator = Translator()
        self.vparser = VideoParser()

    def run(self):
        while True:
            try:
                records = self.pb.collection(settings.COL_NAME).get_list(
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

                try:
                    video_url = self.pb.collection(settings.COL_NAME).get_file_url(records.items[0], filename=records.items[0].video)
                    
                    s = re.findall('\[(.*)\]', url)
                    ss = re.sub('[\' ]', '', s[0])
                    video_names = re.split(',', ss)

                    url = re.sub('\[.*\]', '', url)

                    #video_name = 'video.mp4' 

                    for video_name in video_names:
                        urllib.request.urlretrieve(video_url + video_name, video_name)


                    summary = self.vparser.get_desc_from_video(video_names)[0]['summary_text']
                    print(summary)

                    if prompt != '':
                        prompt = summary + ', ' + prompt
                    else:
                        prompt = summary
                except:
                    logger.info('Нет приложенного видео')

                self.pb.collection(settings.COL_NAME).update(
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
