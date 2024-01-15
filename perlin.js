let GradientsForPerlin={}
function perlin(x,y){
	let a=Math.floor(x)
	let b=Math.floor(y)
	let ll=[[0,0],[1,0],[1,1],[0,1]]
	let rep=0
	let cof=[]
	for(let i=0;i<4;i++){
		cof[i]=Math.abs((x-a-ll[i][0])*(y-b-ll[i][1]))/4
	}
	for(let i=0;i<4;i++){
		let x2=a+ll[i][0]
		let y2=b+ll[i][1]
		if(!GradientsForPerlin[[x2,y2]]){
			let al=Math.random()*2*Math.PI
			GradientsForPerlin[[x2,y2]]=[Math.sin(al),Math.cos(al)]
		}
		let dep=[x-x2,y-y2]
		let inu=GradientsForPerlin[[x2,y2]]
		let sc=dep[0]*inu[0]+dep[1]*inu[1]
		rep+=sc*(cof[(i+2)%4]**2)
	}
	return rep
}