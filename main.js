console.log("Iniciando backend...");
//Parte general
const crypto=require("crypto")
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
			query("INSERT INTO Claves (id, public, private) VALUES ('WebSocket', '"+pgpKeys.pública+"', '"+pgpKeys.privada+"')").then(()=>{
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
			let c=JSON.parse(b.data);
			query("SELECT * FROM usuarios WHERE nombre='"+c.usuario+"'").then(d=>{
				if(d.res.length<1){
					socket.emit("req-pgp2", false);
					socket.emit("direct", "pgp_404");
					return;
				}
				d.res.forEach(f=>{
					if(f.nombre==c.usuario){
						if(openpgp.key.readArmored(f.privateKey).keys[0].decrypt(c.contraseña)){
							return socket.emit("req-pgp2", {usuario: c.usuario, pgp:{privada: f.privateKey, pública: f.publicKey}});
						}else{
							return socket.emit("req-pgp2", false);
						}
					}
				});
			});
		}).catch(e=>{
			console.log("Error al desencriptar");
			console.error(e);
		})
	});
	socket.on("registro", a=>{
		desencriptar(a.msg).then(b=>{
			let c=JSON.parse(b.data);
			return query("INSERT INTO usuarios (nombre, privateKey, publicKey) VALUES ('"+c.creds.usuario+"', '"+c.keys.privada+"', '"+c.keys.pública+"')");
		}).then(()=>{
			socket.emit("registro2", true);
		}).catch(e=>{
			socket.emit("registro2", false);
			console.error(e);
		});
	});
	socket.on("req-sync", a=>{
		query("SELECT nombre,publicKey,db FROM usuarios WHERE nombre='"+a.msg.usuario+"'").then(b=>{
			encriptar({msg: new Buffer(b.res[0].db, "base64").toString("utf8"), key:b.res[0].publicKey}).then(c=>{
				socket.emit("req-sync2", c.data);
			});
		});
	});
	socket.on("sync", a=>{
		sync(a, socket);
	});
	socket.on("decidir_sync", a=>{
		decidir_sync(a).then(b=>{
			return socket.emit("decidir_sync2", b);
		}).catch(e=>{
			console.error("Ha sucedido un error al decidir la sincronización de la base de datos");
		});
	});
	socket.on("get-link", a=>{
		let ln=a.msg.link;
		if(ln.length!=6) return socket.emit("err", "Invalid identifier");
		return query(`SELECT * FROM short WHERE uid='${ln}'`).then(a=>{
			if(a.res.length<1){
				socket.emit("err", "Identificador incorrecto. Es posible que se haya eliminado");
				socket.emit("get-link2", false);
				return;
			}
			return socket.emit("get-link2", a.res[0].link);
		});
	});
	socket.on("set-public", a=>{
		desencriptar(a.msg).then(b=>{
			let x=JSON.parse(b.data);
			comprobar({usuario: x.usuario, msg: x.data.data}).then(c=>{
				let d=JSON.parse(c.data);
				query(`INSERT INTO short (link,uid,usuario) VALUES ('${d.link}','${d.uid}','${d.usuario}')`).then(()=>{
					socket.emit("set-public2", {status: true});
				}).catch(e=>{
					socket.emit("set-public2", {status: false, err: e});
				});
			});
		});
	});
	socket.on("update-public", a=>{
		desencriptar(a.msg).then(b=>{
			let x=JSON.parse(b.data);
			comprobar({usuario: x.usuario, msg: x.data.data}).then((c,d=JSON.parse(c.data))=>{
				query(`UPDATE short SET link='${d.link}' WHERE uid='${d.uid}'`).then(()=>{
					socket.emit("update-public2", {status: true});
				}).catch(e=>{
					socket.emit("update-public2", {status: false, err: e});
				});
			});
		});
	});
	socket.on("del-public", a=>{
		desencriptar(a.msg).then(b=>{
			let x=JSON.parse(b.data);
			comprobar({usuario: x.usuario, msg: x.data.data}).then((c, d=JSON.parse(c.data))=>{
				query(`DELETE FROM short WHERE uid='${d.uid}'`).then(()=>{
					socket.emit("del-public2", {status: true});
				}).catch(e=>{
					socket.emit("update-public2", {status: false, err: e});
				});
			});
		});
	});
	socket.on("dbsync", a=>{
		console.log(a);
		let salida={};
		for(let usuario in a){
			comprobar({usuario: usuario, msg: a[usuario]}).then(b=>{
				let actual=db[usuario];
				salida.status=200;
				decidir_sync({msg:{usuario: usuario, db: actual.hash, fecha: actual.fecha}}).then(c=>{
					if(c=="false"||c=="servidor") return;
					if(c=="cliente") sync({msg: actual.db}, socket);
				});
			}).catch(e=>{
				salida.status=403;
				salida.msg="La firma del usuario no es correcta";
			});
		}
		
	});
});

function decidir_sync(a){
	return query("SELECT SHA2(db, '256'),modificado FROM usuarios WHERE nombre='"+a.msg.usuario+"'").then(b=>{
		let sSha=b.res[0]['SHA2(db, \'256\')'];
		let res=b.res[0];
		if(sSha==a.msg.db){
			return false;
		}
		let fechaSrv=res.modificado;
		if(fechaSrv>a.msg.fecha){
			return "servidor";
		}else{
			return "cliente";
		}
	});
}
function sync(a, socket){
	desencriptar(a.msg).then(b=>{
		let c=JSON.parse(b.data);
		comprobar({msg: c.db, usuario: c.usuario}).then(d=>{
			if(d==false){
				socket.emit("direct", "pgp_sign_check_nok");
				socket.emit("sync2", {error: true, msg: "pgp_sign_check_nok"});
				throw new Error("No hemos podido verificar que la base de datos sea de tu propiedad");
			}
			query("UPDATE usuarios SET db='"+new Buffer(d.data).toString("base64")+"',modificado='"+c.fecha+"' WHERE nombre='"+c.usuario+"'").then(a=>{
				socket.emit("sync2", true);
			});
		}).catch(e=>{
			socket.emit("direct", "pgp_sign_check_nok");
			socket.emit("sync2", {error: true, msg: "pgp_sign_check_nok"});
		});
	}).catch(e=>{
		socket.emit("sync2", false);
		socket.emit("error", e);
	});
}
function firmar(a, b, socket){
	openpgp.sign({
		data:String(b),
		privateKeys: pgpObj.privada
	}).then(signed=>{
		socket.emit(a, signed.data);
	});
}
function comprobar(a){
	return new Promise((resolver, rechazar)=>{
		query("SELECT publicKey,nombre FROM usuarios WHERE nombre='"+a.usuario+"'").then(b=>{
			if(b.res.length<1){
				rechazar("No hemos podido encontrar el usuario ni su clave");
				return;
			}
			b.res.forEach(c=>{
				if(c.nombre!=a.usuario) return;
				openpgp.verify({
					message: openpgp.cleartext.readArmored(a.msg),
					publicKeys: openpgp.key.readArmored(c.publicKey).keys
				}).then(d=>{
					if(d.signatures[0].valid){
						resolver({data: d.data});
						return;
					}else{
						rechazar({data: d.data, status: "Invalid"});
						return;
					}
				});
			});
		});
	});
}
function encriptar(a){
	return openpgp.encrypt({
		data: a.msg,
		publicKeys: openpgp.key.readArmored(a.key).keys
	});
}
function desencriptar(a){
	return openpgp.decrypt({
		message: openpgp.message.readArmored(a),
		privateKey: pgpObj.privada
	});
}

//Parte de monitorización
const ping=require("ping");
const os=require("os");
setInterval(()=>{
	ping.promise.probe("victor.zona.digital").then(a=>{
		query("UPDATE misc SET valor='"+a.time+"' WHERE clave='latencia'").then(()=>{
			console.log("Latencia hasta victor.zona.digital: "+a.time);
		});
	});
	query("UPDATE misc SET valor='"+JSON.stringify({cpu: os.loadavg(), mem: process.memoryUsage()})+"' WHERE clave='recursos'");
}, 100000);
process.on("exit", code=>{
	console.log("Cerrando backend en código "+code);
});
