const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Устанавливаем статический каталог для обслуживания файлов
// В данном случае все файлы (включая index.html) должны находиться в корневом каталоге
app.use(express.static(path.join(__dirname)));

// Обработка главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
