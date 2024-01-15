class Autruche{
	static l=[]
	constructor(pos,theta){
		this.pos=pos
		this.theta=theta
		this.t=-Math.random()*Math.PI*2
		this.phi=0
		Autruche.l.push(this)
	}
	getGlob(){
		let glob=p(this.phi,0,0).vitAngulaire_mat().trans(p(0,this.theta,0).vitAngulaire_mat()).cast(4).translate(this.pos)
		this.glob=glob
		return glob
	}
	getShape(){
		let rep=Model.l.autruche.createPolyByMatrix(this.glob)
		let alpha=Math.sin(this.t/5)
		rep=rep.add(Model.l.aileAutruche.createPolyByMatrix(p(0,0,alpha).vitAngulaire_mat().cast(4).trans(this.glob)))
		rep=rep.add(Model.l.aileAutruche.createPolyByMatrix(new Matrix([[-1,0,0],[0,1,0],[0,0,1]]).trans(p(0,0,-alpha).vitAngulaire_mat()).cast(4).trans(this.glob)))
		return rep
	}
	actu(){
		this.pos=this.pos.plus(new PtPol(0.6,this.phi,-this.theta).cart())
		this.getGlob()
		if(this.t%200<1 && Lama.l.length>0){
			this.tar=Math.floor(Math.random()*Lama.l.length)
		}

		if(this.tar!=undefined && this.tar<Lama.l.length){
			let aut=Lama.l[this.tar].pos.moins(this.pos)
			let inu=aut.mat3().trans(p(0,-this.theta,0).vitAngulaire_mat()).pt()
			let dtheta=-0.01
			if(inu.x<0){dtheta*=-1}
			this.theta+=dtheta
		}
		if(Lama.l.length==0){
			this.phi+=(Math.PI/2-this.phi)/400
		}
		
		
		this.t++
		return this.getShape()
	}
	static garbage(){
		if(Lama.l.length==0){
			let l2=[]
			for(let i=0;i<Autruche.l.length;i++){
				if(Autruche.l[i].pos.y<300){l2.push(Autruche.l[i])}
			}
			Autruche.l=l2
		}
	}
}