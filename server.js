const express = require('express');
const axios = require('axios');
const app = express();

const clientId = 'ваш_client_id';
const clientSecret = 'ваш_client_secret';
const redirectUri = 'http://localhost:3000/auth/callback'; // Тот же redirect_uri, который вы указали в клиенте
const resumeId = 'ваш_resume_id'; // ID резюме, который вы хотите получить

app.use(express.static('public')); // Для обслуживания статических файлов, таких как HTML, CSS, JS

// Обработка редиректа после авторизации
app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Код авторизации не найден.');
    }

    try {
        // Обмен кода на токен доступа
        const tokenResponse = await axios.post('https://hh.ru/oauth/token', new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
        }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const accessToken = tokenResponse.data.access_token;

        // Получение данных резюме
        const resumeResponse = await axios.get(`https://api.hh.ru/resumes/${resumeId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            }
        });

        // Отправляем данные резюме на клиентскую часть
        res.send(`
            <html>
            <body>
                <h1>Информация о резюме</h1>
                <div id="resume">
                    <h2>Имя: ${resumeResponse.data.first_name} ${resumeResponse.data.middle_name || ''} ${resumeResponse.data.last_name}</h2>
                    <p>Пол: ${resumeResponse.data.gender.name}</p>
                    <p>Дата рождения: ${resumeResponse.data.birth_date || 'Не указана'}</p>
                    <p>Город: ${resumeResponse.data.area.name}</p>
                    <h2>Опыт работы</h2>
                    ${resumeResponse.data.experience.map(exp => `
                        <div>
                            <p>Компания: ${exp.company}</p>
                            <p>Должность: ${exp.position}</p>
                            <p>Период: ${exp.start} - ${exp.end}</p>
                            <p>Описание: ${exp.description}</p>
                        </div>
                    `).join('')}
                    <h2>Образование</h2>
                    ${resumeResponse.data.education.primary.map(ed => `
                        <div>
                            <p>Учебное заведение: ${ed.name}</p>
                            <p>Специальность: ${ed.result}</p>
                            <p>Год окончания: ${ed.year}</p>
                        </div>
                    `).join('')}
                    <h2>Ссылки на резюме</h2>
                    <p><a href="${resumeResponse.data.download.pdf.url}" target="_blank">Скачать PDF</a></p>
                    <p><a href="${resumeResponse.data.download.rtf.url}" target="_blank">Скачать RTF</a></p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка при обработке запроса.');
    }
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});
