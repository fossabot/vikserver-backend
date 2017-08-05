console.log("Iniciando backend...");
//Parte general
const fs=require("fs");
var creds=require("./.privado/credenciales.json");

//Parte de MySQL
const mysql=require("mysql");
var pool=mysql.createPool(creds.mysql);
pool.query("SELECT * FROM test", (err, res)=>{
	if(err) throw err;
	console.log("Conectado a MySQL con éxito");
});
function query(a){
	return new Promise((resolver, rechazar)=>{
		pool.query(a, (err, res, campos)=>{
			if(err) throw err;
			resolver({res: res, campos: campos});
		});
	});
}

//Parte de OpenPGP
var pgpKeys,
	pgpObj;
const openpgp=require("openpgp");
query("SELECT * FROM Claves WHERE id='WebSocket'").then(a=>{
	if(a.res.length==1){
		console.log("Claves recuperadas de la base de datos");
		pgpKeys={
			pública: a.res[0].public,
			privada: a.res[0].private
		};
		pgpObj={
			pública: openpgp.key.readArmored(a.res[0].public).keys,
			privada: openpgp.key.readArmored(a.res[0].private).keys[0]
		}
		if(pgpObj.privada.decrypt(creds.openpgp.passphrase)){
			console.log("Clave de servidor OpenPGP desencriptada");
		}else{
			console.error("La contraseña para la clave OpenPGP no es correcta!");
			throw new Error("Error al desencriptar la clave OpenPGP");
		}
	}else{
		console.log("Generando una nueva clave...");
		openpgp.generateKey(creds.openpgp).then(key=>{
			console.log("Claves generadas correctamente");
			pgpKeys={
				pública: key.publicKeyArmored,
				privada: key.privateKeyArmored
			};
			pgpObj={
				pública: openpgp.key.readArmored(pgpKeys.pública).keys,
				privada: openpgp.key.readArmored(pgpKeys.privada).keys[0]
			}
			if(pgpObj.privada.decrypt(creds.openpgp.passphrase)){
				console.log("Clave de servidor OpenPGP desencriptada");
			}else{
				console.error("La contraseña para la clave OpenPGP no es correcta!");
				throw new Error("Error al desencriptar la clave OpenPGP");
			}
			query("INSERT into Claves (id, public, private) VALUES ('WebSocket', '"+pgpKeys.pública+"', '"+pgpKeys.privada+"')").then(()=>{
				console.log("Claves guardadas en la base de datos correctamente");
			});
		}).catch(e=>{
			console.error("Ha habido un error al generar e introducir la nueva clave PGP en la base de datos");
			throw e;
		});
	}
});

//Parte de SocketIO
var app=require("express")();
var http=require("http").Server(app);
var io=require("socket.io")(http);
var port=process.env.PORT || 10000;
app.get(/.*/, (req, res)=>{
	res.sendFile(__dirname+"/index.html");
});
http.listen(port, ()=>{
	console.log("Servidor WEB iniciado en el puerto "+port);
});
io.on("connection", socket=>{
	socket.emit("pgp", {name: "WebSocketServer", key: pgpKeys.pública});
	firmar("msg", "Mensaje firmado por el servidor usando PGP", socket);
	socket.on("chk", a=>{
		query("SELECT nombre FROM usuarios WHERE nombre='"+a.msg+"'").then(b=>{
			if(b.res.length==0){
				socket.emit("chk2", false);
				return;
			}
			b.res.forEach(c=>{
				if(c.nombre==a.msg){
					socket.emit("chk2", true);
					return;
				}
			});
			socket.emit("chk2", false);
		}).catch(e=>{
			console.error("Ha habido un fallo al conectar con la base de datos");
			console.error(e);
		});
	});
	socket.on("req-pgp", a=>{
		desencriptar(a.msg).then(b=>{
			let c=b.data;
			console.log(c);
			query("SELECT * FROM usuarios WHERE nombre='"+c.usuario+"'").then(d=>{
				if(d.res.length<1){
					socket.emit("req-pgp2", false);
					socket.emit("direct", "No hemos podido encontrar tu usuario y su clave PGP asociada");
					return;
				}
				d.res.forEach(f=>{
					if(f.usuario==c.usuario){
						if(openpgp.key.readArmored(JSON.parse(f.pgp).privada).decrypt(c.contraseña)){
							socket.emit("req-pgp2", {usuario: c.usuario, pgp:f.pgp});
						}else{
							socket.emit("req-pgp2", false);
						}
					}
				});
			});
		});
	});
	socket.on("registro", a=>{
		desencriptar(a.msg).then(b=>{
			let c=b.data;
			return query("INSERT INTO usuarios (nombre, pgp) VALUES ('"+c.usuario+"', '"+c.pgp+"')");
		});
	});
});
function firmar(a, b, socket){
	openpgp.sign({
		data:String(b),
		privateKeys: pgpObj.privada
	}).then(signed=>{
		socket.emit(a, signed.data);
	});
}
function desencriptar(a){
	return openpgp.decrypt({
		message: openpgp.message.readArmored(a),
		privateKey: pgpObj.privada
	});
}
function encriptar(a){
	return openpgp.encrypt({
		data: a.msg,
		publicKeys: openpgp.key.readArmored(a.key).keys
	});
}
