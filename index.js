const express = require("express");
const pg = require("pg");

const exphbs = require("express-handlebars");
const bodyParser = require("body-parser"); 	// add this line
const app = express();
const Pool = pg.Pool;
const connectionString = process.env.DATABASE_URL || 'postgresql://teko:teko123@localhost:5432/kitten_inn';
const pool = new Pool({
	connectionString
});
const INSERT_QUERY = "insert into booking (name, staying_for, arriving_on) values ($1, $2, $3)";



app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false })); // add this line
app.use(bodyParser.json()); // add  this line

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const kittens = [

];

// after you added  this  restart the app
app.get("/", async function (req, res) {

	const kittens = await pool.query(`select id, name, staying_for as days,
									arriving_on as "arrivingOn"  from booking`);

	res.render("index", { kittens: kittens.rows });
});



app.post("/filter", async function (req, res) {

	const daysFilter = req.body.daysFilter;

	let filteredData = [];
	if (daysFilter === "three") {

		const LESS_OR_EQL_THAN_3 = `select id, name, staying_for as days,
									arriving_on as "arrivingOn"
									from booking where staying_for <=3`;

		const result = await pool.query(LESS_OR_EQL_THAN_3);
		filteredData = result.rows;

	}
	else if (daysFilter === "more") {

		const MORE_THAN_3 = `select id, name, staying_for as days,
									arriving_on as "arrivingOn"
									from booking where staying_for > 3`;

		const result = await pool.query(MORE_THAN_3);
		filteredData = result.rows;

	}
	else{
		res.redirect("/");
	}

	res.render("index", { kittens: filteredData });
});

app.post("/booking", async function (req, res) {

	const days = req.body.days && Number(req.body.days);
	const name = req.body.name;
	const arrivingOn = req.body.day;

	if (days && name && arrivingOn) {
		const INSERT_QUERY = "insert into booking (name, staying_for, arriving_on) values ($1, $2, $3)";
		await pool.query(INSERT_QUERY, [name, days, arrivingOn]);

		kittens.push({
			id: kittens.length + 1,
			days,
			name,
			arrivingOn
		});
		res.redirect("/");

	} else {

		function validate(value, result) {
			if (!value) {
				return result;
			}
			return {};
		}

		const daysInvalid = validate(days, {
			style: "is-invalid",
			message: "Enter a valid day"
		});

		const kittenNameInvalid = validate(name, {
			style: "is-invalid",
			message: "Enter a valid day"
		});

		const arrivingOnInvalid = validate(arrivingOn, {
			style: "is-invalid",
			message: "Please select a arrival day"
		});

		const kittens = await pool.query(`select id, name, staying_for as days,
		arriving_on as "arrivingOn"  from booking`);


		res.render("index", {
			name,
			days,
			kittens : kittens.rows,
			daysInvalid,
			arrivingOnInvalid,
			kittenNameInvalid
		});


	}




})

// app.post("/counter", function(req, res) {

// });

const PORT = process.env.PORT || 3009;

app.listen(PORT, function () {
	console.log("App started on port :" + PORT);
});

