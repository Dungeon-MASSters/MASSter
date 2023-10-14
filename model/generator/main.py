from pocketbase import PocketBase  # Client also works the same
from pocketbase.client import FileUpload
import time
import pathlib
from PIL import Image
from libs import logger
from libs.models import ImageGenerationModel

class Pipeline:
    def __init__(self) -> None:
        self.pb: PocketBase = PocketBase("https://pb.apps.npcode.xyz")
        self.admin_data = self.pb.admins.auth_with_password(
            "dev@email.local", 
            "6c6297287af76472")
        
        self.model = ImageGenerationModel()
        self.model.load_kandinsky()

    def run(self):
        while True:
           # logger.info('listening to the collection')
            try:
                records = self.pb.collection('text_generation_mvp').get_list(
                    page=1,
                    per_page=1,
                    query_params={
                        "filter": 'status = "preprocessed"',
                        "sort": '-created'
                    }
                )

                if len(records.items) == 0:
                    logger.info(f'Не найдено ожидающих запросов')
                    time.sleep(3)
                    continue

                # self.pb.collection('text_generation_mvp').update(
                #     id=records.items[0].id,
                #     body_params={
                #         "status": "in_process"
                #     }
                # )

                images = self.process_generation(records.items[0])
                if len(images) == 0:
                    self.pb.collection('text_generation_mvp').update(
                        id=records.items[0].id,
                        body_params={
                            "status": "error"
                        }
                    )
                    logger.error('Не было создано ни одного изображения')
                    continue

                self.pb.collection('text_generation_mvp').update(
                    id=records.items[0].id,
                    body_params={
                        "status": "generated",
                        "output_image": ""
                    }
                )

                paths = []
                uploads = []
                pathlib.Path('tmp').mkdir(parents=True, exist_ok=True)
                for index, image in enumerate(images):
                    path = f'tmp/{index}.png'
                    paths.append(path)
                    image.save(path)
                    uploads.append((path, open(path, mode='rb')))

                self.pb.collection('text_generation_mvp').update(
                    id=records.items[0].id,
                    body_params={
                        "status": "generated",
                        "output_image": FileUpload(*uploads)
                    }
                )

            except:
                logger.error('Ошибка при чтении коллекции')
                time.sleep(3)

    def process_generation(self, data) -> list[Image.Image]:
        # self.pb.get_file_url(data, filename=f'tmp/{data.record.image}')

        images = self.model.generate(
            num_steps=200,
            guidance_scale=4.0,
            height=300,
            width=500,
            prompt=data.prompt,
            style=data.style,
            negative_prompt=data.negative_prompt,
            num_images=data.num_images
        )

        return images

if __name__ == '__main__':
    pipeline = Pipeline()
    pipeline.run()