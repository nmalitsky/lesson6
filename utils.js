module.exports = {
	fmtJSON: output => {
		return JSON.stringify(output, null, 2);
	},
	checkFields: (object, fields) => {
		let arr = fields.split(',');
		Object.keys(object).forEach(prop => {
			if(arr.find(field => field === prop) == undefined) {
				delete object[prop];
			}
		});

		return object;
	}
}
