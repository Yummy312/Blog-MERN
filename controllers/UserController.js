import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import jwt from "jsonwebtoken";

export const register =   async (req, res)=>{
    try{
       
        const password = req.body.password;
        // Алгоритм шифрования
        const salt = await bcrypt.genSalt(10)
        // Шифруем пароль
        const hash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash

        });

        // Сохраняем юзера в БД
        const user = await doc.save()

        const token = jwt.sign({
                _id: user._id
            },
            process.env.SECRET_KEY,
            //Время жизни токена. Мы скажем что срок жизни будет длиться 30дней
            {
                expiresIn: '30d'
            },

        )

        // Мы вытащим хэшированный пароль, но мы не будем его отправлять на клиент
        const {passwordHash,  ...UserData} = user._doc
        res.json(
            {
                // Возвращаем не все информацию, а вернем только документ
                ... UserData,
                token
            }
        )
    } catch (err){
        if (err.code === 11000 && err.keyValue && err.keyValue.email) {
            // Ошибка дублирования ключа (уникального индекса) для email
            return res.status(409).json({
                message: 'Пользователь с таким email уже существует!'
            });
        }
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегистрироваться'
        })
    }


}

export const login = async (req, res)=>{
    try{

        const user = await UserModel.findOne({email :req.body.email})

        if(!user){
            return res.status(404).json({
                message: 'Пользователь не найден'
            });
        }
        // Сравниваем пароль от клиента с паролем в БД
        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
        if (!isValidPass){
            return res.status(400).json({
                message: 'Неверный логин или пароль'
            });
        }

        const token = jwt.sign({
                _id: user._id
            },
            process.env.SECRET_KEY,
            //Время жизни токена. Мы скажем что срок жизни будет длиться 30дней
            {
                expiresIn: '30d'
            },

        );

        const {passwordHash,  ...UserData} = user._doc
        res.json(
            {
                // Возвращаем не все информацию, а вернем только документ
                ... UserData,
                token
            }
        )

    } catch (err){
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        })
    }
}

export const getMe = async (req, res)=>{
    try {
        const user = await UserModel.findById(req.userId)
        if (!user){
            return res.status(404).json({
                massage: 'Пользователь не найден'
            })
        }

        const {passwordHash,  ...UserData} = user._doc
        res.json(
            {
                // Возвращаем не все информацию, а вернем только документ
                ... UserData,

            }
        )

    } catch (err){
        console.log(err)
        res.status(500).json({
            message: 'Нет доступа'
        })
    }
}