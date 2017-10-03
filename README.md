# ts-node-couch-di-starter

A starter project using Node.js, TypeScript, injection-js, support for CouchDB using PouchDB and support for message queueing via RabbitMQ.

## Requirements
* Install RabbitMQ:
** https://www.rabbitmq.com/
* `npm install`

## Installation
* Run the application via `npm run start`

# Monitoring the RabbitMQ
* Enter the RabbitMQ Command Prompt (via Start Menu)
* Enter `rabbitmq-plugins enable rabbitmq_management`
* Wait a few seconds
* Browse to http://localhost:15672
* User for Login (if freshly installed): guest//guest
