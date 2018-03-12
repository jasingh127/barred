// Client side code
var DbUtil = {
  // Fetch customer record for the given first and last name
  fetchCustomer: function (params, callback) {
    $.post(MiscUtil.db_server_address + "/fetchCustomer", 
      params,
      function(data, status){
        if (data === undefined) {
          console.log("No Customer Data");
        }
        // console.log(data)

        var matching_entries = []
        for (var i = 0; i < data["rows"].length; i++) {
          var entry = data["rows"][i]
          matching_entries.push([
            entry["status"], 
            entry["subject_id"],
            entry["first_name"], 
            entry["middle_name"],
            entry["last_name"], 
            entry["gender"],
            entry["dob"]])
        }
          // console.log(matching_entries)

        callback(matching_entries);
      });
  }
}