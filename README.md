# node-reverse-proxy

This project demonstrates reverse proxy using a Node server to proxy to an authentication server. My motivation is to examine the challenges of writing a Node reverse proxy instead of relying on Nginx.

In computer networks, a reverse proxy is the application that sits in front of back-end applications and forwards client requests to those applications. Reverse proxies help increase scalability, performance, resilience and security.

Unlike a traditional proxy server, which is used to protect clients, a reverse proxy is used to protect servers. A reverse proxy forwards the client's request to another one of many other backend servers, and returns the results from the server that actually processed the request to the client as if the proxy server had processed the request itself. The client only communicates directly with the reverse proxy server and it does not know that some other server actually processed its request. A forward proxy proxies on behalf of clients or requesting hosts, a reverse proxy proxies on behalf of servers.

## Projects

### app-client

A React frontend project to be served. Note that you'll need to copy the build folder to app-server.

### app-server

A Node server that acts as a reverse proxy

### auth-server

An authentication server that checks for identity before users can access the React app

## Run

- Start the auth and app servers.
- By default, everyone has access to the main page of the React app
- Go to `/secret` to authenticate before you are authorized to view the secret page.
