console.log("Iniciando test...");
var mysql=require("mysql");
var fs=require("fs");
var creds=require("./.privado/credenciales.json");
creds.mysql["multipleStatements"]=true;
console.log("Conectando al servidor MySQL");
var pool=mysql.createPool(creds.mysql);
pool.query("SELECT 1+1 AS solucion", err=>{
	if(err){
		console.error("El servidor no ha sido capaz de resolver 1+1, no podemos continuar");
		throw err;
	}
	console.log("Conexión establecida con el servidor");
});
pool.query("SELECT * FROM test", (err, res)=>{
	if(err){
		pool.query(fs.readFileSync(__dirname+"/vikserver.sql", "utf8"), (err, data)=>{
			if(err){
				console.error("No hemos podido inyectar la nueva base de datos");
				throw err;
			}
			console.log("Tablas creadas correctamente en el servidor");
			terminar();
		});
	}else{
		console.log("Comprobaciones OK");
		terminar();
	}
});
function terminar(){
	console.log("Terminando el script de comprobaciones");
	pool.end();
}
