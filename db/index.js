//mysql

/*const mysql = require('mysql');

var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "forum"
});

db.connect(function(err) {
if (err) throw err;  
});

module.exports = db;*/



//postgress
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://nborfrctemrqdh:7fe6fbcc86435e42c6c71605af540e07acbac7199d9b87d0614cb6e2b344fdc9@ec2-54-170-123-247.eu-west-1.compute.amazonaws.com:5432/dmi20ravijldi?ssl=true',
  //connectionString: process.env.DATABASE_URL
})

module.exports = {
  query: (text, params) => pool.query(text, params),
}