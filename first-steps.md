#### [Main menu](index.md)
# Firs steps in the backend
If you're going to host your own backend, take note of some thigs
- The project is not download-and-start
- Some actions are required
- Don't run `npm start` until you have completed all of them
  - If you create an issue, will be prompted if have followed this guide as-is

### MySQL hosting
Be sure to follow *all* the steps
- Choose the proper MySQL hosting
  - A slow hosting will result on a slow and blocking experience
- Create .privado/credenciales.json
  - This file stores the credencials of the server with the MySQL server and more.
  - File must contain
    - mysql
      - user: YourUser
      - password: YourPassword
      - host: your.mysql.host
      - database: yourMySQLdb
  - [Example file](#credentials-example)
  - The `mysql` properties are passed as-is to [mysql.createPool](https://github.com/mysqljs/mysql#pooling-connections) from mysqljs/mysql
    - This model is intended to production use.
    - If you want to add things add them there, and if you think we may add an option create a PR
- Run `node chk.js` to make sure it works. It will also create the needed tables

### OpenPGP key
The server needs a OpenPGP key to sign, encrypt and decrypt messages
- Add the `openpgp` property to .privado/credenciales.json
  - This property will be an object, like `mysql` one
    - passphrase: loooooongandsecure_passphrase ! The server's security relies on the MySQL and openpgp passphrase security.
    - userIds: Array
      - 0
        - name: YourName,
        - email: yourname@example.com
    - numBits: bitness of the key(2048 or highter)
  - This property is passed as-is to `openpgp.generateKey` so if you want to modify options simply modify it
  - Server key can be changed without any complication. No db entries are encrypted with it, only communications
  - In case of doubts give a look to [the exaple file](#credentials-example)

### Credencials example
#### Don't upload this file to GitHub!
````
    {
        "mysql":{
            "host": "yoursuper.fast.host",
            "user": "nonrootuser",
            "password": "mysuperlongandnotequaltotheusernamepassword",
            "database": "mySuperFastdb"
        },
        "openpgp":{
            "passphrase": "this passphrase won't be stored on the server, will be only here",
            "userIds": "[{name: 'YourName', email: 'yourname@example.com'}]",
            "numBits": 2048
        }
    }
````
