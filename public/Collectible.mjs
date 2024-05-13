class Collectible {
  constructor({x, y, value, id, color}) {
    this.x=x,
    this.y=y,
    this.value=value,
    this.id=id,
    this.color=color,
    this.r=8
  }

  draw(ctx){
    ctx.beginPath();
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth=3
    ctx.strokeStyle='yellow'
    ctx.stroke()
    // score tag for the collectible
    ctx.fillStyle= 'black'
    ctx.font = `bold 16px sans-serif`
    ctx.fillText(this.value, this.x-this.r, this.y-12)
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
