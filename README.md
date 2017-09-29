# Javascript Dotnet Demo

This project is part of a presentation where talked about .NET Javascript Services.

This presentation is aimed at (experienced) .NET developers who are not very familiar with modern Javascript and nodejs. Therefore this demo starts out as an introduction into modern javascript development, introducing nodejs 8, webpack, typescript and React 16 RC, using yarn and vscode. Dotnet doesn't get added before the last step.

This presentation uses the latest of everything (as of sept 2017), including React Fiber (16) RC3, and implements universal rendering using the new renderToNodeStream and hydrate functions.

---
![How am I going to explain it](Slide.PNG?raw=true)


This repository has four branches (demo1 to demo4) that build up from nothing to a working AspNet Core 2 site with Javascript Services:

1. [Configure webpack with typescript and create a basic React 16 page](https://github.com/Maarten88/JavascriptDotnetDemo/blob/demo1/demo1.md)
2. [Configure webpack dev server with hot module reloading (HMR)](https://github.com/Maarten88/JavascriptDotnetDemo/blob/demo2/demo2.md)
3. [Implement React 16 Universal rendering with HMR using nodejs and express](https://github.com/Maarten88/JavascriptDotnetDemo/blob/demo3/demo3.md)
4. [Run the React component inside an AspNetCore page using JavascriptServices](https://github.com/Maarten88/JavascriptDotnetDemo/blob/demo4/demo4.md)

Each branch is acompanied by a script file that describes all the steps that were taken to get there from the previous branch.