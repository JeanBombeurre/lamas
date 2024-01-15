class Tuile{
	static l=[];
	static posPts={}
	static generatedChunks={}
	static visitedChunks={}
	static pionspos={}
	constructor(ipts,col){
		if(col==undefined){col=[0.76+Math.random()*0.1,0.698+Math.random()*0.1,0.502+Math.random()*0.1]}
		this.ipts=ipts
		let pts=[Tuile.posPts[ipts[0]],Tuile.posPts[ipts[1]],Tuile.posPts[ipts[2]]]
		this.pts=pts
		this.col=col
		this.affpts=[]
		this.affc=[]
		for(let i=0;i<3;i++){
			this.affpts.push(pts[i].x,pts[i].y,pts[i].z)
			this.affc.push(...col)
		}
		w.addBGPoly(this.affpts,this.affc)
		this.n=PtCart.pv(this.pts[1].moins(this.pts[0]),this.pts[2].moins(this.pts[0])).u()
		if(this.n.y<0){
			this.pts=[this.pts[0],this.pts[2],this.pts[1]]
			this.n=this.n.opp()
		}
		Tuile.l.push(this)
		this.hypo=0
		let repinu=0
		for(let i=0;i<3 && repinu==0;i++){
			if((this.pts[i].x==this.pts[(i+1)%3].x && this.pts[i].z==this.pts[(i+2)%3].z) || (this.pts[i].x==this.pts[(i+2)%3].x && this.pts[i].z==this.pts[(i+1)%3].z)){this.hypo=i;repinu=1}
		}
		//console.log(this.pts,this.hypo)
		let min=[Math.min(this.pts[0].x,this.pts[1].x,this.pts[2].x),Math.min(this.pts[0].z,this.pts[1].z,this.pts[2].z)]
		if(!Tuile.pionspos[min]){Tuile.pionspos[min]=[]}
		Tuile.pionspos[min].push(Tuile.l.length-1)
	}
	situ(x,z){
		let rep=0
		for(let i=0;i<3;i++){
			let a=this.pts[i]
			let b=this.pts[(i+1)%3]
			if((a.z<=z && b.z>=z) || (a.z>=z && b.z<=z)){
				let xinter=a.x+(z-a.z)/(b.z-a.z)*(b.x-a.x)
				if(xinter>x){
					rep++
				}else if(xinter==x){return 1}
			}
		}
		return rep%2==1
	}
	static situ(x,z){
		let inu=[Math.floor(x/20)*20,Math.floor(z/20)*20]
		//console.log(Tuile.pionspos[inu],inu,x,z)
		for(let i=0;i<Tuile.pionspos[inu].length;i++){
			if(Tuile.l[Tuile.pionspos[inu][i]].situ(x,z)){return Tuile.pionspos[inu][i]}
		}
	}
	static topo(po){//return offsety,normale
		let inu=Tuile.l[Tuile.situ(po.x,po.z)]
		let n=inu.n
		let u=p(0,-1,0)
		let d1=PtCart.scal(n,po.moins(inu.pts[0]))
		let sc=PtCart.scal(u,n)
		return {h:-d1/sc,normale:n}
	}
	static generateChunk(x,z){
		if(Tuile.generatedChunks[[x,z]]){
			return
		}
		Tuile.generatedChunks[[x,z]]=1
		let larg=100
		let long=100
		for(let i=x;i<larg+x;i+=20){
			for(let j=z;j<long+z;j+=20){
				let y=perlin(i/100+0.01,j/100+0.01)*600*1.3*1//////////////////////////////////
				Tuile.posPts[[i,j]]=p(i+Math.random()*0,y,j+Math.random()*0)/////CHANGER ICI OFFSET HORIZONTAL TUILES
			}
		}

		for(let i=x;i<=larg+x;i+=20){
			for(let j=z;j<=long+z;j+=20){
				if(Tuile.posPts[[i,j]]){
					let ll=[[-1,-1],[-1,0],[0,-1]]
					let rep=1
					for(let k=0;k<3;k++){
						let a=Tuile.posPts[[i+ll[k][0]*20,j+ll[k][1]*20]]
						if(!a){
							rep=0
						}
					}
					if(rep){
						if(Math.random()<0.5){
							new Tuile([[i-20,j],[i-20,j-20],[i,j]])
							new Tuile([[i-20,j-20],[i,j-20],[i,j]])
						}else{
							new Tuile([[i-20,j],[i,j-20],[i,j]])
							new Tuile([[i-20,j-20],[i,j-20],[i-20,j]])
						}
					}

				}
			}
		}
	}
	static generate(p,dir){///POSITION CAM
		let cinu=[Math.round(p.x/100)*100,Math.round(p.z/100)*100]
		if(!Tuile.currChunk || !Tuile.visitedChunk[cinu]){
			for(let i=cinu[0]-400;i<=cinu[0]+400;i+=100){
				for(let j=cinu[1]-400;j<=cinu[1]+400;j+=100){if((cinu[0]-i)**2+(cinu[1]-j)**2<=14*100*100){Tuile.generateChunk(i,j)}}
			}
		}
		Tuile.visitedChunks[cinu]=1
	}
}
