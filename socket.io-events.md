#### [Main menu](index.md)
# Socket.io events

### Initial events
- `connection`
  - Send server's openPGP public key
  - Create per connection events

### Per connection events
- `chk`
  - Checks if the given username exists in he database
  - in: 
    - msg: String(user)
  - out: Boolean(true or false)
  - return event: `chk2`
- `req-pgp`
  - Checks if the given password can decrypt the OpenPGP key
  - in: 
    - msg: ciphertext->with server key
      - JSON string
        - usuario: String(user)
        - contraseña sha256 of the password
  - out:
    - Boolean(false) or 
    - usuario: String(user),
    - pgp
      - pública: String(PublicKey)
      - privada: String(privateKey)
  - out event: `req-pgp2`
- `registro`
  - Registers the given username and password
  - in:
    - encryptedMsg
      - creds:
        - usuario: String(user)
      - keys:
        - pública: String(publicKey)
        - privada: String(privateKey)
  - out: Boolean(true or false)
  - out event: `registro2`
- `req-sync`
  - Returns the encrypted database of the given user
  - in: Object({msg: Object({usuario-> String(user)})})
    - msg:
      - usuario: String(user)
  - out:
    - ciphertext
      - usuario: String(user)
      - db: ciphertext(db)
  - out event: `req-sync2`
- `sync`
  - Introduces the changed db into MySQL
  - in: 
    - msg: ciphertext(db)
  - out: Boolean(true or false)
  - out event: `sync2`
- `decidir_sync`
  - Looks for the newest db if the checksums of the online db and the user db differs.
  - in: 
    - msg:
      - usuario: String(username),
      - db: sha256 of the user db
      - fecha: Date in seconds from UNIX
  - out: Boolean(false) or String("servidor" or "cliente")
  - out event: `decidir_sync2`

### Socket timeline
Those are the events that the server can handle.
The Login functions fire once except `chk`
The After login functions are run in a constant loop, when the user changes anything in the db. On the future we expect to do this in realtime. By the moment, we'll send the `decidir_sync` event.
- Login functions
    - `chk`
    - On login, it checks if the name exists or can be registered. It's avoidable if exists in the local db
    - `req-pgp`
    - When online login ocurrs, we must download the user's key in order to decrypt the db
    - If login is offline, this event is not sent
    - `registro`
    - This funcion is ran when the user clicks the register button. Then, `sync` event may be sent in order to fulfill the database field
- After login functions
  - `sync`
    - Ocurrs when the user's database is newer than the server copy
  - `req-sync`
    - Ocurrs when the user's database is older than the server one
  - `decidir_sync`
    - Ocurrs when there is the need to know if there is a newer version of the database
