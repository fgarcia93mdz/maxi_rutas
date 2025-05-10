// src/models/usuario_log.js
module.exports = (sequelize, DataTypes) => {
  const UsuariosLog = sequelize.define('UsuariosLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    codigo_sesion: { type: DataTypes.STRING, allowNull: false, unique: true },
    fecha_ingreso: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    fecha_egreso: { type: DataTypes.DATE, allowNull: true },
    tiempo_sesion: { type: DataTypes.STRING, allowNull: true }, // tipo "5 minutos", "2 horas", etc
    detalle: { type: DataTypes.STRING, allowNull: true }, // Ej: "Ingreso normal", "Logout manual", "Timeout"
    estado: { type: DataTypes.ENUM('abierto', 'cerrado'), defaultValue: 'abierto' }
  }, {
    tableName: 'usuarios_logs',
    timestamps: false
  });

  UsuariosLog.associate = function (models) {
    UsuariosLog.belongsTo(models.Usuario, { as: 'usuario', foreignKey: 'usuario_id' });
  };

  return UsuariosLog;
};
