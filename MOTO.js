class Voit{
	constructor(pos){
		this.pos=pos
		this.vit=p(0,0,0)
		this.rot=Matrix.id(3)//p(0,1,0.3).vitAngulaire_mat()//Matrix.id(3)
		this.vrot=p(0.0,-0.0,0)//p(-0.03,0.0,0.00)
		this.grav=-10/60
		this.shape;
		this.roues=[new Roue(this,p(-2.3*2,-0.5*1.5,-4*1.5),3),new Roue(this,p(2.3*2,-0.5*1.5,-4*1.5),3),new Roue(this,p(-2.3*2,-0.5*1.5,4*1.5),3),new Roue(this,p(2.3*2,-0.5*1.5,4*1.5),3)]
		this.bij=range(this.roues.length)
		let inup=-10
		let inum=10
		for(let i=0;i<Model.l["voiture"].pts.length;i++){
			let z=Model.l["voiture"].pts[i].z
			if(z>inup){inup=z}
			if(z<inum){inum=z}
		}
		this.Zplus=inup
		this.Zmoins=inum
	}
	actu(){
		//this.vit=this.vit.times(0.99)
		//this.vrot=this.vrot.times(0.99)
		this.vit=this.vit.plus(p(0,this.grav,0))
		
		this.pos=this.pos.plus(this.vit)
		this.rot=Matrix.times(this.vrot.vitAngulaire_mat(),this.rot)
		let glob=this.rot.cast(4).translate(this.pos)
		
		
		//on actu roues *2

		this.oy=0
		for(let i=0;i<this.roues.length;i++){
			this.roues[i].actu()
			if(this.roues[i].oy<this.oy){this.oy=this.roues[i].oy}
		}
		this.pos.y-=this.oy
		if(this.oy==0){
			for(let i=0;i<this.roues.length;i++){
				this.roues[i].py+=this.roues[i].aj
			}
		}
		
		
		glob=this.rot.cast(4).translate(this.pos)
		this.glob=glob
		this.bij.push(this.bij.shift())
		this.shape=Model.l["voiture"].createPolyByMatrix(glob)
		for(let i=0;i<this.roues.length;i++){
			this.shape=this.shape.add(this.roues[this.bij[i]].actu())
		}
		this.vrot=this.vrot.moins(this.glob.pt(2).times(PtCart.scal(this.glob.pt(2),this.vrot)).scal(0.0))
		
		//correc torque
		let dz=this.glob.pt(2)
		let dy=new PtPol(1,dz.pol().phi+Math.PI/2,dz.pol().theta).cart()
		let dx=PtCart.pv(dz,dy)
		let m1=Matrix.fromPoints(dx,dy,dz).inv()
		let kinu=this.glob.pt(1).mat3().trans(m1).pt().pol()
		let correc=-(Math.PI/2-kinu.phi)/300*(1-this.glob.pt(2).y**2)
		if(kinu.theta<0){correc=-correc}
		this.vrot=this.vrot.plus(this.glob.pt(2).times(correc))
		
		
		return this.shape
	}
	ping(pos,vit){//absolues
		this.pingP(pos,vit.moins(this.vitPoint(pos)))
	}
	vitPoint(p){//absolue
		return this.vit.plus(this.vrot.vitAngulaire_vit(p.moins(this.pos)))
	}
	pingP(pos,vit){//absolues
		pos=pos.moins(this.pos)
		let u=pos.u()
		let sc=PtCart.scal(u,vit)
		this.vit=this.vit.plus(u.times(sc))
		vit=vit.moins(u.times(sc))

		let rapport=1/(1+pos.r()*2)///////CHANGER
		this.vit=this.vit.plus(vit.times(1-rapport))
		
		vit=vit.times(rapport)
		let va=PtCart.getVitAng(vit,pos)
		//let vc=PtCart.getVitAng(this.vrot.vitAngulaire_vit(pos),pos)
		this.vrot=this.vrot.plus(va)
	}
}	
class Roue{
	constructor(f,posRelative,taille,susp=0.01){
		this.posr=posRelative
		this.f=f
		this.taille=taille
		this.susp=susp
		this.py=0
		this.vy=0
		this.va=0
		this.pa=0
		this.offsety=0
		this.theta=0
		this.butTheta=0
		this.driftX=0.8//0 à 1
		this.driftY=0.8//0 à 1
	}
	actu(){
		this.theta+=(this.butTheta-this.theta)/10
		let theta=this.theta
		this.va/=1.03
		this.getShape()
		let glob=this.glob
		this.ginv=glob.inv()
		this.pa+=this.va
		this.py+=this.vy
		this.vpos=this.glob.pt(3)///véritable pos
		this.offsety=0
		
		this.f.pingP(this.vpos,this.glob.pt(1).times(this.vy*this.susp))
		this.vy-=this.py*this.susp*2*this.f.roues.length
		this.vy/=1.5
		
		let min={h:0,p:42,p1:42,normale:42}
		for(let k=0;k<40;k++){
			let a=k/40*Math.PI*2
			let p1=new PtPol(this.taille,a,0).cart()
			let p2=p1.mat4().trans(this.glob).pt()
			let topo=Tuile.topo(p2)
			if(topo.h<min.h){
				min.h=topo.h
				min.p1=p1
				min.p2=p2
				min.normale=topo.normale
			}
		}
		this.aj=0
		this.oy=0
		if(min.h!=0){
			//console.log(min)
			let but=this.vitPoint(min.p2)
			let dy=min.normale
			let dz=PtCart.pv(this.glob.pt(),min.p1).projPlan(dy).u()
			let dx=PtCart.pv(dz,dy)
			but=but.moins(dy.scal(PtCart.scal(but,dy))).scal(1)
			but=but.moins(dx.scal(PtCart.scal(dx,but)).times(1-this.driftX))
			but=but.moins(dz.scal(PtCart.scal(dz,but)).times(1-this.driftY))
			this.ping(min.p2,but)
			let sc1=PtCart.scal(min.normale,this.glob.pt(1))
			let d1=min.normale.y
			let aj=-min.h*d1/sc1//////PROBABMEMENT FAUX
			//console.log(aj,min.h,min.normale)
			if(Math.abs(aj)<1){//1
				this.oy=0
				this.aj=aj
			}else{
				this.oy=min.h
			}
			//console.log(this.vitPoint(min.p2.plus(this.glob.pt(1).times(aj))))
			//console.log(aj,Tuile.topo(.plus(p(0,1,0))).h)
			
		}
		return this.getShape()
	}
	ping(pos,vit){
		this.pingP(pos,vit.moins(this.vitPoint(pos)))
	}
	getShape(){
		let glob=p(0,this.theta,0).vitAngulaire_mat().cast(4).translate(this.posr.plus(p(0,this.py,0))).trans(this.f.rot.cast(4)).translate(this.f.pos)
		this.glob=glob
		this.shape=Model.l["roue"].createPolyByMatrix(p(-this.pa,0,0).vitAngulaire_mat().apply((e)=>e*this.taille).cast(4).trans(glob))
		return this.shape//AJOUTER TAILLE?
	}
	pingP(pos,vit){//pos sur le plan, absolu
		let pos0=pos
		pos=pos.mat4().trans(this.ginv).pt()
		vit=vit.mat3().trans(this.ginv.cast(3)).pt()
		
		let xv=vit.x
		vit.x=0
		
		let u=pos.u()
		let sc=PtCart.scal(u,vit)
		let va=PtCart.pv(u,vit)
		
		let rapport=0.6
		this.va-=va.x*(1-rapport)
		
		let pi=p(xv,0,0)
		pi=pi.plus(PtCart.pv(va,u).scal(rapport))
		pi=pi.plus(u.scal(sc))
		this.vy+=pi.y*0.5
		pi.y*=(1-0.5)
		this.f.pingP(pos0,pi.mat3().trans(this.glob.cast(3)).pt())
	}
	vitPoint(pos){//absolue
		return this.f.vitPoint(pos).plus(PtCart.pv(this.glob.pt().times(-this.va),pos.moins(this.vpos))).plus(this.glob.pt(1).times(this.vy))
	}
}