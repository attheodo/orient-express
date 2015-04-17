# Orient-Express.js
### A project scaffold synonymous with comfort and intrigue.


<img align="right" height="260" src="http://atworks.gr/orient/logo.png">

#### Features
- Runs on the fast track foundation laid down by Express.js
- Focused on great conventions and best practices
- Folder structure that makes sense
- **Locomotiv:** Route declaration and handling for people with OCD

## Quickstart
```
$ git clone git://github.com/attheodo/orient-express.git
$ cd orient-express
$ npm install
```

## Routing
Orient-Express ships with **Locomotiv** which allows you to configure your routes in an intuitive, declarative way using `.json` files.

- **Locomotiv** checks the `routes/` directory for your route configuration files.
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
-  The middleware syntax is the same as the handler's syntax.
	- `"authentication:verify"` will apply the `verify()` middleware method defined in `./middlewares/authentication.js`
-  Middleware can be a single string, in case there's only one middleware to apply, or an array.
