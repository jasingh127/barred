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
var winston = require('winston')
require('winston-daily-rotate-file');

var app = express();
app.set('port', process.env.PORT || 3001);
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static(__dirname));
var cors = require('cors');
app.use(cors());

/***************************************************************************
// Logger
***************************************************************************/
var logger_directory = path.join(__dirname, 'logs/');
if (!fs.existsSync(logger_directory)){
    fs.mkdirSync(logger_directory);
}

const tsFormat = () => (new Date()).toLocaleTimeString();
var transport = new winston.transports.DailyRotateFile({
  localTime: true,
  json: false,
  timestamp: tsFormat,
  dirname: logger_directory,
  filename: 'log.txt',
  datePattern: 'yyyy-MM-dd_',
  maxFiles: 5,
  prepend: true
});

logger = new (winston.Logger)({ // global logger variable
  transports: [
    transport
  ]
});

/***************************************************************************
// Connection to the local Sqlite Database
***************************************************************************/
// db = new sqlite.Database(path.join(__dirname, 'data/barred_table.db')); // global db variable
db = new sqlite.Database(':memory:'); // global db variable

/***************************************************************************
// Remote iTrak Sql server 2008 Database Configuration
***************************************************************************/
iTrak_config = {
    user: 'sa',
    password: 'DV_T3lab',
    server: 'WIN-I5VRPHUHFTF',
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

/***************************************************************************
// Periodic DB Update Function
***************************************************************************/
routes.sync_database(); // run once immediately, then run periodically

setInterval(function () {
  routes.sync_database();

}, 20 * routes.MILLISEC_PER_MIN); // runs every 20 minutes

app.listen(app.get('port'), function(){
  console.log("Casino barred customers app listening on port " + app.get('port'));
});
