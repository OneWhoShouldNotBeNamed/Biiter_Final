const express = require('express')
const mysql = require('mysql')
const bodyParser= require('body-parser')
var cors = require('cors')

const { promisify } = require('util');

app = express()
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cors())

require('./routes/user.routes.js')(app);
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'biiter'
});
connection.connect(function(err) {
    if (err) {
      return console.error('error: ' + err.message);
    }
   
    console.log('Connected to the MySQL server.');
  });  

var query=promisify(connection.query).bind(connection);  
port = process.env.PORT || 5150;
app.listen(port);
console.log('Listing on Port :'+ port)

exports.query=promisify(connection.query).bind(connection);
/*
app.post('/',(req,res)=>
{
    return res.json({
        msg: ('Post')
      })
})
app.get('/',async (req,res)=>
{
    let a = await query('select * from users')
      return res.json({
        msg: a
      })
})*/

