"use-strict";
if(typeof fetch=="undefined"){
	var path=require("path");
}
function nodeTest(){
	const fs=require("fs");
	const path=require("path");
	let dependencias=(function(){
		let deps;
		try{
			deps=JSON.parse(fs.readFileSync("package.json")).dependencies;
		}catch(e){
			console.error(e);
			throw new Error("No hemos podido cargar el descriptor del paquete");
		}
		return deps;
	})();
	Object.keys(dependencias).forEach(a=>{
		try{
			if(require(a)==undefined){
				throw "El módulo de Node "+a+" no está instalado y se requiere";
			}else{
				console.log("El módulo "+a+" está instalado correctamente");
			}
		}catch(e){
			console.error(e);
			throw new Error("Uno de los módulos de NodeJS no está instalado: "+a);
		}
	});
	return true;
}
function test(){
	return testNav();
}
function testNav(){
	return new Promise((resolver, rechazar)=>{
		try{
			Object.keys(loaderDefs).forEach(a=>{
				if(a!="test"){
					console.log("Probando a cargar "+a);
					load(a);
				}
			});
			resolver(true);
		}catch(e){
			console.error("No hemos podido cargar uno de los módulos definidos en el cargador");
			throw e;
		}
	});
}
if(typeof process !="undefined"){
	nodeTest();
}else{
	test();
}
