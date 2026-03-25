const express = require("express")
const db = require("./db.js")
const bcr = require ("bcryptjs")
const app = express()
app.use(express.json())

const PORT = 3000
app.get("/", (req,res)=>{
    res.status(200).json({
        message: "Hello world"
    })
})
app.get("/users", (req,res)=>{
    try{
        const users = db 
            .prepare('SELECT * FROM users')
            .all()
        return res.status(200).json(users) 
    }catch (error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommething went wrong"})
    }
})
app.get("/todos", (req,res)=>{
    try{
        const todos = db 
            .prepare('SELECT * FROM todos')
            .all()
        return res.status(200).json(todos) 
    }catch (error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommething went wrong"})
    }
})

app.post("/register",(req,res)=>{
    try{
        const {email,name,password} = req.body
        if (!email || !name || !password)
            return res 
                .status(400)
                .json({error: "Missing fields"})

        const salt  =bcr.genSaltSync(10)
        const hash = bcr.hashSync(password,salt)

        const info = db.prepare("INSERT INTO users(email,name, password)VALUES(?, ?, ?)")
            .run(email,name,hash)
        const user = db 
            .prepare("SELECT * FROM users WHERE id = ? ")
            .get(info.lastInsertRowid)
        const {password: _, ...safeUser} = user
        return res.status(201).json(safeUser)
    }catch (error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommething went wrong"})

    }

})
app.post("/todos",(req,res)=>{
    try{
        const {status,name} = req.body
        if (!status || !name)
            return res 
                .status(400)
                .json({error: "Missing fields"})
        const info = db.prepare("INSERT INTO todos(status,name)VALUES(?, ?)")
            .run(status,name)
        const todos = db 
            .prepare("SELECT * FROM todos WHERE id = ? ")
            .get(info.lastInsertRowid)
        return res.status(201).json(todos)
    }catch (error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommething went wrong"})

    }

})


app.post ("/login", (req,res)=> {
    try{
        const {email,password} = req.body
        if (!email || !password)
            return res  
                .status(400)
                .json({error: "Missing fields"})
    }catch (error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommeting went wrong"})
    }
    const user = db 
        .prepare  ("SELECT * FROM users WHERE email = ?")
        .get(email)
})

app.delete("/users/:id", (req,res)=>{
    try{
        const {id} = req.params

        if (!id) res.status(400)
            .json({error: "Missing ID "})        
        const query = db
            .prepare("DELETE FROM users WHERE id = ?")
            .run(id)
        if (query.changes ===0)return res
            .status(404)
            .json({error: "User not found"})
        return res.status(200).json ( {message: "User deleted"})
    }catch(error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommething went wrong"})
    }
})

app.delete("/todos/:id", (req,res)=>{
    try{
        const {id} = req.params

        if (!id) res.status(400)
            .json({error: "Missing ID "})        
        const query = db
            .prepare("DELETE FROM todos WHERE id = ?")
            .run(id)
        if (query.changes ===0)return res
            .status(404)
            .json({error: "todos not found"})
        return res.status(200).json ( {message: "todos deleted"})
    }catch(error){
        console.error(error)
        res
            .status(500)
            .json({error: "Sommething went wrong"})
    }
})

app.listen(PORT)