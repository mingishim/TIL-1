const { response } = require('express');
const express = require('express')
const app = express()
const port = 2000;
var fs = require('fs');
const { request } = require('http');
var path = require('path');
var qs = require('querystring');
var bodyParser = require('body-parser');
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');

app.use(bodyParser.urlencoded({ extended: false}));

// route
app.get('/', (request, response) => {
    fs.readdir('./data', function(error, filelist){
        var title = 'Welcome';
        var description = 'Hello, fuckin Node.js';
        var list = template.list(filelist);
        var html = template.html(title, list, 
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
            );
        response.send(html);
    });
});


app.get('/page/:pageId', function(request, response) {
    fs.readdir('./data', function(error, filelist){
            var filteredId = path.parse(request.params.pageId).base;
            fs.readFile(`data/${filteredId}`, 'utf-8', function(err, description){
                var title = request.params.pageId;
                var sanitizedTitle = sanitizeHtml(title);
                var sanitizedDescription = sanitizeHtml(description, {
                    allowedTags:['h1']
                });
                var list = template.list(filelist);
                var html = template.html(sanitizedTitle, list, 
                    `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                    `<a href="/create">create</a> 
                    <a href="/update/${sanitizedTitle}">update</a>
                    <form action="/delect_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delect">
                    </form>`
                    );
                response.send(html);
            });
    });
});

app.get('/create', (request, response) => {
    fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.html(title, list, `
            <form action="/create_process" method="post">
                <!-- method="post"  은밀하게 서버로 전송-->
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
        `, '');
        response.send(html);
    });
});

app.post('/create_process', (request, response) => {
    var post = request.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, 'utf8', 
    function(err){
        response.writeHead(302,{Location: `/?id=${title}`});
        response.end('success');    
    })
});

app.get('/update/:pageId', (request,response) =>{
    fs.readdir('./data', function(error, filelist){
        var filteredId = path.parse(request.params.pageId).base;
        fs.readFile(`data/${filteredId}`, 'utf-8', function(err, description){
            var title = request.params.pageId;
            var list = template.list(filelist);
            var html = template.html(title, list, 
                `<form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
                `,
                `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`,
            );
            response.send(html);
        });
    });
});

app.post('/update_process', (request,response) => {
        var post = request.body;
        var id = post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`,`data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', 
            function(err){
            response.redirect(`/?id=${title}`);
        })

    });
});


app.post('/delect_process', (request,response) =>{
        var post = request.body;
        var id = post.id;
        var filteredId = path.parse(id).base;
        fs.unlink(`data/${filteredId}`, function(error){
            response.redirect('/')
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
