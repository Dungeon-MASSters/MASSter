# Обложкер

[![Deploy frontend](https://github.com/Dungeon-MASSters/MASSter/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/Dungeon-MASSters/MASSter/actions/workflows/deploy-frontend.yml)

## Инструкции для локального запуска

http://localhost:8080/ - веб приложение

http://localhost:8090/ - BaaS pocketbase

Все сервисы приложения упакованы в Docker compose, для запуска необходимо
выполнить следующие действия:

### 1. Отредактировать пароли в docker-composer.yaml

Указать данные для подключения с Pocketbase. Для сервисов preprocessor и
generator указать переменные окружения (можно использовать значения по
умолчанию):

```bash
PB_LOGIN=dev@email.local
PB_PWD=1234567890
```

### 2. Собрать докер образы

Для сборки выполнить команду:

```bash
docker compose build # docker-compose build для более старых версий Docker
```

### 3. Запустить сервисы

Для запуска выполнить команду:

```bash
docker compose up # docker-compose up для более старых версий Docker
```

### 4. Создать пользователя Pocketbase

Зайти в админ панель Pocketbase по адресу:

http://localhost:8090/_

Создать первого пользователя с логином и паролем ранее указанным в
docker-compose.yaml

### 5. Настроить Oauth

В админ панели Pocketbase в меню `Settings/Auth providers` добавить провайдера
Vk или Yandex

### 6. Готово

Веб-приложение доступно на http://localhost:8080/
