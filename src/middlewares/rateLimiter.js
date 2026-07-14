
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100, 
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
});
export default limiter