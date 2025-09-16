# SEO Generator Backend

## Запуск

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Создайте базу данных MariaDB и таблицу:
   ```sql
   CREATE DATABASE seo_db;
   USE seo_db;
   CREATE TABLE seo_orders (
     id INT PRIMARY KEY AUTO_INCREMENT,
     keyword VARCHAR(255),
     pay TINYINT(1),
     text TEXT
   );
   ```
3. Запустите сервер:
   ```bash
   npm start
   ```

## TODO
- Добавить авторизацию
- Добавить личный кабинет
- Интеграция настоящей оплаты
