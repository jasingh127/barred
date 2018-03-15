 // Client side code
 var MiscUtil = {
  /**
  Misc Utility constants and methods
  **/

  // =====================================================================
  // MODIFY THIS WHEN SETTING UP FOR THE FIRST TIME
  // =====================================================================

  db_server_address: "http://" + "10.0.0.34" + ":3001",
  
  date_to_str: function(date) {
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var day_names = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", 
      "November", "December"];
    var date_str = day_names[date.getDay()] + ", " + date.getDate() + " " + month_names[date.getMonth()] 
      + ", " + date.getFullYear()
    return date_str
  },

  // =====================================================================
  date_picker_helper: function(element_id, on_select_callback) {
      $(element_id).datepicker({
        dateFormat: "DD, d MM, yy",
        showOtherMonths: true,
        selectOtherMonths: true,
        autoclose: true,
        changeMonth: true,
        changeYear: true,
        beforeShow: function (input, inst) {
          setTimeout(function () {
            var offsets = $(element_id).offset();
            var h = $(element_id).outerHeight();
            inst.dpDiv.css({
              top: offsets.top + h,
              left: offsets.left
            });
          },0);
        },
        onSelect: function(dateText) {
          var date = $(this).datepicker('getDate');
          on_select_callback(date);
        }      
      });
    }

}