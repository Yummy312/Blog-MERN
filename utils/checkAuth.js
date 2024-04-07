import jwt from 'jsonwebtoken'

export default (req, res, next) =>{
    // В этой строке извлекается токен доступа из заголовка запроса Authorization.
    // Если заголовок Authorization отсутствует или пуст, переменной token присваивается пустая строка.
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if(token){
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            console.log(decoded._id)
            // Я монтирую полученный id из токена в request, чтобы затем использовать в контроллере
            req.userId = decoded._id;

            // Затем вызывается функция next(), чтобы передать управление обработчику маршрута.
            next();
        } catch (e) {
            return res.status(403).json({
                message: 'Невалидный токен'
            })
        }

    }else {
        return res.status(403).json({
            message: 'Нет доступа'
        })
    }
}