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

exports.fetchITrackData = function(res) {
  // To be added
  // Connect to ITrack database and read the right table
}

/************************************************************************
 Some utility functions + Global variables
 ************************************************************************/
exports.MILLISEC_PER_MIN = 60000;
exports.MILLISEC_PER_DAY = 86400000;

exports.random_int = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 

/************************************************************************
Function to sync our sqlite database with the iTrak database.
************************************************************************/
exports.sync_database = function() {
  console.log("Syncing local db with iTrak db");

  db.serialize( function() {
    // Create db table to hold customer data if it doesn't exist
    var query = "CREATE TABLE IF NOT EXISTS PROFILES  (status TEXT, \
                                                       subject_id INTEGER PRIMARY KEY, \
                                                       first_name TEXT, \
                                                       last_name TEXT, \
                                                       dob TEXT, \
                                                       age INTEGER)";
    db.run(query)

    // Initially let's populate with some fake data
    // Later change this with streaming data from iTrak

    var fake_profiles = [["Barred", 1, "Alok", "Mehta", "10/10/1980", 31], 
                         ["Default", 2, "Alok", "Gupta", "10/10/1980", 32],
                         ["Self-Barred", 5, "Alok", "Jain", "10/10/1980", 33],
                         ["Banned", 6, "Amit", "Kumar", "10/10/1980", 38],
                         ["Default", 9, "Amit", "Mehta", "10/10/1980", 48]]

    var stmt = db.prepare("REPLACE INTO PROFILES VALUES (?, ?, ?, ?, ?, ?)");
    for (var i = 0; i < fake_profiles.length; i++) {
    	var p = fake_profiles[i]
      stmt.run(p[0], p[1], p[2], p[3], p[4], p[5]);
    }

  })
}