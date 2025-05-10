const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const db = require('../database/models');
const { Usuario } = db;
const moment = require('moment');
const { Op } = require('sequelize');
const { sendMail } = require('../services/mailer');

const generateVerificationCode = (length) => {
  const code = crypto.randomBytes(Math.ceil(length / 2)).toString('hex');
  return code.slice(0, length);
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, email, rol } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const passwordGenerada = generateVerificationCode(8);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(passwordGenerada, salt);

    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      email,
      contraseña: hash,
      rol: rol || 'empresa_usuario',
      estado_clave: 'pendiente',
      estado: 'activo'
    });

    const htmlEmail = await ejs.renderFile(
      path.join(__dirname, '../views/users/new_user.ejs'),
      { usuario: nuevoUsuario, password: passwordGenerada }
    );

    await sendMail({
      to: email,
      subject: "Bienvenido a Schnell - Acceso a la plataforma",
      html: htmlEmail
    });

    return res.status(201).json({ mensaje: "Usuario creado y credenciales enviadas por correo", usuario: nuevoUsuario });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    if (!['admin_schnell', 'empresa_admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'estado']
    });

    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al listar usuarios" });
  }
};

// Actualizar datos de un usuario
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (req.usuario.rol !== 'admin_schnell' && req.usuario.rol !== 'empresa_admin' && req.usuario.id !== usuario.id) {
      return res.status(403).json({ mensaje: "No autorizado para editar este usuario" });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    if (rol && req.usuario.rol === 'admin_schnell') {
      usuario.rol = rol;
    }

    await usuario.save();

    res.status(200).json({ mensaje: "Usuario actualizado", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al actualizar usuario" });
  }
};

// Cambiar su propia contraseña
const cambiarContraseña = async (req, res) => {
  try {
    const { contraseñaActual, nuevaContraseña, confirmarContraseña } = req.body;
    const userId = req.usuario.id;

    if (!contraseñaActual || !nuevaContraseña || !confirmarContraseña) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    if (nuevaContraseña !== confirmarContraseña) {
      return res.status(400).json({ mensaje: "Las nuevas contraseñas no coinciden" });
    }

    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const passwordValida = bcrypt.compareSync(contraseñaActual, usuario.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: "La contraseña actual no es válida" });
    }

    const salt = bcrypt.genSaltSync(10);
    const nuevaHash = bcrypt.hashSync(nuevaContraseña, salt);

    await usuario.update({
      contraseña: nuevaHash,
      estado_clave: 'cambiada',
      fecha_ultimo_cambio_clave: new Date(),
      fecha_actualizacion: new Date() // 🔥 Actualiza también esta fecha para trazabilidad
    });

    return res.status(200).json({ mensaje: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cambiar contraseña" });
  }
};


// Eliminar usuario (baja lógica)
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (!['admin_schnell', 'empresa_admin'].includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No autorizado" });
    }

    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.estado = 'inactivo';
    await usuario.save();

    res.status(200).json({ mensaje: "Usuario dado de baja correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al eliminar usuario" });
  }
};

module.exports = {
  registrarUsuario,
  listarUsuarios,
  actualizarUsuario,
  cambiarContraseña,
  eliminarUsuario
};
