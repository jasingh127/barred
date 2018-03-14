// Server side code

/************************************************************************
 Rest API for getting HTML views.
 ************************************************************************/

exports.index = function(req, res){
  res.sendFile('index.html', {root: __dirname + '/../html'});
};

/************************************************************************
 Rest API for Database operations.
 ************************************************************************/

exports.fetchCustomer = function(req, res) {
  // console.log(req.body)
  var first_name = req.body.first_name
  var last_name = req.body.last_name
  
  // Query database
  if (!first_name) {
    db.all("SELECT * FROM PROFILES WHERE UPPER(REPLACE(last_name, ' ', '')) = UPPER(REPLACE(?, ' ', ''))", 
        last_name,
        function (err, rows) {
          if (err) {
            console.log(errr)
          }
          res.json({"rows": rows})
        }
      );
  }
  else if (!last_name) {
    db.all("SELECT * FROM PROFILES WHERE UPPER(REPLACE(first_name, ' ', '')) = UPPER(REPLACE(?, ' ', ''))", 
        first_name,
        function (err, rows) {
          if (err) {
            console.log(err)
          }
          res.json({"rows": rows})
        }
      );
  }
  else {
    db.all("SELECT * FROM PROFILES WHERE \
      UPPER(REPLACE(first_name, ' ', '')) = UPPER(REPLACE(?, ' ', '')) \
      AND UPPER(REPLACE(last_name, ' ', '')) = UPPER(REPLACE(?, ' ', ''))", 
      first_name, last_name,
      function (err, rows) {
        if (err) {
          console.log(err)
        }
        res.json({"rows": rows})
      }
    );
  }
}

/************************************************************************
 Some utility functions + Global variables
 ************************************************************************/
exports.MILLISEC_PER_MIN = 60000;
exports.MILLISEC_PER_DAY = 86400000;

exports.random_int = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 

exports.format_date = function(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (year == 1899) {
      return 'Unknown'
    }

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

exports.insert_rows_into_database = function(rows) {
    db.serialize( function() {
    // Create db table to hold customer data if it doesn't exist
    var query = "CREATE TABLE IF NOT EXISTS PROFILES  (status TEXT, \
                                                       subject_id INTEGER PRIMARY KEY, \
                                                       first_name TEXT, \
                                                       middle_name TEXT, \
                                                       last_name TEXT, \
                                                       gender TEXT, \
                                                       dob TEXT)";
    db.run(query)

    var stmt = db.prepare("REPLACE INTO PROFILES VALUES (?, ?, ?, ?, ?, ?, ?)")
    for (var i = 0; i < rows.length; i++) {
      var status = rows[i]["Category"]
      var subject_id = rows[i]["SubjectId"]
      var first_name = rows[i]["FirstName"]
      var middle_name = rows[i]["MiddleName"]
      var last_name = rows[i]["LastName"]
      var gender = rows[i]["Gender"]
      var dob = exports.format_date(rows[i]["DateOfBirth"])

      stmt.run(status, subject_id, first_name, middle_name, last_name, gender, dob)
    }
  })
}

exports.fetch_iTrak_data = function(callback) {
  console.log("Fetching iTrak data")

  new mssql.ConnectionPool(iTrak_config).connect().then(pool => {
    return pool.request().query(
      "select Category, SubjectId, FirstName, MiddleName, LastName, Gender, DateOfBirth \
      from dbo.SubjectProfile where Category in \
      ('Banned', 'Banned Guest', 'Barred', 'Barred Patron', 'BOLO', \
      'Re-Barred', 'Reinstated', 'Re-Reinstated', \
      'Self-Barred', 'Warning', 'Warned', 'Watch')")
  }).then(result => {
    let rows = result.recordset
    console.log('Fetched ' + rows.length + ' rows of data from iTrak')
    callback(rows)
    mssql.close();
  }).catch(err => {
    console.log("Failed to fetch records from iTrak..")
    console.log(err)
    let rows = []
    callback(rows)
    mssql.close();
  });

}

/************************************************************************
Function to sync our sqlite database with the iTrak database.
************************************************************************/
exports.sync_database = function() {
  console.log("Syncing local db with iTrak db");
  exports.fetch_iTrak_data(exports.insert_rows_into_database)
}