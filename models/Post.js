import mongoose from "mongoose";
//  Создаем модель(таблица в БД) пользователя
const PostSchema = new mongoose.Schema({
        title: {
            type: String,
            required: true,
        },

        text: {
            type: String,
            required: true,
        },
        tags: {
            type: Array,
            default: []
        },

        viewsCount: {
            type: Number,
            default: 0
        },

        user: {
            // Этот тип данных используется для создания ссылок на другие документы в базе данных MongoDB.
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',  // Ссылка на модель 'User
            required: true
        },

        imageUrl: String,
    }, {
        // При создании любого пользователя должна вмонтироваться дата создания и обновления
        timestamps: true
    }
)

// Экспортируем модель пользователя для использования в других частях приложения
export default mongoose.model('Post', PostSchema)