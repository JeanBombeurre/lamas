
class Matrix{
	constructor(shape,det){
		this.shape=shape
		this.h=this.shape.length
		this.l=this.shape[0].length
		this.w=this.l
		if(this.h==1 && this.w==1){
			this.det=this.shape[0][0]
			det=this.det
		}
		if(det==undefined && this.h==this.w){
			if(this.h==2 && this.l==2){
				this.det=this.get(1,1)*this.get(2,2)-this.get(2,1)*this.get(1,2);
			}else if(this.h==3 && this.l==3){
				var rep=0;
				rep+=this.get(1,1)*this.get(2,2)*this.get(3,3)+this.get(1,2)*this.get(2,3)*this.get(3,1)+this.get(1,3)*this.get(2,1)*this.get(3,2)-this.get(3,1)*this.get(2,2)*this.get(1,3)-this.get(3,2)*this.get(2,3)*this.get(1,1)-this.get(3,3)*this.get(2,1)*this.get(1,2)
				this.det=rep;
			}else{
				let rep=0
				for(let i=0;i<this.h;i++){
					let d=this.hors(i,0).det*pairimpair(i)*this.shape[i][0]
					rep+=d
				}
				this.det=rep
			}
		}else{
			this.det=det
		}
	}
	get(x,y){
		return this.shape[y-1][x-1];
	}
	aff(){
		for(let i=0;i<this.h;i++){
			console.log(this.shape[i])
		}
		console.log("-----")
	}
	apply(f){
		for(let i=0;i<this.h;i++){
			for(let j=0;j<this.l;j++){
				this.shape[i][j]=f(this.shape[i][j])
			}
		}
		return this
	}
	T(){
		let rep=[]
		for(let l=0;l<this.l;l++){
			let inul=[]
			for(let c=0;c<this.h;c++){
				inul.push(this.shape[c][l])
			}
			rep.push(inul)
		}
		return new Matrix(rep)
	}
	static empty(h,l,n){
		var rep=[]
		for(let i=0;i<h;i++){
			rep.push([])
			for(let j=0;j<l;j++){
				rep[i].push(n);
			}
		}
		return (new Matrix(rep));
	}
	
	static plus(a,b){
		var rep=a.shape
		for(let i=0;i<a.h;i++){
			for(let j=0;j<a.l;j++){
				rep[i][j]=a.shape[i][j]+b.shape[i][j]
			}
		}
		return new Matrix(rep)
	}
	static times(a,b){
		let rep=[]
		for(let i=0;i<a.h;i++){
			let inu=[]
			for(let j=0;j<b.l;j++){
				inu.push(0)
			}
			rep.push(inu)
		}
		
		for(let i=0;i<a.h;i++){
			for(let j=0;j<b.l;j++){
				var inul=0
				for(let n=0;n<a.l;n++){
					inul+=a.shape[i][n]*b.shape[n][j]
				}
				rep[i][j]=inul;
			}
		}
		return new Matrix(rep);
	}
	static id(n){
		if(n==undefined){
			n=3
		}
		let r=[]
		for(let i=0;i<n;i++){
			let r2=[]
			for(let j=0;j<n;j++){
				r2.push((i==j)?1:0)
			}
			r.push(r2)
		}
		return new Matrix(r,1)
	}	
	inv(){
		var rep=[]
		let d=this.det
		//check if MtM=Id
		let mt=this.T().apply((x)=>x/(this.det**2))
		let inu=Matrix.times(mt,this)
		let err=0
		for(let i=0;i<inu.w;i++){
			for(let j=0;j<inu.w;j++){
				err+=Math.abs(inu.shape[i][j]-(i==j))
			}
		}
		if(err<0.01){return mt}
		for(let i=0;i<this.h;i++){
			let r2=[]
			for(let j=0;j<this.h;j++){
				r2.push(this.hors(j,i).det/d*pairimpair(i+j))
			}
			rep.push(r2)
		}
		return new Matrix(rep,1/this.det)
	}
	hors(y,x){
		let r=[]
		for(let i=0;i<this.h;i++){
			if(i!=y){
				let r2=[]
				for(let j=0;j<this.w;j++){
					if(j!=x){
						r2.push(this.shape[i][j])
					}
				}
				r.push(r2)
			}
		}
		return new Matrix(r)
	}
	static tourneVect(v,a){//tourne autour de l'axe de rotation v
		if(a==0){
			return Matrix.id()
		}
		let x=v.u()
		let inu=x.pol()
		if(!inu.theta){
			inu.theta=0
		}
		let y=new PtPol(1,inu.phi+Math.PI/2,inu.theta).cart()
		
		let fin=PtCart.pv(x,y).scal(a)
				
		return Matrix.rot(fin,y)
	}
	static rot(v,p){
		v=v.projPlan(p.u())
		if(dist3d(0,0,0,v.x,v.y,v.z)==0){
			return Matrix.id()
		}
		let dy=v.u()
		let dz=new PtCart(-p.x,-p.y,-p.z).u()
		let dx=PtCart.pv(dz,dy)
		let m=Matrix.fromPoints(dx,dy,dz)
		let inv=m.inv()
		let amp=dist3d(v.x,v.y,v.z,0,0,0)/dist3d(p.x,p.y,p.z,0,0,0)
		let inu2=Matrix.times(Matrix.tourneVerti(-amp),inv)
		return Matrix.times(m,inu2)
	}
	static tourneVerti(a){
		let z=new PtPol(1,a,0).cart()
		let y=new PtPol(1,a+Math.PI/2,0).cart()
		let x=new PtCart(1,0,0)
		return Matrix.fromPoints(x,y,z)
	}
	static fromPoints(dx,dy,dz){
		return new Matrix([[dx.x,dy.x,dz.x],
						   [dx.y,dy.y,dz.y],
						   [dx.z,dy.z,dz.z]])
	}
	point(){
		return new PtCart(this.shape[0][0],this.shape[1][0],this.shape[2][0])
	}
	translate(p){
		let t=new Matrix([[1,0,0,p.x],[0,1,0,p.y],[0,0,1,p.z],[0,0,0,1]])
		return Matrix.times(t,this)
	}
	static translate(p){
		let t=new Matrix([[1,0,0,p.x],[0,1,0,p.y],[0,0,1,p.z],[0,0,0,1]])
		return t
	}
	cast(n){
		let rep=Matrix.id(n).shape
		for(let i=0;i<this.w && i<n;i++){
			for(let j=0;j<this.h && j<n;j++){
				rep[j][i]=this.shape[j][i]
			}
		}
		return new Matrix(rep)
	}
	pt(n){
		if(n==undefined){
			n=0
		}
		return new PtCart(this.shape[0][n],this.shape[1][n],this.shape[2][n])
	}
	accRot(v,p){
		let v2=Matrix.times(this,v.mat3()).pt()
		let p2=Matrix.times(this,p.mat3()).pt()
		return Matrix.times(Matrix.rot(v2,p2) , this)
	}
	static fromPoints(dx,dy,dz){
		return new Matrix([[dx.x,dy.x,dz.x],
						   [dx.y,dy.y,dz.y],
						   [dx.z,dy.z,dz.z]])
	}
	push(mat,det){
		let rep=this.shape
		for(let i=0;i<mat.shape.length;i++){
			rep[i].push(mat.shape[i][0])
		}
		return new Matrix(rep,det)
	}
	trans(m){
		return Matrix.times(m,this)
	}
}
function dist3d(x,y,z,x2,y2,z2){
	return Math.sqrt((x-x2)**2+(y-y2)**2+(z-z2)**2)
}
function pairimpair(n){
	if(n%2==0){
		return 1
	}else{
		return -1;
	}
}

function cartPol(x,y){
	var d=Math.sqrt(x*x+y*y)
	var ang=Math.acos(x/d)
	if(y<0){
		ang=-ang
	}
	return {r:d,ang:ang};
}
function polCart(r,ang){
	var x=Math.cos(ang)*r
	var y=Math.sin(ang)*r
	return {x:x,y:y};
}

class PtPol{
	constructor(r,phi,theta){
		this.phi=phi
		this.theta=theta
		this.r=r
	}
	cart(){
		var inu=polCart(this.r,this.phi)
		var diag=inu.x
		var inu2=polCart(diag,this.theta)
		
		return new PtCart(inu2.y,inu.y,inu2.x)
	}
}
class PtCart{
	constructor(x,y,z){
		this.x=x
		this.y=y
		this.z=z
	}
	opp(){return new PtCart(-this.x,-this.y,-this.z)}
	pol(){
		var d=Math.sqrt(this.x**2+this.z**2+this.y**2)
		var phi=Math.asin(this.y/d)
		var theta=cartPol(this.z,this.x).ang
		return new PtPol(d,phi,theta)
	}
	static pv(b,a){////////////bizarre
		return new PtCart(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x)
	}
	u(){
		let d=Math.sqrt(this.x**2+this.y**2+this.z**2)
		if(d==0){
			return new Pt(0,0,0)
		}
		return p(this.x/d,this.y/d,this.z/d)
	}
	mat(){
		return new Matrix([[this.x],[this.y],[this.z]])
	}
	mat3(){
		return new Matrix([[this.x],[this.y],[this.z]])
	}
	mat4(){
		return new Matrix([[this.x],[this.y],[this.z],[1]])
	}
	scal(n){
		return p(this.x*n,this.y*n,this.z*n)
	}
	sc(n){
		return p(this.x*n,this.y*n,this.z*n)
	}
	times(n){
		return p(this.x*n,this.y*n,this.z*n)
	}
	static plus(a,b){
		return new PtCart(a.x+b.x,a.y+b.y,a.z+b.z)
	}
	static dist(a,b){
		return Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2+(a.z-b.z)**2)
	}
	static moins(a,b){
		return new PtCart(a.x-b.x,a.y-b.y,a.z-b.z)
	}
	static minus(a,b){
		return new PtCart(a.x-b.x,a.y-b.y,a.z-b.z)
	}
	static scal(a,b){
		return a.x*b.x+a.y*b.y+a.z*b.z
	}
	moins(b){
		return PtCart.moins(this,b)
	}
	minus(b){
		return PtCart.moins(this,b)
	}
	plus(b){
		return PtCart.plus(this,b)
	}
	projPlan(p){// p normale
		if(p.x==0 && p.y==0 && p.z==0){return new Pt(0,0,0)}
		p=p.u()
		let sc=PtCart.scal(p,this)
		return this.moins(p.sc(sc))
	}
	r(){
		return Math.sqrt(this.x**2+this.y**2+this.z**2)
	}
	vitAngulaire_vit(p){
		return PtCart.pv(this,p)
	}
	vitAngulaire_pos(p){
		return Matrix.times(this.vitAngulaire_mat(),this.mat3()).pt()//erreur?
	}
	vitAngulaire_mat(){//matrice rot correspondante (formule wiki)
		/*if(this.r()==0){return Matrix.id(3)}
		let inu=this.pol()
		let dy=this.u()
		let dz=new PtPol(1,inu.phi-Math.PI/2,(inu.theta)?inu.theta:0).cart()
		let dx=PtCart.pv(dy,dz)
		return Matrix.rot(dx.scal(this.r()),dz)*/
		let r=this.r()
		if(r==0){return Matrix.id(3)}
		let u=this.scal(1/r)
		let c=Math.cos(r)
		let s=-Math.sin(r)
		return new Matrix([
		[c+u.x*u.x*(1-c),u.x*u.y*(1-c)-u.z*s,u.x*u.z*(1-c)+u.y*s],
		[u.x*u.y*(1-c)+u.z*s,c+u.y*u.y*(1-c),u.y*u.z*(1-c)-u.x*s],
		[u.z*u.x*(1-c)-u.y*s,u.z*u.y*(1-c)+u.x*s,c+u.z*u.z*(1-c)]],1)
		
	}
	static getVitAng(v,p){
		return PtCart.pv(p,v).scal(1/p.r()/p.r())
	}
	ajusteBut(u,but,puis){
		let sc=PtCart.scal(u,this)
		let aj=puis*(but-sc)
		return this.plus(u.scal(aj))
	}
	copy(){return new PtCart(this.x,this.y,this.z)}
}
const Pt=PtCart
function p(x,y,z){
	return new PtCart(x,y,z)
}
function range(a,b,p){
	if(p==undefined){
		if(b==undefined){
			return range(0,a,1)
		}else{
			return range(a,b,1)
		}
	}
	let i=a
	let rep=[]
	while (i<b){
		rep.push(i)
		i+=p
	}
	return rep
}
function len(n){
	let rep;
	(rep=[]).length=n
	return rep
}