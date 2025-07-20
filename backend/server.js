const http = require("http");
const mysql = require("mysql");

// Crear conexión a la base de datos MySQL en Docker
const db = mysql.createConnection({
  host: "localhost",
  port: 3307,         // Mapeo: host 3307 --> contenedor MySQL 3306
  user: "root",
  password: "1234",   // La contraseña que configuraste
  database: "formulario_db",
});

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
  } else {
    console.log("Conectado a la base de datos MySQL");
  }
});

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // Encabezados CORS y respuesta JSON
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  // Manejo preflight OPTIONS
  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Ruta raíz informativa
  if (method === "GET" && url === "/") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        mensaje: "Servidor Node.js funcionando",
        ciudad: "La Paz - Bolivia",
      })
    );
  }
  // LISTAR registros (GET)
  else if (method === "GET" && url === "/registro") {
    const sql = "SELECT * FROM registros ORDER BY fecha DESC";
    db.query(sql, (err, results) => {
      if (err) {
        res.writeHead(500);
        res.end(
          JSON.stringify({ error: "Error consultando la base de datos" })
        );
      } else {
        res.writeHead(200);
        res.end(JSON.stringify(results));
      }
    });
  }
  // AGREGAR registro (POST)
  else if (method === "POST" && url === "/registro") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { nombre, email, mensaje } = data;
        if (!nombre || !email || !mensaje) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Faltan campos requeridos" }));
          return;
        }
        const sql =
          "INSERT INTO registros (nombre, correo, mensaje) VALUES (?, ?, ?)";
        db.query(sql, [nombre, email, mensaje], (err, result) => {
          if (err) {
            console.error("Error insertando en la BD:", err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Error en la base de datos" }));
          } else {
            console.log("Datos insertados correctamente:", result.insertId);
            res.writeHead(201);
            res.end(
              JSON.stringify({ mensaje: "Formulario recibido y guardado" })
            );
          }
        });
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "JSON inválido" }));
      }
    });
  }
  // ACTUALIZAR registro (PUT)
  else if (method === "PUT" && url === "/actualizar") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const { id, nombre, email, mensaje } = data;
        if (!id || !nombre || !email || !mensaje) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Faltan campos requeridos" }));
          return;
        }
        const sql =
          "UPDATE registros SET nombre = ?, correo = ?, mensaje = ? WHERE id = ?";
        db.query(sql, [nombre, email, mensaje, id], (err, result) => {
          if (err) {
            console.error("Error actualizando en la BD:", err);
            res.writeHead(500);
            res.end(
              JSON.stringify({ error: "Error actualizando en la base de datos" })
            );
          } else {
            res.writeHead(200);
            res.end(
              JSON.stringify({ mensaje: "Registro actualizado correctamente" })
            );
          }
        });
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "JSON inválido" }));
      }
    });
  }
  // ELIMINAR registro (DELETE)
  else if (method === "DELETE" && url === "/eliminar") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const { id } = JSON.parse(body);
        if (!id) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Falta el ID para eliminar" }));
          return;
        }
        const sql = "DELETE FROM registros WHERE id = ?";
        db.query(sql, [id], (err, result) => {
          if (err) {
            res.writeHead(500);
            res.end(
              JSON.stringify({ error: "Error eliminando en base de datos" })
            );
          } else {
            res.writeHead(200);
            res.end(
              JSON.stringify({ mensaje: "Registro eliminado correctamente" })
            );
          }
        });
      } catch {
        res.writeHead(400);
        res.end(JSON.stringify({ error: "JSON inválido" }));
      }
    });
  }
  // Ruta no definida
  else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Ruta o método no válido" }));
  }
});

server.listen(3000, () => {
  console.log("✅ Servidor Node.js corriendo en http://localhost:3000");
});
