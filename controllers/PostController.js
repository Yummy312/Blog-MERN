import PostModel from '../models/Post.js'
import {validationResult} from "express-validator";


export const getLastTags = async (req, res)=>{
    try {
        const posts = await PostModel.find().limit(5).exec()
        const tags = posts.map(obj => obj.tags).flat().slice(0, 5)
        res.json(tags)
    } catch (err){
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}



export const remove = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({
                message: 'Статья не найдена'
            });
        }

        // Проверяем, является ли текущий пользователь автором статьи
        if (post.user.toString() !== req.userId) {
            return res.status(403).json({
                message: 'У вас нет прав на удаление этой статьи'
            });
        }

        // Находим пост и удаляем его
        await PostModel.findOneAndDelete({ _id: postId });


        res.json({
            success: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось удалить статью'
        });
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id;
        // Увеличиваем кол-во просмотров у статьи на 1 когда пользователь получает статью
        const updatedPost = await PostModel.findOneAndUpdate(
            {
                _id: postId
            },
            // Увеличиваем кол-во просмотров у статьи на 1
            {
                $inc: { viewsCount: 1 }
            },
            // Опции
            {
                new: true // Вернуть обновленный документ
            }
        );

        if (!updatedPost) {
            return res.status(404).json({
                message: 'Статья не найдена'
            });
        }

        res.json(updatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось получить статью'
        });
    }
}

export const  getAll = async (req, res)=>{
    try {
        const posts = await PostModel.find().populate({path: "user", select: ["fullName", "avatarUrl"]})
        res.json(posts)
    } catch (err){
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить статьи'
        })
    }
}

export const create = async (req, res) =>{
    try {


        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId,
        })

        const post = await doc.save();
        res.json(post)
    }

     catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать статью'
        })
    }
}

export const update = async (req, res) =>{
    try{
        const postId = req.params.id;

        const post = await PostModel.findById(postId);
        if (post.user.toString() !== req.userId) {
            return res.status(403).json({
                message: 'У вас нет прав на обновление этой статьи'
            });
        }

        await PostModel.updateOne({
            _id: postId,
        },
            {
                title: req.body.title,
                text: req.body.text,
                imageUrl: req.body.imageUrl,
                user: req.userId,
                tags: req.body.tags,
            }
        );
        res.json({
            success: true
        })

    }catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось обновить статью'
        });

    }
}


