
class Music{
	static l=[]
	static vol=1
	constructor(src,vol=1,repete=0){
		this.src="sounds/"+src
		this.vol=vol
		this.repete=repete
		this.audio=new Audio(this.src)
		this.audio.volume=vol*Music.vol
		this.audio.loop=repete
		this.audio.play()
		Music.l.push(this)
	}
	static volAll(vol){
		Music.vol=vol
		for(let i=0;i<Music.l.length;i++){
			Music.l[i].audio.volume=vol*Music.l[i].vol
		}
	}
	static garbage(){
		let l2=[]
		for(let i=0;i<Music.l.length;i++){
			if(!Music.l[i].audio.ended && !Music.l[i].audio.loop){
				l2.push(Music.l[i])
			}
		}
		Music.l=l2
	}
	static stopAll(){
		for(let i=0;i<Music.l.length;i++){
			Music.l[i].audio.pause()
		}
		Music.l=[]
	}
}
