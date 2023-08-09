const express = require("express")
const app = express()
const mysql = require("mysql")
const bcrypt = require("bcrypt")
require('dotenv').config({ path: '../.env' })
const generateAccessToken = require("./generateAccessToken")
const generateRefreshToken = require("./generateRefreshToken")

const PORT = process.env.PORT

const db = mysql.createPool({
   connectionLimit: 100,
   host: process.env.HOST,
   user: process.env.USER,
   password: process.env.PASSWORD,
   database: process.env.DATABASE,
   port: process.env.DB_PORT
})

db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connectada exitosamente: " + connection.threadId)
})

app.listen(PORT, ()=> console.log(`Server Started on port ${PORT}...`))

app.use(express.json())

//CREATE USER
app.post("/newUser", async (req, res) => {
    const alumnoDNI = req.body.alumnoDNI;
    const user = req.body.user;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const profeDNI = req.body.profeDNI;

    db.getConnection(async (err, connection) => {
        if (err) throw (err)
        const sqlSearch1 = "SELECT * FROM usuarios WHERE alumnoDNI = ?"
        const sqlSearch2 = " OR profeDNI = ?"
        const search_query1 = mysql.format(sqlSearch1, [alumnoDNI], sqlSearch2, [profeDNI])
        const sqlSearch3 = "SELECT * FROM usuarios WHERE username = ?"
        const search_query2 = mysql.format(sqlSearch3, [user])
        const sqlInsert = "INSERT INTO usuarios VALUES (0,?,?,?,?)"
        const insert_query = mysql.format(sqlInsert, [alumnoDNI, user, hashedPassword, profeDNI])
        let usuario = 0
        let nombreUsuario = 0


        //verificamos que el usuario no este previamente registrado
            
               await connection.query(search_query1, async(err, result) => {   
                
                if (err) throw (err)
                console.log("------> Buscando Resultados")
                console.log(result.length)
                if (result.length != 0) {
                    connection.release()
                    console.log("------> Usuario ya existe")
                    res.sendStatus(409)
                    usuario = (result.length)           
                    }

                    //verificamos que el nombre de usuario este disponible

                    else if (result.length == 0) {
     
                        await connection.query(search_query2, async(err, result) => {   
                            
                            if (err) throw (err)
                            console.log("------> Verificando nombre de usuario")
                            console.log(result.length)
    
                                if (result.length !== 0) {
                                    connection.release()
                                    console.log("------> El nombre de usuario no se encuentra disponible")
                                    res.sendStatus(409)      
                                    nombreUsuario = (1)
                                } 

                                //Ingresamos el usuario 

                                else {

                                    await connection.query(insert_query, (err, result) => {
                                        connection.release()
                                        if (err) throw (err)
                                        console.log("--------> Nuevo Usuario Creado")
                                        console.log(result.insertId)
                                        res.sendStatus(201)
                                        })
                                    }     
                        })
                    }               
                })               
        }) 
    }) 


 //LOGIN (AUTHENTICATE USER)

app.post("/login", (req, res) => {
    const user = req.body.user
    const password = req.body.password
    db.getConnection(async (err, connection) => {
        if (err) throw (err)
        const sqlSearch = "SELECT * FROM usuarios WHERE username = ?"
        const search_query = mysql.format(sqlSearch, [user])
        await connection.query(search_query, async (err, result) => {
            connection.release()
            if (err) throw (err)
            if (result.length == 0) {
                console.log("--------> User does not exist")
                res.sendStatus(404)
            }
            else {
                const hashedPassword = result[0].pass

                if (await bcrypt.compare(password, hashedPassword)) {
                    console.log("---------> Login Successful")
                    console.log("---------> Generating accessToken")
                    const accessToken = generateAccessToken({ username: user })
                    const refreshToken = generateRefreshToken({ username: user })
                    console.log("---------> ", user, "has been successfully logged in!!!")
                    res.json ({accessToken: accessToken, refreshToken: refreshToken})

                } 
                else {
                    console.log("---------> Password Incorrect")
                    res.send("Password incorrect!")
                } 
            }
        })
    })
})


  