import pg from 'pg';
import { resetearBDD } from './resetearBDD.js';
import express from 'express';

const { Client } = pg;
const app = express();
app.use(express.json());

const client = new Client({
  host: 'ep-raspy-wave-apigfz82-pooler.c-7.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'ciudad-magica',
  user: 'neondb_owner',
  password: 'npg_7O6YRZaikhAC',
  ssl: { rejectUnauthorized: false },
  channelBinding: 'require',
});


async function getEventosDelDia(fecha) {
 const {rows}= await client.query("SELECT * FROM eventos_masivos WHERE fecha = $1",[fecha]);
 if (rows.lenght < 1) return null;
 return rows;
}

async function borrarEventosPorLugar(lugar) {
 const {rows}= await client.query("DELETE FROM eventos_masivos WHERE lugar = $1",[lugar]);
 if (rows.length < 1) return null;
 return rows;
}

async function modificarAforo(evento, nuevoAforo) {
  const {rows}= await client.query("UPDATE eventos SET aforo = $2 WHERE nombre = $1",[evento, nuevoAforo]);
  if (rows.lenght < 1) return null;
  return rows;
}

async function duplicarEventoMasAforo() {
  const consultaSelect = `
  SELECT *
  FROM eventos
  ORDER BY aforo DESC
  LIMIT 1
`;

const resultado = await client.query(consultaSelect);

const evento = resultado.rows[0];

const consultaInsert = `
  INSERT INTO eventos
  (nombre, fecha, lugar, barrio, aforo)
  VALUES ($1, CURRENT_DATE, $2, $3, $4)
`;

await client.query(consultaInsert, [
  evento.nombre,
  evento.lugar,
  evento.barrio,
  evento.aforo
]);

return evento;
}

async function getBarriosMasEventos() {
  const consulta = `
    SELECT barrio, COUNT(*) AS cantidad
    FROM eventos
    GROUP BY barrio
    ORDER BY cantidad DESC
    LIMIT 5
  `;

  const resultado = await client.query(consulta);

  return resultado.rows;
}

// Abro conexion a BD
await client.connect();
app.listen(3000, () => {
  console.log('Servidor corriendo en el puerto 3000');
});

// Resetar/Cargar la BDD
await resetearBDD(client);

// 2. Borrar todos los eventos de Parque de la Ciudad
//const result = await borrarEventosPorLugar('Parque de la Ciudad')

// 4a. Obtener el evento con mas aforo
// 4b. Insertar ese evento con fecha de hoy
//const result3 = await duplicarEventoMasAforo();

// 5. Los 5 barrios con mas eventos
//const barrios = await getBarriosMasEventos();

// Cierro conexion a BD
//await client.end();

// Endpoint 1

app.get('/eventos', async (req, res) => {
  const fecha  = req.query.fecha;

  const eventos = await getEventosDelDia(fecha);

  if (eventos == null) {
    return res.status(404).json({
      mensaje: 'No se encontraron eventos'
    });
  }

  res.json(eventos);
});

// Endpoint 3
app.put('/eventos/aforo', async (req, res) => {
  const { evento, nuevoAforo } = req.body;

  const resultado = await modificarAforo(evento, nuevoAforo);

  if (resultado == null) {
    return res.status(404).json({
      mensaje: 'Evento no encontrado'
    });
  }

  res.json(resultado);
});