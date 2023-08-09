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
  res.send('bienvenido a la seccion de profesores!');
});

console.log('servidor escuchando en el puerto', PORT)
app.listen(PORT, 'localhost')


/* ------------------- obtenemos todos los profesores ------------------- */


app.get('/profesores', (req, res) => {
    const sql = 'SELECT * FROM profesores';
  
    connection.query(sql, (error, results) => {
      if (error) throw error;
      if (results.length > 0) {
        res.json(results);
      } else {
        res.send('No hay datos');
      }
    });
  });


  /* ------------------- obtenemos un profesor en especifico ------------------- */


app.get('/profesores/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM profesores WHERE profeID = ${id}`;
    connection.query(sql, (error, result) => {
      if (error) throw error;
  
      if (result.length > 0) {
        res.json(result);
      } else {
        res.send('No hay datos');
      }
    });
  });
  
  
  /* ------------------- agregamos un profesor nuevo ------------------- */


  app.post('/add', (req, res) => {
    
  //verificamos que el profesor no este previamente registrado

    const sqlSearch = "SELECT * FROM profesores WHERE profeName = ?"
    const nombre = req.body.nombre;
    const insertQuery = 'INSERT INTO profesores SET ?';
    
    const alumnoObj = {
      profeName: req.body.nombre,
      profeLastName: req.body.apellido,
      profeDNI: req.body.DNI
    };

   connection.query(sqlSearch, nombre, (error, result) => {

      if (error) throw error;
      console.log("------> Buscando Resultados");
      console.log(result.length);
      if (result.length != 0) {

        console.log("------> Profesor ya existe");
        res.sendStatus(409);

      } else {

          connection.query(insertQuery, alumnoObj, error => {

              if (error) throw error;
              res.send('Profesor insertado');

          });
        
      }

    });
  
  });


/* ------------------- modificacion de los datos de un usuario ------------------- */

app.put('/update/:id', (req, res) => {
  const { nombre, apellido, DNI } = req.body;
  const sql = `UPDATE profesores 
                SET profeName = '${nombre}',
                    profeLastName ='${apellido}',
                    profeDNI = '${DNI}'
              WHERE profeID = ${req.params.id}`;
    connection.query(sql, error => {
    if (error) throw error; 
    res.send('profesor modificado!');
  });
});

/* ------------------- eliminamos los datos de un profesor ------------------- */

app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM profesores WHERE profeID = ${id}`;

  connection.query(sql, error => {
    if (error) throw error;
    res.send('profesor borrado');
  });
}); 