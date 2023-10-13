import argostranslate.package
import argostranslate.translate

from libs import logger

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
    