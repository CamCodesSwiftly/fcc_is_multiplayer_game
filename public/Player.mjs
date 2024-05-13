class Player {
  constructor({x, y, score, id, color}) {
    this.x=x,
    this.y=y,
    this.score=score,
    this.id=id,
    this.r=16,
    this.color=color
  }

  draw(ctx){
    ctx.beginPath();
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth=3
    ctx.strokeStyle= 'black'
    ctx.stroke()
  }

  movePlayer(dir, speed) {
    const edge=this.r+speed //restrict player movement to canvas
    if (dir=='up' && this.y>edge+44){
      this.y-=speed
    }
    else if (dir=='down' && this.y<480-edge){
      this.y+=speed
    }
    else if (dir=='left' && this.x>edge){
      this.x-=speed
    }
    else if (dir=='right' && this.x<640-edge){
      this.x+=speed
    }
  }

  collision(item) {
    const range=item.r+this.r
    if ((item.x+range>this.x && item.x-range<this.x) && (item.y+range>this.y && item.y-range<this.y)){
      // make sure subsequent collisions with the same item wont return true
      delete item.x
      delete item.y
      return true
    }
  }

  calculateRank(arr) {
    const sortedPlayers=arr.sort((a, b)=>b.score-a.score)
    const playerRank=sortedPlayers.findIndex(player=>player.id==this.id)+1
    return `Rank: ${playerRank}/${arr.length}`
  }
}

export default Player;
