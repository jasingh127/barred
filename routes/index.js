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
    db.all("SELECT * FROM PROFILES WHERE UPPER(last_name) = UPPER(?)", 
        last_name,
        function (err, rows) {
          res.json({"rows": rows})
        }
      );
  }
  else if (!last_name) {
    db.all("SELECT * FROM PROFILES WHERE UPPER(first_name) = UPPER(?)", 
        first_name,
        function (err, rows) {
          res.json({"rows": rows})
        }
      );
  }
  else {
    db.all("SELECT * FROM PROFILES WHERE UPPER(first_name) = UPPER(?) AND UPPER(last_name) = UPPER(?)", 
      first_name, last_name,
      function (err, rows) {
        res.json({"rows": rows})
      }
    );
  }
}

exports.fetchITrakData = function(req, res) {
  // Connect to ITrack database and read the right table
  res.send("Refactor and copy code for this")
}

/************************************************************************
 Some utility functions + Global variables
 ************************************************************************/
exports.MILLISEC_PER_MIN = 60000;
exports.MILLISEC_PER_DAY = 86400000;

exports.random_int = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
                                                       dob TEXT, \
                                                       age INTEGER)";
    db.run(query)

    // // Initially let's populate with some fake data
    // // Later change this with streaming data from iTrak

    // var fake_profiles = [["Barred", 1, "Alok", "Mehta", "10/10/1980", 31], 
    //                      ["Default", 2, "Alok", "Gupta", "10/10/1980", 32],
    //                      ["Self-Barred", 5, "Alok", "Jain", "10/10/1980", 33],
    //                      ["Banned", 6, "Amit", "Kumar", "10/10/1980", 38],
    //                      ["Default", 9, "Amit", "Mehta", "10/10/1980", 48]]

    // var stmt = db.prepare("REPLACE INTO PROFILES VALUES (?, ?, ?, ?, ?, ?)");
    // for (var i = 0; i < fake_profiles.length; i++) {
    //   var p = fake_profiles[i]
    //   stmt.run(p[0], p[1], p[2], p[3], p[4], p[5]);
    // }

    var stmt = db.prepare("REPLACE INTO PROFILES VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    for (var i = 0; i < rows.length; i++) {
      var status = rows[i]["Category"]
      var subject_id = rows[i]["SubjectId"]
      var first_name = rows[i]["FirstName"]
      var middle_name = rows[i]["MiddleName"]
      var last_name = rows[i]["LastName"]
      var gender = rows[i]["Gender"]
      var dob = rows[i]["DateOfBirth"]
      var age = rows[i]["AgeRangeLower"]

      stmt.run(status, subject_id, first_name, middle_name, last_name, gender, dob, age)
    }
  })
}

/************************************************************************
Function to sync our sqlite database with the iTrak database.
************************************************************************/
exports.sync_database = function() {
  console.log("Syncing local db with iTrak db");

  mssql.connect(iTrak_config, err => {
    // ... error checks
    var rows = []
 
    const request = new mssql.Request()
    request.stream = true // You can set streaming differently for each request
    request.query('select Category, SubjectId, FirstName, MiddleName, LastName, Gender, DateOfBirth, AgeRangeLower from dbo.SubjectProfile')
 
    request.on('row', row => {
        rows.push(row)
    })
 
    request.on('error', err => {
        console.log(err)
    })
 
    request.on('done', result => {
        // Always emitted as the last one
        console.log('Fetched ' + rows.length + ' rows of data from iTrak')

        // Now insert this data into our local sqlite database
        exports.insert_rows_into_database(rows)
    })
  })
 
  mssql.on('error', err => {
    console.log(err)
  })

}