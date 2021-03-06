//this will genrate every tabel from the db
var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var database = {};

function requestDatabaseInformationReadOnly() {

    $.post("/read_only", null, function (data, status, xhr) {
        if (data) {
            document.getElementById("readOnly").style.display = "block";
        } else {
            document.getElementById("writeOnly").style.display = "block";
        }
    });
    const queryString = window.location.search.replace("?userKey=", "");

    $.get("/insurance_page?userKey=" + encodeURIComponent(queryString), function (data, status) {
        database = data
        console.log(database);

        personalizePage();
        generatePlanTable();
        generateInvoiceTable();
        generateRefundTable();
    });
}

function personalizePage() {
    //make the welcome text say the name of the firm
    document.getElementById("userInfo").innerHTML += database.Firm[0][1].value;
    //now get the address of the user
    document.getElementById("contactInfo").innerHTML += "<div style='float:right;margin-left:15px;'>" + database.Contact[0][1].value + "<br>" + database.Contact[0][2].value + "," + database.Contact[0][3].value + " " + database.Contact[0][4].value + "</div><div style='float:left;'> Phone: " + database.Contact[0][5].value + "<br> Email: " + database.Contact[0][6].value + "</div>";
    //set insurance to none if the id is null
    document.getElementById("insuranceInfo").innerHTML += database.Patient.length + "<br>Patient(s) using insurance plans";
}

function payOutstandingInvoice(index) {
    if (confirm("Are you sure you wish to pay the invoice portion?")) {
        $.post("/pay_insurance", {
            patient: database.Invoice[index][0].value,
            doctor: database.Invoice[index][1].value,
            time: database.Invoice[index][2].value,
            treatment: database.Invoice[index][3].value,
            drug: database.Invoice[index][4].value,
        }, function (data, status, xhr) {
            if (Object.keys(data).length == 0) {
                alert("The payment is being processed, the patient has been notfied!");
                location.reload();
            } else {
                alert(data);
            }
        });
    }
}

function acceptOutstandingRefund(index) {
    if (confirm("Are you sure you wish to accept this refund?")) {
        $.post("/accept_refund", {
            id: database.Refund[index][0].value
        }, function (data, status, xhr) {
            if (Object.keys(data).length == 0) {
                alert("The refund is being processed, it might take up to 24 hours.");
                location.reload();
            } else {
                alert(data);
            }
        });
    }
}

function generatePlanTable() {
    if (database.Plan.length > 0) {
        var outputHtml = "<div class='Table'> <table> <tr>";
        for (var i = 1; i < database.Plan[0].length - 1; i++) {
            outputHtml += "<th>" + database.Plan[0][i].metadata.colName + "</th>";
        }
        outputHtml += "</tr>";
        //iterate through the User table
        for (var i = 0; i < database.Plan.length; i++) {
            // for each row (unique user)
            outputHtml += "<tr>";
            for (var j = 1; j < database.Plan[i].length - 1; j++) {
                // for each data point
                outputHtml += "<td>" + database.Plan[i][j].value + "</td>";
            }
            outputHtml += "</tr>";
        }
        outputHtml += "</table> </div>";
        //add it to the div
        document.getElementById("planTable").innerHTML += outputHtml;
    }
}

function generateInvoiceTable() {
    if (database.Invoice.length > 0) {
        var outputHtml = "<div class='Table'> <table> <tr>";
        for (var i = 0; i < database.Invoice[0].length; i++) {
            outputHtml += "<th>" + database.Invoice[0][i].metadata.colName + "</th>";
        }
        outputHtml += "<th>Pay</th></tr>";
        //iterate through the User table
        for (var i = 0; i < database.Invoice.length; i++) {
            // for each row (unique user)
            outputHtml += "<tr>";
            for (var j = 0; j < database.Invoice[i].length; j++) {
                // for each data point
                outputHtml += "<td>" + database.Invoice[i][j].value + "</td>";
            }
            outputHtml += '<td><button type="button" onclick="payOutstandingInvoice(' + i + ')" >Pay Invoice</button></td></tr>';
        }
        outputHtml += "</table> </div>";
        //add it to the div
        document.getElementById("invoiceTable").innerHTML += outputHtml;
    }
}

function generateRefundTable() {
    if (database.Refund.length > 0) {
        var outputHtml = "<div class='Table'> <table> <tr>";
        for (var i = 0; i < database.Refund[0].length; i++) {
            outputHtml += "<th>" + database.Refund[0][i].metadata.colName + "</th>";
        }
        outputHtml += "<th>Pay</th></tr>";
        //iterate through the User table
        for (var i = 0; i < database.Refund.length; i++) {
            // for each row (unique user)
            outputHtml += "<tr>";
            for (var j = 0; j < database.Refund[i].length; j++) {
                // for each data point
                outputHtml += "<td>" + database.Refund[i][j].value + "</td>";
            }
            outputHtml += '<td><button type="button" onclick="acceptOutstandingRefund(' + i + ')" >Accept Refund</button></td></tr>';
        }
        outputHtml += "</table> </div>";
        //add it to the div
        document.getElementById("refundTable").innerHTML += outputHtml;
    }
}