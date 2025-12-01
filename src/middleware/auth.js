import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer') ? header.slice(7) : null;
    
    if (!token) return res.status(401).json({ message: 'Token requerido'});
    
    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
        req.userId = payload.id;
        req.userRole = payload.role; // Agregamos el role
        next();
    }catch(e){
        return res.status(401).json({ message: 'Token inválido'});
    }
}

// Middleware para verificar que sea admin
export function isAdmin(req, res, next) {
    if(req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores'});
    }
    next();
}