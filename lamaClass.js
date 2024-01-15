class Lama{
	static l=[]
	static grille={}
	static r=20
	static pileH=1.5
	constructor(pos,theta){
		this.pos=pos
		this.theta=theta
		this.vitesse=0.4
		this.ang=1
		this.t=Math.random()*2*Math.PI*10
		this.phase=1
		Lama.l.push(this)
		this.inuuuu=(Math.random()-0.5)*0.05
		this.mat=Matrix.id(4)
	}
	getShape(){
		if(this.phase==1){
			let a=Math.acos(this.normale.y)
			this.mat=p(this.ang,0,0).vitAngulaire_mat().trans(p(0,-this.theta,0).vitAngulaire_mat()).trans(PtCart.pv(p(0,1,0),this.normale.moins(p(0,1,0))).u().scal(a).vitAngulaire_mat()).cast(4).translate(this.pos)
		}else if(this.phase==2){
			this.mat=this.rot2.cast(4).translate(this.pos)
		}
		let s=Model.l["lama"].createPolyByMatrix(this.mat)
		this.shape=s
		return this.shape
	}
	actu(){
		this.t+=1
		if(this.phase==1){
			this.ang=0.5*Math.sin(this.t/5)
			this.pos=this.pos.plus(new PtPol(this.vitesse,0,this.theta).cart())
			this.theta+=this.inuuuu
			this.theta%=Math.PI*2
			let inu;
			try{
				inu=Tuile.topo(this.pos)
			}catch(e){
				inu={h:0,normale:p(0,1,0)}
				this.theta+=Math.PI
				this.theta%=Math.PI*2
				this.pos=this.pos.plus(new PtPol(1,0,this.theta).cart())
			}
			this.normale=inu.normale
			this.pos=this.pos.moins(this.normale.times(this.normale.y*inu.h)).plus(this.normale.times(2))
			this.reagitOthers()
		}else if(this.phase==2){
			this.pos=this.pos.plus(this.vit2)
			this.vit2.y-=0.03
			if(this.pos.y<-5){
				this.phase=3;
				Lama.suppress++
			}/////////CHANGE PHASE
			this.rot2=this.rot2.trans(this.vrot2.vitAngulaire_mat())
		}else if(this.phase==3){
			//poubelle
		}
		return this.getShape()
	}
	reagitOthers(){
		let a=[]
		let p1=Math.round((this.pos.x-this.pos.x%Lama.r)/Lama.r)
		let p2=Math.round((this.pos.z-this.pos.z%Lama.r)/Lama.r)
		for(let i=p1-1;i<=p1+1;i++){
			for(let j=p2-1;j<=p2+1;j++){
				let k=Lama.grid[[i,j]]
				if(k){
					for(let o=0;o<k.length;o++){
						let e=k[o]
						let d=(e.pos.x-this.pos.x)**2+(e.pos.z-this.pos.z)**2
						if(d<Lama.r**2 && d>0.1){
							a.push(e)
						}
					}
				}
			}
		}
		for(let i=0;i<a.length;i++){
			///alignement
			let da=a[i].theta-this.theta
			if(da>Math.PI){da-=Math.PI*2}
			if(da<-Math.PI){da+=Math.PI*2}
			this.theta+=(da)/10/a.length
			///separation +cohesion
			let d=Math.sqrt((a[i].pos.x-this.pos.x)**2+(a[i].pos.z-this.pos.z)**2)
			let direc=PtCart.scal(this.mat.pt(0),a[i].pos.moins(this.pos).u())
			if(direc>0){direc=1}else{direc=-1}
			let f=-0.1/(1+d**2/1000)+0.1/(1+(Lama.r-d)**2/100)
			this.theta+=direc*f
		}
	}
	static placeAll(){
		////////////////////JUSTE AVANT ACTU()
		Lama.grid={}
		let r=Lama.r
		for(let i=0;i<Lama.l.length;i++){
			if(Lama.l[i].phase==1){
				let inu=Lama.l[i]
				let a=Math.round((inu.pos.x-inu.pos.x%r)/r)
				let b=Math.round((inu.pos.z-inu.pos.z%r)/r)
				if(!Lama.grid[[a,b]]){Lama.grid[[a,b]]=[]}
				Lama.grid[[a,b]].push(inu)
			}
		}
	}
	static boumAll(voit){
		let minv=voit.glob.inv()
		for(let i=0;i<Lama.l.length;i++){
			if(Lama.l[i].phase==1){
				let dMan=Math.max(voit.pos.x-Lama.l[i].pos.x,voit.pos.z-Lama.l[i].pos.z)
				if(dMan<20){
					let k=Lama.l[i].pos.mat4().trans(minv).pt()
					//console.log(k)
					if(k.z<voit.Zplus+1 && k.z>voit.Zmoins-1 && k.x<2+1+1 && k.x>-2-1-1){
						Lama.l[i].phase=2
						Lama.l[i].vit2=voit.vitPoint(Lama.l[i].pos).u().times(2).plus(p(0,1,0))
						Lama.l[i].vrot2=p(Math.random()-0.5,Math.random()-0.5,Math.random()-0.5).u().times(0.3)
						Lama.l[i].rot2=Lama.l[i].mat.cast(3)
						new Music("rrahou.mp3",1,0)

					}
				}
			}
		}
	}
	static poubelle(){
		let l2;
		(l2=[]).length=Lama.l.length-Lama.suppress
		let j=0
		for(let i=0;i<Lama.l.length;i++){
			if(Lama.l[i].phase!=3){
				l2[j]=Lama.l[i]
				j++
			}else{
				let h=Lama.pileH
				Lama.pileH+=2
				Model.l['voiture'].addPoly(Model.l['lama'].createPolyByMatrix(p(0,0,Math.PI/2).vitAngulaire_mat().trans(p(0,Math.random()*2*Math.PI,0).vitAngulaire_mat()).cast(4).translate(p(0,h,-3))))
			}
		}
		Lama.l=l2
	}
}