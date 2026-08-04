declare namespace Express {
    export interface Request {
        id?: string;
        file?: Multer.File
    }
}