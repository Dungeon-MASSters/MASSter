from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

class ModuleSettings(Settings):
    PB_LINK: str = "https://pb.apps.npod.space/"
    PB_LOGIN: str = "dev@email.local"
    PB_PWD: str = "6c6297287af76472"
    COL_NAME: str = "text_generation_mvp"

settings = ModuleSettings()