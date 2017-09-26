### Connecting the Universal React app to dotnet core 2.0 with universal javascript

We could instantiate a dotnet template that contains javascript services already, but to explain what goes on, we'll instantiate a plain MVC template, and then connect it to our javascript.

In our project folder, check you have the dotnet sdk 2.0 installed (dotnet -v) and type at the terminal:

    dotnet new mvc

Edit JavascriptDotnetDemo.csproj for vscode and webpack. This maps build errors in dotnet to the correct sourcefiles in vscode, and avoids automatic typescript compilation in Visual Studio.

    <GenerateFullPaths>true</GenerateFullPaths>
    <TypescriptCompileBlocked>true</TypescriptCompileBlocked>

Now throw out all the built-in javascripts and bundling, the default templates use bower, we use webpack. 

Now we need to configure NodeServices. There is no nuget package needed, it is part of AspNetCore 2.0. Just edit Startup.cs:

    services.AddNodeServices();
    ...
    app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
    {
        HotModuleReplacement = true,
        ConfigFile = "webpack.config.typescript.js"
    });
    ...

We cannot use our webpack.config.ts file directly from dotnet, so we need to load it indirectly via javascript, via webpack.config.typescript.js:

    // an alternative to ts-node for bootstrapping webpack.config in typescript
    const tsc = require("typescript");
    const webpackConfig = require("fs").readFileSync("./webpack.config.ts", "utf8");
    const options = {
        compilerOptions: {
            target: "es5",
            module: "commonjs",
            allowJs: false,
            checkJs: false
        }
    };
    module.exports = eval(tsc.transpileModule(webpackConfig, options).outputText);


We are going to put our react app on the homepage.

Views/Index.cshtml:

    <div id="app" asp-prerender-module="server/dist/main-server">Loading...</div>

    @section scripts {
        <script src="~/dist/main-client.js" asp-append-version="true"></script>
    }

Views/_ViewImports.cshtml:

    @addTagHelper *, Microsoft.AspNetCore.SpaServices


Terminal: add aspnet-webpack middleware

    yarn add aspnet-webpack aspnet-prerendering


in webpack.config.ts, add a compilation target for the server:

    export default function(env: any = {}): webpack.Configuration[] {

        return [{
            ... // existing client config
        },
        {
            // add server target
            name: 'server',
            target: 'node',
            resolve: { 
                extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
            },
            devtool: debug ? "inline-source-map" : false,
            entry: {
                'main-server': './boot-server.tsx'
            },
            output: {
                filename: "[name].js",
                path: path.join(__dirname, 'server', 'dist'),
                libraryTarget: 'commonjs'
            },
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        use: {
                            loader: "awesome-typescript-loader",
                            options: {
                                configFileName: "tsconfig.json"
                            }
                        }
                    }
                ]
            }
        }
    ]

Remove the HMR settings for the client, as the AspNet WebpackDevMiddleware will make the same modifications dynamically, if options.HotModuleReplacement = true is specified.

        name: 'client', // added because there are now two webpack configs
        entry: {
            'main-client': ['./boot-client.tsx'] // removed webpack-dev-middleware/client
        },

        plugins: debug ? [
            // removed new webpack.HotModuleReplacementPlugin()
        ] : [


Add a vscode taks to compile our project.
tasks.json:

    {
        "taskName": "Build Dotnet",
        "type": "shell",
        "command": "dotnet",
        "args": [
            "build"
        ],
        "group": {
            "kind": "build",
            "isDefault": true
        },
        "problemMatcher":"$msCompile"
    }


Also add a launch entry to start it in the debugger.
launch.json:

    {
        "name": "Launch Dotnet Server",
        "type": "coreclr",
        "request": "launch",
        "program": "${workspaceRoot}\\bin\\Debug\\netcoreapp2.0\\JavascriptDotnetDemo.dll",
        "args": [],
        "cwd": "${workspaceRoot}",
        "console": "internalConsole",
        "stopAtEntry": true,
        "internalConsoleOptions": "openOnSessionStart",
        "env": {
            "ASPNETCORE_ENVIRONMENT": "Development"
        }
    }           

Build the project (ctrl-shift-B) and then start it.

If everything is correct, our component will appear on the homepage, webpack_hmr will connect and we can edit typescript code with hot module replacemant.
