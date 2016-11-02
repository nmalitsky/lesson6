const utils = require('./utils');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000;

function checkUserById(user_id) {
	let user = users[user_id]
	if(!user) {
		return { error: `User with id=${user_id} not found` };
	}
	return {};
}

// database
let users = {};
let user_id = 0;

let methods = {
	create: (params, callback) => {
		user_id++;
		if(!params.name || !params.score) {
		        let errorParams = new Error('error input parameters (name, score)');
      			errorParams.status = 400;
      			return callback(errorParams);
		}
		users[user_id] = { name: params.name, score: params.score };
		return callback(null, { message: `User with id=${user_id} created`});
	},
	// read all users or by user_id
	read: (params, callback) => {
		if(params.user_id) {
			let resCheck = checkUserById(params.user_id);
			if(resCheck.error) return callback(resCheck.error);
			let user = users[params.user_id];
			callback(null, user);
		} else {
			let arrUsers = [];
			Object.keys(users).forEach(user_id => {
				let user = users[user_id];
				user.id = user_id;
				arrUsers.push(user);
			});
			return callback(null, arrUsers);
		}
	},
	update: (params, callback) => {
		let resCheck = checkUserById(params.user_id);
		if(resCheck.error) return callback(resCheck.error);

		let user = users[params.user_id];
		users[params.user_id] = { name: params.name, score: params.score };
		return callback(null, { message: `User with id=${req.params.user_id} updated`});
	},
	delete: (params, callback) => {
		let resCheck = checkUserById(params.user_id);
		if(resCheck.error) return callback(resCheck.error);

		delete users[params.user_id];
		return callback(null, { message: `User with id=${params.user_id} deleted`});
	}
};


function RPC(method) {
	if (methods[method]) {
		return methods[method];
	} else {
		throw new Error('UNKNOWN_RPC_METHOD');
	}
}

// middleware to use for all requests
app.use((req, res, next) => {
	console.log(req.url);
	next();
});


app.post('/rpc', function(req, res) {
	const method = RPC(req.body.method);
	method(req.body.params, function(error, result) {
		if(error) res.status(400).json({ jsonrpc: '2.0', error: error, id: req.body.id });
		else res.status(200).json({ jsonrpc: '2.0', result: result, id: req.body.id });
	});
});

// middleware for handling all errors
// ATTENTION - must be AFTER ALL middlewares (app.use(...)) for exclude errors
app.use((err, req, res, next) => {
	res.status(err.status ? err.status : 500).end(err.message);
});

app.all('/*', (req, res) => {
	res.status(400).json({ message: 'Undefinded URL - use POST /rpc' });
});

app.listen(port);
console.log('Listening REST API on port ' + port);
