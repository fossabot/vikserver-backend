console.log("Iniciando backend...");
//Parte general
const fs=require("fs");
const crypto=require("crypto");
//Parte de MySQL
const mysql=require("mysql");
var creds=require("./.privado/credenciales.json");
var pool=mysql.createPool(creds);
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
var token;
query("SELECT valor FROM Seguridad WHERE id='token'").then(a=>{
	token=a;
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
	socket.on("chk", a=>{
		query("SELECT nombre FROM usuarios WHERE nombre='"+a.msg+"'").then(b=>{
			console.log(b.res);
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
});
