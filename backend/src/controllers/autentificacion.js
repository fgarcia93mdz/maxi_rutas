const crypto = require('crypto');
const moment = require('moment');
const { Usuario, UsuariosLog, BlackListToken } = require('../database/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const formatearTiempoSesion = require('../services/formatearTiempoSesion');


// LOGIN
const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ mensaje: "Faltan datos" });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const passwordValida = bcrypt.compareSync(contraseña, usuario.contraseña);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    if (usuario.estado !== 'activo') {
      return res.status(403).json({ mensaje: "Cuenta desactivada. Contacte al soporte." });
    }

    let debeCambiarContraseña = false;
    if (usuario.estado_clave === 'pendiente') {
      debeCambiarContraseña = true;
    }
    if (usuario.fecha_ultimo_cambio_clave) {
      const hoy = moment();
      const fechaCambio = moment(usuario.fecha_ultimo_cambio_clave);
      const diferenciaDias = hoy.diff(fechaCambio, 'days');
      if (diferenciaDias >= 90) {
        debeCambiarContraseña = true;
      }
    }

    // 1. Generar código de sesión
    const codigoSesion = crypto.randomBytes(16).toString('hex');

    // 2. Crear registro en usuarios_logs
    await UsuariosLog.create({
      usuario_id: usuario.id,
      codigo_sesion: codigoSesion,
      detalle: 'inicio de sesión',
      estado: 'abierto'
    });

    // 3. Crear token JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol, codigoSesion },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return res.status(200).json({
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        estado_clave: usuario.estado_clave,
        debeCambiarContraseña
      },
      token,
      codigoSesion // opcional si querés usarlo explícitamente en el front
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};


const logout = async (req, res) => {
  try {
    const usuario = req.usuario;
    const codigoSesion = usuario.codigoSesion;

    if (!codigoSesion) {
      return res.status(400).json({ mensaje: "Código de sesión no encontrado" });
    }

    // Buscar sesión abierta
    const logOpen = await UsuariosLog.findOne({
      where: {
        usuario_id: usuario.id,
        codigo_sesion: codigoSesion,
        estado: 'abierto'
      }
    });

    if (!logOpen) {
      return res.status(400).json({ mensaje: "No se encuentra una sesión abierta válida" });
    }

    // Actualizar el log
    const fechaEgreso = new Date();
    logOpen.fecha_egreso = fechaEgreso;
    logOpen.tiempo_sesion = formatearTiempoSesion(logOpen.fecha_ingreso, fechaEgreso);
    logOpen.detalle = "cierre normal de sesión";
    logOpen.estado = 'cerrado';

    await logOpen.save();

    // Marcar el token como inválido en la blacklist
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      await BlackListToken.update(
        { estado: 0 },
        { where: { jwt: token, estado: 1, usuario_id: usuario.id } }
      );
    }

    return res.status(200).json({ mensaje: "Sesión cerrada correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al cerrar sesión" });
  }
};


module.exports = {
  login,
  logout
};
