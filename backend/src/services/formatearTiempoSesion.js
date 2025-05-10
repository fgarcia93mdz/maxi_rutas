module.exports = (inicio, fin) => {
  const fechaInicio = new Date(inicio);
  const fechaFin = new Date(fin);

  if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
    return 'Tiempo no disponible';
  }

  const diferenciaMs = fechaFin - fechaInicio;
  const totalSegundos = Math.floor(diferenciaMs / 1000);

  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);

  return `${horas}h ${minutos}m`;
};
