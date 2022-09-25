Payment Service
===

This Javascript/nodejs project serves as a microservice for [eCommerce](https://github.com/users/ethmore/projects/4) project.


## Service tasks:

- Create fake payment using *iyzico sandbox api*

# Installation
Ensure [nodejs](https://nodejs.org/en/) is installed in your system
```
npm install
```
```
node index.js
```
## Test
```
curl http://localhost:3008/test
```
### It should return:
```
StatusCode        : 200
StatusDescription : OK
```