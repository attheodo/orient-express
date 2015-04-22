# Orient-Express.js
### A project scaffold synonymous with comfort and intrigue.


<img align="right" height="260" src="http://atworks.gr/orient/logo.png">

#### Features
- Runs on the fast track foundation laid down by Express.js
- Focused on great conventions and best practices.
- Folder structure that makes sense.
- **Locomotiv:** Route declaration and handling for people with OCD.
- **Tender:** Searches for model definitions and registers models using [Waterline ORM](https://github.com/balderdashy/waterline).
- Frictionless configuration using `.json` files for each environment, and overrides from `env` or CLI arguments.
- [Handlebars](http://handlebarsjs.com/) view engine for building semantic templates with no frustration.

## Quickstart
```
$ git clone git://github.com/attheodo/orient-express.git
$ cd orient-express
$ npm install
```

## Routing
Orient-Express ships with **Locomotiv** which allows you to configure your routes in an intuitive, declarative way using `.json` files.

- **Locomotiv** by default checks the `routes/` directory for your route configuration files.
- You can declare all your routes in one configuration file or split them into multiple. For example `webRoutes.json`, `mobile.api.users.json`, `mobile.api.categories.json`. **Locomotiv** will parse them all as long as they're valid `JSON`.
- Comments are supported in the `.json` configuration files. **Locomotiv** conveniently strips them out before parsing the JSON.

#### JSON Configuration File Example
```javascript
/* FILE: routes/index.json */

{
    /*
     *  Let's create out first routes
     *  Thumb's up for multi-line comments.
     */

	// The route's URI
	"/": {

		// The HTTP Verb to map to (GET/POST/DELETE/PUT)
		"GET": {

			// The route's handling method. This needs to be an exported function in your controller
			"handler": "index"

			// This can be a single middleware defined as string, or an array
			"middleware": [

				// Apply the verify() middleware located in ./middlewares/auth.js
				"auth:verify",

				// Apply the attach() middleware located in my_subfolder/myMdlrw.js
				"my_subfolder/myMdlwr:attach" // Apply the attach
			]
		},

		// Let's handle HTTP POST on `/` too!
		"POST": {

			// Let's specify explicitly the controller's filename here
			// Route will map to postThing() method in `./controllers/Index.Post.Controller.js`
			"handler": "Index.Post.Controller:postThing",

			// No need for middlewares here. Or you can omit this property completely.
			"middleware": []
		}
	},

	// Lookety look, another route URI. We're talking about /user/:id now!
	"/user/:id": {

		// You know the drill...
		"DELETE": {

			// Orient doesn't recommend scattering your controller here and there.
			// In case you're confident, that's how you map to a specific controller in a specific folder
			"handler": "another_folder/MyUserController:deleteUser"
		}
	}
}
```

### How Locomotiv Maps Controllers To Routes
- If there is a `"handler"` property defined in your route configuration object:
	- If `"handler"` value is in the `"filename:method"` format, **Locomotiv** will map `method()` of `./controllers/filename.js` as the handler to the route.
		- **If your controller is in a subfolder** you can use `"/subfolder/controllerName:method"`
		- **If you want to use a controller located relative to your project root** you can use `"./subfolder/controllerName:method"`
	- If `"handler"` value is in the `"method"` format, **Locomotiv** will derive the controller's filename and look for it in `./controllers`. **Locomotiv** derives the filename from your route configuration file's filename. For example if you routes configuration file is named `Users.json`, **Locomotiv** will look for `./controllers/UsersController.js` and map `method()` as the handler.
	- ** IMPORTANT NOTE: ** Your controllers should export the methods via `module.exports` in order for **Locomotiv** to map them to a route.
- If there is **not** a `"handler"` property defined, **Locomotiv** will try to map the `index()` method in a controller of which the filename will try to derive according to your routes `.json` configuration filename. For example, if your routes configuration file is named `Users.json`, **Locomotiv** will look for `./controllers/UsersController.js` and map `index()` method as the route's handler.

### How Locomotiv Applies Middlewares To Routes
- **Locomotiv** checks the `"middleware"` property in your route declaration file for middlewares to apply to this *specific* route.
-  The middleware syntax is the same as the handler's syntax.
	- `"authentication:verify"` will apply the `verify()` middleware method defined in `./middlewares/authentication.js`
-  Middleware can be a single string, in case there's only one middleware to apply, or an array.

### Applying Middlewares to All Routes & Creating File-Global Configuration Options
- **Locomotiv** supports **file-global configuration options**.
- You can use **file-global configuration options** to:
	- Set a default controller file name for all routes declared in the file. This allows you to use an explicit filename, instead of having **Locomotiv** deduct it, and use the `"handler":"action"` format for specifying a controller method to map to the route.
	- Change the default path of the controllers for the routes declared in the file.
	- Change the default path of the middleware used by the routes declared in the file.
	- **Apply middleware to ALL the routes declared in the file.**
	- **Add a URI prefix to ALL the routes declared in the file.**
- You define **file global configuration options** by adding a wildcard `"*"` property in your route declarations file.

For Example:

```javascript
/* FILE: routes/index.json */

{
    // File-global configuration options
	"*":{

		// Use customControllerDir to search for controllers
		"controllerPath": "./customControllerDir",

		// If a route has specified handler in "handler": "action" format
		// then action is a method in routeCtrl.
		"controllerName": "routeCtrl",

		// Look for middleware in this path other than the default
		"middlewarePath": "./customMiddlewarePath",

		// apply the auth.js:check() and config.js:response() middleware
		// to ALL the routes in this file
		"middleware": ["auth:check", "config:response"],

		// Prefix all routes in this file with "/admin"
		"URIPrefix": "/admin"
	},

	// Route configuration for / which will utterly map
	// to /admin/ since we configured "URIPrefix" above.

	"/": {

		// GET /admin/ options
		"GET": {

			// The route's handling method. This needs to be an exported
			// function in routeCtrl.js
			"handler": "index"

		}
	}
}

```

## Models
Orient-Express uses the [Waterline ORM](https://github.com/balderdashy/waterline) ([docs](https://github.com/balderdashy/waterline-docs)) for it's persistence layer. Model declaration loading and registration is facilitated by the **Tender** module.
- **Tender** uses Orient-Express global configuration mechanism (`/config/env/*`, environment variables, cosnole arguments) to load generic options for Waterline such as:
	- `modelsPath`, or where **Tender** should look to load your models.
	- Your model migration strategy (`"migration": "safe"`).
		- `safe` doesn't alter the models in the database in anyway. Best fit for `production` environment
		- `alter` tries to auto-migrate columnds/fields while attempting to keep existing data (experimental).
		- `drop` wipes/drops all the data and rebuilds the model everytime you start Orient-Express.
	- `waterline.connections` which tells Waterline which are the available database connection options, which adapters for the datastore service they should use and which are the access credentials.
	- `verbose` a boolean flag that defines whether **Tender** should output verbose logs related to the model loading procedure.
