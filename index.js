import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import mongoose from 'mongoose'
import multer from 'multer'
import {registerValidation, loginValidation, postCreateValidation} from "./validations/validation.js";
import checkAuth from "./utils/checkAuth.js";
import  * as UserController from './controllers/UserController.js'
import * as PostController from "./controllers/PostController.js";
import handleValidationErrors from "./validations/handleValidationErrors.js";
dotenv.config();

const port = process.env.PORT || 5000;

// Подключение к удаленной БД MongoDB
mongoose
    .connect(process.env.DB_CONNECTION)
    .then(()=>{console.log('DB ok')})
    .catch((err)=>console.log('DB error', err))

const app = express();

// Создаем хранилище где мы будем сохранять все файлы
const storage = multer.diskStorage({
    destination: (_, __, callback) => {
        // Убираем проверку существования директории
        fs.mkdirSync('uploads');
        callback(null, 'uploads');
    },
    filename: (_, file, callback) => {
        callback(null, file.originalname);
    },
});


const upload = multer({storage})
// Чтобы ПО понимало как работать с JSON
app.use(express.json());
app.use(cors())
//  для обслуживания статических файлов из директории
app.use('/uploads', express.static('uploads'));

// Роуты для пользователей
app.post('/auth/register', registerValidation, handleValidationErrors, UserController.register)
app.post('/auth/login', loginValidation, handleValidationErrors,  UserController.login)
app.get('/auth/me', checkAuth, UserController.getMe )

app.post('/upload', checkAuth,  upload.single('image'), (req, res)=>{
    // Проверяем, был ли загружен файл
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не был загружен' });
    }

    res.json({
        url: `/uploads/${req.file.originalname}`
    });
})


app.get('/tags', PostController.getLastTags)


// Роуты CRUD для статей
app.get('/posts', PostController.getAll)
// app.get('/posts/tags', PostController.getLastTags)
app.get('/posts/:id', PostController.getOne)
// Для авторизованных пользователей
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create)
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors,  PostController.update)
app.delete('/posts/:id', checkAuth,  PostController.remove)



app.listen(port, (err)=>{
    if(err){
        return console.log(err)
    }

    console.log('Server OK')
});



