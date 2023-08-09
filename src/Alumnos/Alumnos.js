const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({ path: '../.env' });

const app = express();

app.use(bodyParser.json());


const PORT = process.env.PORT;

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});


app.get('/', (req, res) => { 
  res.send('bienvenido a la seccion de alumnos!');
});

console.log('servidor escuchando en el puerto', PORT)
app.listen(PORT, 'localhost')


/* ------------------- obtenemos todos los alumnos ------------------- */

app.get('/alumnos', (req, res) => {
    const sql = 'SELECT * FROM alumnos';
  
    connection.query(sql, (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json(results);
      } else {
        res.send('No hay datos');
      }
    });
  });


/* ------------------- obtenemos un alumno en especifico ------------------- */

app.get('/alumnos/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM alumnos WHERE alumnoID = ${id}`;
    connection.query(sql, (error, result) => {
      if (error) throw error;
  
      if (result.length > 0) {
        res.json(result);
      } else {
        res.send('No hay datos');
      }
    });
  });
  
  
  /* ------------------- agregamos un usuairo nuevo ------------------- */


  app.post('/add', (req, res) => {
    
  //verificamos que el usuario no este registrado

    const sqlSearch = "SELECT * FROM alumnos WHERE alumnoName = ?"
    const nombre = req.body.nombre;
    const insertQuery = 'INSERT INTO alumnos SET ?';
    
    const alumnoObj = {
      alumnoName: req.body.nombre,
      alumnoLastName: req.body.apellido,
      alumnoDNI: req.body.DNI
    };

   connection.query(sqlSearch, nombre, (error, result) => {

      if (error) throw error;
      console.log("------> Buscando Resultados");
      console.log(result.length);
      if (result.length != 0) {

        console.log("------> Alumno ya existe");
        res.sendStatus(409);

      } else {

          connection.query(insertQuery, alumnoObj, error => {

              if (error) throw error;
              res.send('alumno insertado');

          });
        
      }

    });
  
  });



/* ------------------- modificacion de los datos de un usuario ------------------- */

app.put('/update/:id', (req, res) => {
  const { nombre, apellido, DNI } = req.body;
  const sql = `UPDATE alumnos 
              SET alumnoName = '${nombre}',
                alumnoLastName ='${apellido}',
                  alumnoDNI = '${DNI}'
              WHERE alumnoID = ${req.params.id}`;
    connection.query(sql, error => {
    if (error) throw error; 
    res.send('alumno modificado!');
  });
});

/* ------------------- eliminamos de los datos de un alumno ------------------- */

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM alumnos WHERE alumnoID = ${id}`;

  connection.query(sql, error => {
    if (error) throw error;
    res.send('alumno borrado');
  });
});
 