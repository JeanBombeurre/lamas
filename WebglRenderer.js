const sV=`
	attribute vec4 pos;	
	attribute vec4 c;

	uniform mat4 viewMatrix;

	varying vec4 c_f;
	
	void main() {
		c_f=c;
		gl_Position=viewMatrix*pos;
	}
`;
const sF=`
	precision lowp float;
	varying vec4 c_f;
	void main(){
		gl_FragColor=c_f;
	}
`;
function resize(canvas) {
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}
class Renderer{
	constructor(gl1){
		this.gl=gl1
		this.bgpts=[]
		this.bgcs=[]
		
		this.init()
		
	}
	draw(cam){
		let m=cam.viewMatrix()
		let l=[]
		for(let i=0;i<m.h;i++){
			for(let j=0;j<m.h;j++){
				l.push(m.shape[j][i])
			}
		}
		if(!this.synchrobg){this.synchroBG()}
		resize(gl.canvas)
		gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
				
		gl.uniformMatrix4fv(this.uniformsLocation.viewMatrix,false,l)
		
		gl.enableVertexAttribArray(this.attributesLocation.pos);
		gl.enableVertexAttribArray(this.attributesLocation.c);
		
		gl.enable(gl.DEPTH_TEST);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.colBuffer)
		gl.vertexAttribPointer(this.attributesLocation.c, 3, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER,this.posBuffer)
		gl.vertexAttribPointer(this.attributesLocation.pos, 3, gl.FLOAT, false, 0, 0)
		
		this.eff()
		gl.drawArrays(gl.TRIANGLES,0,Math.round(this.pos.length/3));
		
		gl.bindBuffer(gl.ARRAY_BUFFER,this.bgcolBuffer)
		gl.vertexAttribPointer(this.attributesLocation.c, 3, gl.FLOAT, false, 0, 0)
		gl.bindBuffer(gl.ARRAY_BUFFER,this.bgposBuffer)
		gl.vertexAttribPointer(this.attributesLocation.pos, 3, gl.FLOAT, false, 0, 0)
		
		gl.drawArrays(gl.TRIANGLES,0,Math.round(this.bgpts.length/3));
		
	}
	eff(bg=[135/255,206/255,235/255]){///bleu ciel rgb(135,206,235)
		gl.clearColor(bg[0],bg[1],bg[2], 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}
	init(){
		let Vshader=Renderer.createShader(gl,gl.VERTEX_SHADER,sV)
		let Fshader=Renderer.createShader(gl,gl.FRAGMENT_SHADER,sF)
		let program=Renderer.createProgram(gl,Vshader,Fshader)
		this.program=program
		this.attributesLocation={pos:gl.getAttribLocation(program,"pos"),c:gl.getAttribLocation(program,"c")}
		this.uniformsLocation={viewMatrix:gl.getUniformLocation(program,"viewMatrix")}
		gl.useProgram(program)
		
		this.posBuffer=gl.createBuffer()
		this.colBuffer=gl.createBuffer()
		this.bgposBuffer=gl.createBuffer()
		this.bgcolBuffer=gl.createBuffer()
	}
	setPositionsAndColors(pos,col){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		this.pos=pos
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.DYNAMIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colBuffer);
		this.col=col
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(col),gl.DYNAMIC_DRAW)
	}
	static createShader(gl, type, source) {
		var shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	}
	static createProgram(gl, vertexShader, fragmentShader) {
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
			return program;
		}
		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}
	
	drawPolys(lp,cam){
		let pos=[]
		let col=[]
		for(let i=0;i<lp.length;i++){
			let inu=lp[i].getAff()
			pos=pos.concat(inu[0])
			col=col.concat(inu[1])
		}
		
		this.setPositionsAndColors(pos,col)
		this.draw(cam)
	}
	
	setBGPolys(pts,cs){//////[x,y,z,x,y,z] , [r,g,b,r,g,b]
		this.bgpts=pts
		this.bgcs=cs
		this.synchrobg=0
	}
	synchroBG(){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bgposBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.bgpts),gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bgcolBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.bgcs),gl.STATIC_DRAW)
		this.synchrobg=1
	}
	addBGPoly(pts,c){
		this.bgpts=this.bgpts.concat(pts)
		this.bgcs=this.bgcs.concat(c)
		this.synchrobg=0
	}
}
class Cam{
	constructor(pos,dir,de){
		this.pos=pos
		this.dir=dir.u()
		if(de==undefined){
			this.de=100
		}else{
			this.de=de
		}
		this.posa=undefined
	}
	viewMatrix(){
		let world=this.worldMatrix()
		
		let projection=new Matrix([[1*this.de,0,0,0],
								   [0,1*this.de,0,0],
								   [0,0,1,0],
								   [0,0,1,0.1]])		
		let w=gl.canvas.width
		let h=gl.canvas.height
		let screenCorrec=new Matrix([[1/w,0,0,0],
									 [0,1/h,0,0],
									 [0,0,1,0],
									 [0,0,0,1]])
		return Matrix.times(Matrix.times(projection,screenCorrec),world)
	}
	worldMatrix(){
		let translation=new Matrix([[1,0,0,-this.pos.x],
								    [0,1,0,-this.pos.y],
								    [0,0,1,-this.pos.z],
								    [0,0,0,1]])
		
		let rotation=42
		if(this.posa==undefined){
			let dz=this.dir.pol()
			let dx=new PtPol(1,0,dz.theta+Math.PI/2).cart()
			let dy=new PtPol(1,dz.phi+Math.PI/2,dz.theta).cart()

			rotation=new Matrix([[dx.x,dy.x,this.dir.x],
									[dx.y,dy.y,this.dir.y],
									[dx.z,dy.z,this.dir.z],
									])
		}else{
			rotation =this.posa
			this.dir=this.posa.pt(2)
			this.posa=undefined
		}
		let ri=rotation.inv()
		let world = Matrix.times(ri.cast(4),translation);
		return world
	}
}

class Model{
	static l={};
	constructor(pts,faces,col,name){//pts liste [PtCart] faces liste indices [a,b,c] col liste 1col par faces
		this.pts=pts
		this.decaleCentre=new Pt(0,0,0)
		if(col=="random"){
			col=[]
			for(let i=0;i<faces.length;i++){
				col.push([Math.random(),Math.random(),Math.random()])
			}
		}
		if(col=="randomGris"){
			col=[]
			for(let i=0;i<faces.length;i++){
				let c=Math.random()
				col.push([c,c,c])
			}
		}
		if(col=="randomBleu"){
			col=[]
			for(let i=0;i<faces.length;i++){
				let c=Math.random()
				col.push([0,0,c])
			}
		}
		if(col=="randomRouge"){
			col=[]
			for(let i=0;i<faces.length;i++){
				let c=Math.random()
				col.push([c,0,0])
			}
		}
		
		
		let repF=[]
		let repC=[]
		for(let i=0;i<faces.length;i++){
			for(let j=0;j<faces[i].length-2;j++){
				repF.push([faces[i][0],faces[i][j+1],faces[i][j+2]])
				repC.push(col[i])
			}
		}
		this.faces=repF
		this.col=repC
		this.name=name
		Model.l[name]=this;
		this.actuM()
	}
	addPoly(poly){
		let k=this.pts.length
		this.pts=this.pts.concat(poly.pts)
		this.col=this.col.concat(poly.col)
		for(let i=0;i<poly.faces.length;i++){
			let k2=[poly.faces[i][0]+k,poly.faces[i][1]+k,poly.faces[i][2]+k]
			this.faces.push(k2)
		}
		this.actuM()
	}
	changeCentreGrav(dp){
		for(let i=0;i<this.pts.length;i++){
			this.pts[i]=this.pts[i].plus(dp.scal(-1))
		}
		this.actuM()
		this.decaleCentre=dp
	}
	actuM(){
		let m=[[],[],[],[]]
		for(let i=0;i<this.pts.length;i++){
			m[0].push(this.pts[i].x)
			m[1].push(this.pts[i].y)
			m[2].push(this.pts[i].z)
			m[3].push(1)
		}
		this.m=m
	}
	createPolyByMatrix(mat=Matrix.id(4)){//mat4
		let m2=new Matrix(this.m,0)
		let m3=Matrix.times(mat,m2)
		let rep=[]
		for(let i=0;i<m3.w;i++){
			rep.push(new PtCart(m3.shape[0][i],m3.shape[1][i],m3.shape[2][i]))
		}
		return new Poly(rep,this.faces,this.col)
	}
	equilibreCentreGrav(){
		let rep=new Pt(0,0,0)
		for(let i=0;i<this.pts.length;i++){
			rep=rep.plus(this.pts[i])
		}
		rep=rep.scal(1/this.pts.length)
		let aj=rep
		for(let i=0;i<this.pts.length;i++){
			this.pts[i]=this.pts[i].plus(aj.scal(-1))
		}
		this.actuM()
	}
}
class Poly{
	constructor(pts,faces,col){//pts liste [PtCart] faces liste indices [[a,b,c]] col liste [[r,g,b]] par faces
		this.pts=pts
		this.faces=faces
		this.col=col
	}
	getAff(){
		let r;
		(r=[]).length=this.faces.length*9
		let c;
		(c=[]).length=this.faces.length*9
		for(let i=0;i<this.faces.length;i++){
			for(let j=0;j<3;j++){
				let k=this.pts[this.faces[i][j]]
				r[i*9+j*3+0]=k.x
				r[i*9+j*3+1]=k.y
				r[i*9+j*3+2]=k.z
				/*
				r.push(k.x)
				r.push(k.y)
				r.push(k.z)
				c.push(this.col[i][0])
				c.push(this.col[i][1])
				c.push(this.col[i][2])*/
				for(let inu=0;inu<3;inu++){
					c[i*9+j*3+inu]=this.col[i][inu]
				}
				
			}
		}
		return [r,c]
	}
	add(b){
		return new Poly(this.pts.concat(b.pts),this.faces.concat(decaleIndex(this.pts.length,b.faces)),this.col.concat(b.col))
	}
	translate(p){
		for(let i=0;i<this.pts.length;i++){
			this.pts[i]=this.pts[i].plus(p)
		}
		return this
	}
}
function decaleIndex(n,l){
	let rep=[]
	for(let i=0;i<l.length;i++){
		let inu=[]
		for(let j=0;j<l[i].length;j++){
			inu.push(l[i][j]+n)
		}
		rep.push(inu)
	}
	return rep
}
function decoupeTriangle(p1,p2,p3,coeff){
	if(coeff==undefined){
		coeff=10
	}
	let pts=[]
	for(let i=0;i<coeff+1;i++){
		for(let j=0;j<i+1;j++){
			pts.push(p1.plus(p2.moins(p1).scal(i/coeff)).plus(p3.moins(p2).scal(j/coeff)))
		}
	}
	let lks=[]
	for(let i=0;i<coeff;i++){
		for(let j=0;j<i;j++){
			lks.push([])
		}
	}
}
function randomColors(n){
	let rep=[]
	for(let i=0;i<n;i++){
		rep.push([Math.random(),Math.random(),Math.random()])
	}
	return rep
}