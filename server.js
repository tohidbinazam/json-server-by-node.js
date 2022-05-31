import http from 'http'
import { readFileSync, writeFileSync } from 'fs'
import dotenv from 'dotenv'

// environment init
dotenv.config();
const PORT = process.env.SERVER_PORT;
const APP_NAME = process.env.APP_NAME;

// Data management
const students_json = readFileSync('./data/students.json');
const students_obj = JSON.parse(students_json);

http.createServer((req, res) => {

    // Routing
    if(req.url == '/api/students' && req.method == 'GET'){

        res.writeHead(200, { 'Content-Type' : 'application/json'})
        res.end(students_json)

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'GET'){

        let id = req.url.split('/')[3]
        let student = students_obj.find(stu => stu.id == id)
        res.writeHead(200, { 'Content-Type' : 'application/json'})
        res.end(JSON.stringify(student))

    }else if(req.url == '/api/students' && req.method == 'POST'){

        // Find Previous ID and set new Id
        let id = students_obj[0].id + 1

        // Req data handle
        let data = ''
        req.on('data', (chunk) => {
          data += chunk.toString();
        })

        // New data set event
        req.on('end', () => {
            let student = JSON.parse(data)
            students_obj.unshift({ id:id, ...student })
            writeFileSync('./data/students.json', JSON.stringify(students_obj))
        })

        res.writeHead(200, { 'Content-Type' : 'application/json'})
        res.end('Student data add successfully')

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'PATCH' || req.method == 'PUT'){

        // Student id
        let id = req.url.split('/')[3]

        let data = ''
        req.on('data', (chunk) => {
            data += chunk.toString();
        })

        req.on('end', () => {
            let student = JSON.parse(data)
            let index = students_obj.findIndex(stu => stu.id == id)
            
            students_obj[index] = { id:id, ...student }
            writeFileSync('./data/students.json', JSON.stringify(students_obj))
        })

        res.writeHead(200, { 'Content-Type' : 'application/json'})
        res.end('Student data edit successfully')

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'DELETE'){

        let id = req.url.split('/')[3]
        let student = JSON.stringify(students_obj.filter(stu => stu.id != id))
        let deleted_student = JSON.stringify(students_obj.find(stu => stu.id == id))

        writeFileSync('./data/students.json', student)
        res.writeHead(200, { 'Content-Type' : 'application/json'})
        res.end(deleted_student)

    }else{
        res.writeHead(200, { 'Content-Type' : 'application/json'})
        res.end('invalid Route')
    }

}).listen(5050, () => {
    console.log(`${ APP_NAME } IS RUNNING ON PORT ${ PORT }`);
})