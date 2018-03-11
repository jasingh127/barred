// Main Server side application code

/***************************************************************************
// Module dependencies
***************************************************************************/
var express = require('express');
var routes = require('./routes');
path = require('path'); // global path variable
sqlite = require('sqlite3').verbose(); // global sqlite variable
fs = require('fs'); // global fs variable
mssql = require('mssql'); // global mssql variable

var app = express();
app.set('port', process.env.PORT || 3001);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname));
var cors = require('cors');
app.use(cors());

/***************************************************************************
// Connection to the local Sqlite Database
***************************************************************************/
db = new sqlite.Database(path.join(__dirname, 'data/barred_table.db')); // global db variable

/***************************************************************************
// Remote iTrak Sql server 2008 Database Configuration
***************************************************************************/
iTrak_config = {
    user: 'sa',
    password: 'DV_T3lab',
    server: 'WIN-I5VRPHUHFTF', // You can use 'localhost\\instance' to connect to named instance
    database: 'iXData',
    port: 1433,
    options: {
        encrypt: false
    }
}

/***************************************************************************
// REST API
***************************************************************************/
app.get('/', routes.index);
app.post('/fetchCustomer', routes.fetchCustomer);
app.get('/fetchITrakData', routes.fetchITrakData);  // Just for testing direct data reading, remove later

/***************************************************************************
// Periodic DB Update Function
***************************************************************************/
routes.sync_database(); // run once immediately, then run periodically

setInterval(function () {
  routes.sync_database();

}, 10 * routes.MILLISEC_PER_MIN); // runs every 10 minutes

app.listen(app.get('port'), function(){
  console.log("Casino barred customers app listening on port " + app.get('port'));
});
