#### **BASE URL** - [https://blog-api.koneqtor.com/api/v1](https://blog-api.koneqtor.com/api/v1) 

* [Technologies Used](#technologies-used)
* [Features](#features)
* [API Endpoints](#api-endpoints)
* [Getting Started](#getting-started)
    * [Installation](#installation)
    * [Testing](#testing)
* [Authors](#authors)



## Technologies Used

* [Node.js](https://nodejs.org) - A runtime environment based off of Chrome's V8 Engine for writing Javascript code on the server.
* [PostgreSQL](https://www.postgresql.org) - An Object relational database from Elephant SQL.
* [Express.js](https://expressjs.com) - A Node.js framework.
* [Typescript](https://www.typescriptlang.org/) - Superset of Javascript.
* [Docker](hhttps://www.docker.com/) - API testing environment.
* [Docker-Compose](https://docs.docker.com/compose/) - Container orchestration tool.
* [Redis](https://redis.io/) - Cache database.
* [TypeORM](https://typeorm.io/) - A NodeJS ORM for RDBMS and NoSQL.
* [Postman](https://www.getpostman.com/) - API testing environment.
* [Jest](https://jestjs.io/) - Javascipt Test Framework.



## Features

* Users can sign up for accounts.
* Users can log into their accounts.
* Users can create a post.
* Users can view all posts.
* Users can view a post.
* Users can update their posts.
* Users can delete their posts.
* Users can search for posts using post title.


## API Endpoints

### basepath ({window.location.origin})/api/v1

* POST Signup User           (/auth/signup)
* POST Login User            (/auth/login)
* POST Create Post           (/posts)
* GET Get Posts              (/posts)
* GET Get Post               (/posts/:id)
* PATCH Update Post          (/posts/:id)
* DELETE Delete Post         (/posts/:id)
* GET Search Posts           (/posts/search/:title)




## Getting Started

### Testing


## Authors
*  Abuchi Kingsley Ndinigwe