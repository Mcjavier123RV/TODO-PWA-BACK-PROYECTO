import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ---------------------------------------
// 🟩 CREAR PRIMER ADMIN (solo temporal)
// ---------------------------------------
export async function createFirstAdmin(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "Nombre, email y contraseña son requeridos" });

        // Validar si ya existe un admin
        const exists = await User.findOne({ role: "admin" });
        if (exists) {
            return res.status(400).json({ message: "Ya existe un administrador" });
        }

        // Verificar si ya existe un usuario con ese email
        const emailExists = await User.findOne({ email });
        if (emailExists)
            return res.status(409).json({ message: "El email ya está registrado" });

        // Hash de contraseña
        const hash = await bcrypt.hash(password, 10);

        // Crear admin
        const admin = await User.create({
            name,
            email,
            password: hash,
            role: "admin",
            unidad: "",
            telefono: "",
            activo: true
        });

        res.json({
            message: "Administrador creado correctamente",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error del servidor", error: error.message });
    }
}


// ---------------------------------------
// REGISTRO - Solo el admin puede crear usuarios
// ---------------------------------------
export async function register(req, res){
    try{
        const { name, email, password, role, unidad, telefono } = req.body;
        
        if(!name || !email || !password)
            return res.status(400).json({message: 'Nombre, email y contraseña son requeridos'});

        // Verificar que quien crea el usuario sea admin
        const adminUser = await User.findById(req.userId);
        if(!adminUser || adminUser.role !== 'admin')
            return res.status(403).json({message: 'Solo los administradores pueden crear usuarios'});

        const exists = await User.findOne({email});
        if(exists) return res.status(409).json({message: 'El usuario ya existe'});

        const hash = await bcrypt.hash(password, 10);
        const user = new User({
            name, 
            email, 
            password: hash,
            role: role || 'usuario',
            unidad: unidad || '',
            telefono: telefono || ''
        });
        await user.save();

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                unidad: user.unidad
            }
        });
    } catch (e){
        res.status(500).json({message: 'Error del servidor'});
    }
}


// ---------------------------------------
// LOGIN
// ---------------------------------------
export async function login(req, res) {
    try{
        const { email, password } = req.body;
        
        if(!email || !password)
            return res.status(400).json({message: 'Email y contraseña son requeridos'});

        const user = await User.findOne({email});
        if(!user) return res.status(401).json({message: 'Email o contraseña inválidos'});

        if(!user.activo)
            return res.status(403).json({message: 'Usuario desactivado. Contacte al administrador'});

        const ok = await bcrypt.compare(password, user.password);
        if(!ok) return res.status(401).json({message: 'Email o contraseña inválidos'});

        const token = jwt.sign(
            {id: user._id, role: user.role}, 
            process.env.JWT_SECRET || 'changeme', 
            {expiresIn: '7d'}
        );

        res.json({
            token, 
            user: {
                id: user._id, 
                name: user.name, 
                email: user.email,
                role: user.role,
                unidad: user.unidad
            }
        });
        
    } catch(e){
        res.status(500).json({message: 'Error del servidor'});
    }
}


// ---------------------------------------
// PROFILE
// ---------------------------------------
export async function profile(req, res) {
    try{
        const user = await User.findById(req.userId).select('-password');
        if(!user) return res.status(404).json({message: 'Usuario no encontrado'});
        
        res.json({user});
    } catch(e){
        res.status(500).json({message: 'Error del servidor'});
    }
}


// ---------------------------------------
// LISTAR USUARIOS - Solo admin
// ---------------------------------------
export async function getAllUsers(req, res) {
    try{
        const adminUser = await User.findById(req.userId);
        if(!adminUser || adminUser.role !== 'admin')
            return res.status(403).json({message: 'No tienes permisos para ver usuarios'});

        const users = await User.find().select('-password').sort({createdAt: -1});
        res.json({users});
    } catch(e){
        res.status(500).json({message: 'Error del servidor'});
    }
}


// ---------------------------------------
// ACTUALIZAR USUARIO
// ---------------------------------------
export async function updateUser(req, res) {
    try{
        const { id } = req.params;
        const { name, email, telefono, unidad, activo, role } = req.body;

        const adminUser = await User.findById(req.userId);
        
        if(adminUser.role !== 'admin' && req.userId !== id)
            return res.status(403).json({message: 'No tienes permisos para actualizar este usuario'});

        const updateData = { name, email, telefono, unidad };
        
        if(adminUser.role === 'admin') {
            if(role) updateData.role = role;
            if(typeof activo !== 'undefined') updateData.activo = activo;
        }

        const user = await User.findByIdAndUpdate(
            id, 
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if(!user) return res.status(404).json({message: 'Usuario no encontrado'});

        res.json({message: 'Usuario actualizado', user});
    } catch(e){
        res.status(500).json({message: 'Error del servidor'});
    }
}


// ---------------------------------------
// DESACTIVAR USUARIO
// ---------------------------------------
export async function deleteUser(req, res) {
    try{
        const { id } = req.params;

        const adminUser = await User.findById(req.userId);
        if(!adminUser || adminUser.role !== 'admin')
            return res.status(403).json({message: 'No tienes permisos para eliminar usuarios'});

        const user = await User.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        ).select('-password');

        if(!user) return res.status(404).json({message: 'Usuario no encontrado'});

        res.json({message: 'Usuario desactivado', user});
    } catch(e){
        res.status(500).json({message: 'Error del servidor'});
    }
}
