#### [Main menu](index.md)
# Functions explaination

#### MySQL
- `pool.query`
  - Don't use it, there is a way using Promise `query()`
- `query()` Query MySQL 
  - Multiline query is disabled by default
  - arguments: String(queryString)
  - return: Promise -> 
    - .res -> Query result
    - .campos -> Query fields

#### Socket.io
- `sync()` Updates the selected user database
  - arguments: String(a->Encrypted msg), socketConnection
  - return: undefined (async)

#### OpenPGP
- `firmar()` send a signed msg throught socket
  - arguments: String(msgType), String(data), socketConnection
  - return: undefined (async)
- `comprobar()` check if the msg was signed by a user
  - arguments: Object({usuario, msg->signedMsg})
  - return: Promise ->
    - .data: plain text data
- `encriptar()` encrypt a message with a given key
  - arguments: Object({key->armored key, msg->string})
  - return: Promise -> OpenPGP encrypted message
- `desencriptar()` decrypt a message 
  - arguments: String -> -armoredMessage
  - return: Promise -> OpenPGP decrypted message
