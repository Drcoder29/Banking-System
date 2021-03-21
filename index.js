const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true}))
app.set('view engine', 'ejs');

const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://dbUser:i4UJzcImsvj52uxu@cluster0.z5obc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoClient
  .connect()
  .then((client) => {
    const db = client.db();
    console.log("Mongodb connected");
    app.use(express.static("public"));

    app.get("/", function (req, res) {
      res.render("HomePage");
    });

    app.get("/Users", function (req, res) {
        db.collection("Accounts").find().toArray()
        .then(results => {
            let accounts = {'accounts': results}
            console.log(accounts)
            res.render('Users', accounts);
        });
    });

    app.get("/Transactions", function (req, res) {
        db.collection("Transactions").find().toArray()
        .then(results => {
            console.log('transactions : ', results)
            res.render('Transactions', {'transactions': results})
        })
    });

    app.get("/Transfer", function (req, res) {
        let name = req.query.Name;
        db.collection("Accounts").find().toArray()
        .then(results => {
            let data = {'accounts': []}
            for (ind in results) {
              let account = results[ind]
              if (account.name != name) data.accounts.push(account)
            }
            data['from'] = name
            console.log(data)
            res.render('Transfer', data)
        });
    });

    app.post("/Transfer", function (req, res) {
        console.log('request body :  ', req.body)
        let {From, To, Amount} = req.body
        db.collection("Accounts").update({name: To},{$inc: {balance: parseInt(Amount)}});
        db.collection("Accounts").update({name: From},{$inc: {balance: -parseInt(Amount)}});
        db.collection("Transactions").insert({from: From,to: To, amount: Amount})
        res.redirect('/Users')
    });
  })
  .catch(function (error) {
    console.log("error in connecting mongodb : ", error.message);
  });

app.listen(process.env.PORT || 5000, function () {
  console.log("server started");
});
