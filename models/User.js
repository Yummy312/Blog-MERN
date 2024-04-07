import mongoose from "mongoose";
 //  Создаем модель(таблица в БД) пользователя
const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
    },

    avatarUrl: String,
}, {
    // При создании любого пользователя должна вмонтироваться дата создания и обновления
    timestamps: true
}
)

// Экспортируем модель пользователя для использования в других частях приложения
export default mongoose.model('User', UserSchema)