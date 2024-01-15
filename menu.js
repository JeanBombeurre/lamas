let infomenu={}
let mousePressed=0
function faireMenu(){
	infomenu.cam=new Cam(p(0,0,-10),p(0,0,1),500)
	Model.l.fond.addPoly(motPoly("start").translate(p(0,0,-0.1)))
	infomenu.pa=0
	infomenu.go=1
	infomenu.credits=["credits:","tres grand maitre de l'informatique et des mathematiques:","paflechien","dompteur de lamas professionnel et mecano en chef:","jean bombeurre","createur de mondes et maitre de l'orthograffe:","darkpetitpois","","","","","","","compositeur-troubadour:","chimpmunk workout"]
	infomenu.credModels=[]
	let tailles=[0.8,0.3,0.6,0.3,0.6,0.3,0.6,0,0,0,0,0,0,0.3,0.2]
	for(let i=0;i<infomenu.credits.length;i++){
		infomenu.credModels.push(motPoly(infomenu.credits[i],1,tailles[i]).translate(p(0,15-i*2,0)))
	}
	infomenu.startTaille=1
	mainMenu()
}
function mp(e){
	mousePressed=1
}
function mainMenu(){
	let pan=Model.l["fond"].createPolyByMatrix(p(infomenu.pa,0,0).vitAngulaire_mat().apply((e)=>infomenu.startTaille*e).cast(4).translate(p(0,-3,0)))
	infomenu.startTaille=1+(infomenu.startTaille-1)/1.1
	let listePoly=[pan]
	for(let i=0;i<infomenu.credModels.length;i++){
		listePoly.push(infomenu.credModels[i])
	}
	
	w.drawPolys(listePoly,infomenu.cam)
	let pos=[p(-7,-6,0),p(7,0,0)]
	let wd=infomenu.cam.viewMatrix()
	for(let i=0;i<pos.length;i++){
		pos[i]=pos[i].mat4().trans(wd).pt()
		pos[i].x/=pos[i].z
		pos[i].y/=pos[i].z
		pos[i].x*=canvas.width/2
		pos[i].y*=canvas.height/2
		
	}
	if(mousePressed){
		mousePressed=0
		if(mousePos.x>pos[0].x && mousePos.x<pos[1].x && mousePos.y>pos[0].y && mousePos.y<pos[1].y){
			infomenu.pa+=0.3
		}
	}
	if(mousePos.x>pos[0].x && mousePos.x<pos[1].x && mousePos.y>pos[0].y && mousePos.y<pos[1].y){
			infomenu.startTaille+=(infomenu.startTaille-1.2)/(-5)
	}
	if(infomenu.pa!=0){infomenu.pa+=0.3}
	if(infomenu.pa>Math.PI*2+0.5){
		infomenu.go=0
	}
	if(infomenu.go){window.requestAnimationFrame(mainMenu)}else{game()}
}
function lettreModel(c,epaisseur=0.1){
	c=c.toUpperCase()
	if(Model.l[c]){return Model.l[c]}
	/////box -1 +1
	let dict={"A":[-1,-1,0,1,0,1,1,-1,0.5,0,-0.5,0],"S":[1,1,-1,1,-1,1,-1,0,-1,0,1,0,1,0,1,-1,1,-1,-1,-1],"T":[1,1,-1,1,0,1,0,-1],"R":[-1,-1,-1,1,-1,1,1,1,1,1,1,0,1,0,-1,0,-1,0,1,-1],"C":[1,1,-1,1,-1,1,-1,-1,-1,-1,1,-1],"E":[1,1,-1,1,-1,1,-1,-1,-1,-1,1,-1,-1,0,1,0]," ":[],"D":[-1,1,-1,-1,-1,-1,0.8,-1,0.8,-1,1,0,1,0,0.8,1,0.8,1,-1,1],'I':[0,1,0,-1],'O':[-1,-1,1,-1,1,-1,1,1,1,1,-1,1,-1,1,-1,-1],'U':[-1,1,-1,-1,-1,-1,1,-1,1,-1,1,1],'P':[-1,-1,-1,1,-1,1,1,1,1,1,1,0,1,0,-1,0],":":[0,0.7,0,0.6,0,-0.7,0,-0.6],'M':[-1,-1,-1,1,-1,1,0,0,0,0,1,1,1,1,1,-1],'L':[-1,1,-1,-1,-1,-1,1,-1],'N':[-1,-1,-1,1,-1,1,1,-1,1,-1,1,1],"F":[-1,-1,-1,1,-1,1,1,1,-1,0,1,0],'Q':[-1,-1,1,-1,1,-1,1,1,1,1,-1,1,-1,1,-1,-1,0.5,-0.5,1,-1],"'":[0,1,0,0.7],'H':[-1,-1,-1,1,-1,0,1,0,1,1,1,-1],'/':[-0.7,-1,0.7,1],"J":[0.3,1,0.3,-1,0.3,-1,-1,-1,-1,-1,-1,0],'B':[-1,1,-1,-1,-1,-1,0.8,-1,0.8,-1,1,0,1,0,0.8,1,0.8,1,-1,1,-1,0,1,0],'K':[-1,-1,-1,1,-1,0,1,1,-1,0,1,-1],'W':[-1,1,-0.5,-1,-0.5,-1,0,0,0,0,0.5,-1,0.5,-1,1,1],'G':[1,1,-1,1,-1,1,-1,-1,-1,-1,1,-1,1,-1,1,0,1,0,0.5,0],'-':[-0.4,0,0.4,0],"0":[-1,-1,1,-1,1,-1,1,1,1,1,-1,1,-1,1,-1,-1],'1':[0,1,0,-1],"2":[-1,1,1,1,1,1,1,0,1,0,-1,-1,-1,-1,1,-1],'3':[-1,1,1,1,1,1,1,-1,1,-1,-1,-1,1,0,-1,0],'4':[-1,1,-1,-0.5,-1,-0.5,1,-0.5,0,0,0,-1],'5':[1,1,-1,1,-1,1,-1,0,-1,0,1,0,1,0,1,-1,1,-1,-1,-1],'6':[1,1,-1,1,-1,1,-1,-1,-1,-1,1,-1,1,-1,1,0,1,0,-1,0],'7':[-1,1,1,1,1,1,0,-1],'8':[1,1,-1,1,-1,1,-1,-1,-1,-1,1,-1,-1,0,1,0,1,1,1,-1],'9':[-1,-1,1,-1,1,-1,1,1,1,1,-1,1,-1,1,-1,0,-1,0,1,0],'.':[0,-1,0,-0.8],'V':[-1,1,0,-1,0,-1,1,1]}
	let inu=dict[c]
	if(!inu){throw "pas de lettre définie pour "+c}
	let l1=[]
	let ll=[]
	let col=[]
	for(let i=0;i<inu.length;i+=4){
		let a=p(inu[i],inu[i+1],0)
		let b=p(inu[i+2],inu[i+3],0)
		let u=b.moins(a).u().times(epaisseur)
		let u2=p(-u.y,u.x,0)
		ll.push([l1.length,l1.length+1,l1.length+2,l1.length+3])
		l1.push(a.plus(u2).moins(u),b.plus(u2).plus(u),b.moins(u2).plus(u),a.moins(u).moins(u2))
		col.push([0,0,0])
	}
	return new Model(l1,ll,col,c)
}
function motPoly(s,center=1,size=1){
	let rep=new Poly([],[],[])
	let x=0
	for(let i=0;i<s.length;i++){
		let c=lettreModel(s[i])
		rep=rep.add(c.createPolyByMatrix(Matrix.id(3).apply((e)=>e*size).cast(4).translate(p(x,0,0))))
		x+=2.5*size
	}
	if(center){
		let dec=-(x-2.5*size)/2
		for(let i=0;i<rep.pts.length;i++){
			rep.pts[i].x+=dec
		}
	}
	return rep
}