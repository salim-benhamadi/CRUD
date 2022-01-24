const mysql = require("mysql");
const express = require("express");
var methods = require("./methodTokens");
var app = express();
let jwt = require("jsonwebtoken");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var mysqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345678",
  database: "employeeDB",
  port: "3306",
  multipleStatements: true,
});

mysqlConnection.connect((err) => {
  if (!err) console.log("DB connection succeded");
  else {
    console.log("DB conncection failed");
    console.log(err);
  }
});

const username = "salim";
const password = "123456";

app.post("/", (req, res, next) => {
  let p_username = req.body.username;
  let p_password = req.body.password;
  if (p_username == username && p_password == password) {
    var token = jwt.sign(
      { username: username },

      "secretkey",
      { expiresIn: "15m" },
      (err, token) => {
        res.send({
          ok: true,
          token: token,
          message: "Login successful",
        });
      }
    );
  } else {
    res.send({
      ok: false,
      message: "Username or password incorrect",
    });
  }
});

// Get all the employees

app.get("/employees", methods.ensureToken, (req, res) => {
  mysqlConnection.query("SELECT * FROM employee", (err, rows, fields) => {
    if (!err) res.send(rows);
    else console.log(err);
  });
});

// Get an employee

app.get("/employees/:id", methods.ensureToken, (req, res) => {
  //   console.log(req.params.id);
  mysqlConnection.query(
    "SELECT * FROM employee WHERE EmpID = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (!err) res.send(rows);
      else console.log(err);
    }
  );
});

// Delete an employee

app.delete("/employees/:id", methods.ensureToken, (req, res) => {
  //   console.log(req.params.id);
  mysqlConnection.query(
    "DELETE FROM employee WHERE EmpID = ?",
    [req.params.id],
    (err, rows, fields) => {
      if (!err) res.send("Deleted successfully");
      else console.log(err);
    }
  );
});

//Insert an employee

app.post("/employees", (req, res) => {
  let emp = req.body;
  var sql =
    "SET @EmpID = ?;SET @Name = ?;SET @EmpCode = ?;SET @Salary = ?; \
    CALL EmployeeAddOrEdit(@EmpID,@Name,@EmpCode,@Salary);";
  mysqlConnection.query(
    sql,
    [emp.EmpID, emp.Name, emp.EmpCode, emp.Salary],
    (err, rows, fields) => {
      if (!err)
        rows.forEach((element) => {
          if (element.constructor == Array)
            res.send("Inserted employee id : " + element[0].EmpID);
        });
      else console.log(err);
    }
  );
});

//Update an employee

app.put("/employees", (req, res) => {
  let emp = req.body;
  var sql =
    "SET @EmpID = ?;SET @Name = ?;SET @EmpCode = ?;SET @Salary = ?; \
    CALL EmployeeAddOrEdit(@EmpID,@Name,@EmpCode,@Salary);";
  mysqlConnection.query(
    sql,
    [emp.EmpID, emp.Name, emp.EmpCode, emp.Salary],
    (err, rows, fields) => {
      if (!err) res.send("Updated successfully");
      else console.log(err);
    }
  );
});

app.listen(3000, () =>
  console.log("Express server is running at port no : 3000")
);
