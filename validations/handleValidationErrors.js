import {validationResult} from "express-validator";
// используется для извлечения результатов проверки валидации из запроса.
export default (req, res, next)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array())
    }

    next()
}