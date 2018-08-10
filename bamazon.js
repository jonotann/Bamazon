var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 8889,

    user: "root",

    password: "root",
    database: "bamazon_DB"
});

// makes sure that the user is supplying real numbers for inputs
function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a number that is not valued at Zero';
	}
}

//will prompt the user for the item and quantity they want
function promptUserPurchase() {

	//prompt the user to select an item
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Enter the ID of the Product that you would like to purchase.',
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many would you like?',
			validate: validateInput,
			filter: Number
		}
	]).then(function(input) {
		var item = input.item_id;
		var quantity = input.quantity;

		//query db to confirm that the id exists with availible inventory
		var queryStr1 = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr1, {item_id: item}, function(err, data) {
			if (err) throw err;

			//if the user has selected an id that does not exist, array will be blank

			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				displayInventory();

			} else {
				var productData = data[0];

				//if the quantity requested is in stock
				if (quantity <= productData.stock_quantity) {
					console.log('Congratulations, the product you requested is in stock! Placing order!');

					//updating query string
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					//update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Your order has been placed, the total is $' + productData.price * quantity);
						console.log("\n---------------------------------------------------------------------\n");

						//end the database connection
						connection.end();
					})
				} else {
					console.log('Sorry, there is not enough product in stock to move forward with your order.');
					console.log('Please change your order.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}
			}
		})
	})
}

//will retrieve the current inventory then display
function displayInventory() {

	//making the query string
	queryStr = 'SELECT * FROM products';

	//make the db query
	connection.query(queryStr, function(err, data) {
        if (err) throw err;
        

		console.log('Existing Inventory: ');
		console.log('----------------------\n');

		var strOut = '';
		for (var i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'Item ID: ' + data[i].item_id + '  //  ';
			strOut += 'Product Name: ' + data[i].product_name + '  //  ';
			strOut += 'Department: ' + data[i].department_name + '  //  ';
			strOut += 'Price: $' + data[i].price + '\n';

			console.log(strOut);
		}

	  	console.log("---------------------------------------------------------------------\n");

	  	//prompt the user for item and amount they would like to purchase
	  	promptUserPurchase();
	})
}

//will start app
function runBamazon() {
	// display inventory to user on start
	displayInventory();
}

//call back to launch
runBamazon();