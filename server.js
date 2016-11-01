const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

let users = {};
let user_id = 0;

const routerAPIv1 = express.Router();

// middleware to use for all requests
app.use((req, res, next) => {
	console.log(req.url);
	next();
});

routerAPIv1.get('/', (req, res) => {
	res.status(200).json({ message: 'Welcome to REST API! Usage: /users, users/:user_id' });	
});

function fmtJSON(output) {
	return JSON.stringify(output, null, 2);
}

function checkFields(object, fields) {
	let arr = fields.split(',');
	Object.keys(object).forEach(prop => {
		if(arr.find(field => field === prop) == undefined) {
			delete object[prop];
		}
	});

	return object;
}

// on routes that end in /users
// ----------------------------------------------------
routerAPIv1.route('/users')

	// create a users (accessed at POST http://localhost:3000/api/users)
	.post((req, res) => {
		user_id++;
		if(!req.body.name || !req.body.score) {
		        let errorParams = new Error('error input parameters (name, score)');
      			errorParams.status = 400;
      			return next(errorParams);
		}
		users[user_id] = { name: req.body.name, score: req.body.score };
		res.status(200).json({ message: `User with id=${user_id} created`});
		
	})

	// get all the users (accessed at GET http://localhost:3000/api/users?offset=1&limit=2&fields=id,name)
	.get((req, res, next) => {
		let arrUsers = [];
		let fields = req.query.fields;
		Object.keys(users).forEach(user_id => {
			let user = users[user_id];
			user.id = user_id;

			// show only required property of user (from specified fields)
			if(fields) user = checkFields(user, fields);
			arrUsers.push(user);
		});

		// offset & limit
		let offset = parseInt(req.query.offset || 0); 
		let limit = parseInt(req.query.limit || arr.length);
		if(isNaN(offset) || isNaN(limit)) {
		        let errorParams = new Error('error input parameters (limit, offset)');
      			errorParams.status = 400;
      			return next(errorParams);
		}
		res.status(200).end(fmtJSON(arrUsers.slice(offset, offset + limit)));
	})

	// delete all users (accessed at DELETE http://localhost:3000/api/users)
	.delete((req, res) => {
		users = {};
		res.status(200).json({ message: 'All users are deleted'});
	});


// on routes that end in /users/:user_id
// ----------------------------------------------------
routerAPIv1.route('/users/:user_id')

	// general check for :user_id parameter
	.all((req, res, next) => {
		let user = users[req.params.user_id]
		if(user) {
			next();
		} else {
		        let errorParams = new Error(`User with id=${req.params.user_id} not found`);
      			errorParams.status = 400;
      			next(errorParams);
		}
	})

	// get the user with that id (accessed at GET http://localhost:3000/api/users/1)
	.get((req, res) => {
		let user = users[req.params.user_id]
		res.status(200).end(fmtJSON(user));
	})

	// update the user with this id (accessed at PUT http://localhost:3000/api/users/1)
	.put((req, res) => {
		let user = users[req.params.user_id];
		users[req.params.user_id] = { name: req.body.name, score: req.body.score };
		res.status(200).json({ message: `User with id=${req.params.user_id} updated`});
	})

	// delete the user with this id (accessed at DELETE http://localhost:3000/api/users/1)
	.delete((req, res) => {
		let user = users[req.params.user_id];
		delete user;
		res.status(200).json({ message: `User with id=${req.params.user_id} deleted`});
	});

app.use('/api/v1', routerAPIv1);

// middleware for handling all errors
// ATTENTION - must be AFTER ALL middlewares (app.use(...)) for exclude errors
app.use((err, req, res, next) => {
	res.status(err.status).end(err.message);
});

app.all('/*', (req, res) => {
	res.status(400).json({ message: 'Undefinded URL - use /api/v1/' });
});

app.listen(port);
console.log('Listening REST API on port ' + port);
