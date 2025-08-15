export class ApiError extends Error {
    constructor(message,statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "Error";


        Error.captureStackTrace(this,this.constructor);
    };
};

export const catchAsync = (fn) => {
    return (req,res,next) => {
        fn(req,res,next).catch(next)
    };
};

export const handleJWTError = () => {
    new AppError("Invalid Token. Please Log in Again",401)
};