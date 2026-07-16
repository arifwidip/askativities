import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  adminId?: string;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'local_jwt_secret_key_12345', (err, decoded: any) => {
      if (err) {
        res.status(403).json({ error: 'Forbidden. Invalid token.' });
        return;
      }

      req.adminId = decoded.id;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized. Token missing.' });
  }
};
