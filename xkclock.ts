module XK {
  var TAU = 2*Math.PI;
  var sin = Math.sin;
  var cos = Math.cos;

  function hourToRad(hour: number): number {
    return TAU/4 + hour*TAU/24;
  }

  function arcText(ctx: CanvasRenderingContext2D, text: string, from: number, to: number, r: number) {
    if (to < from) {
      to += 24;
    }
    var fromRad = hourToRad(from), toRad = hourToRad(to);
    var w = ctx.measureText(text).width;
    var theta = (fromRad + toRad)/2 - (w/2)/r;
    for (var i = 0; i < text.length; ++i) {
      ctx.save();
      ctx.rotate(TAU/4 + theta);
      ctx.fillText(text[i], 0, -r);
      ctx.restore();

      var cw = ctx.measureText(text[i]).width;
      theta += cw/r;
    }
  }

  function thickLine(ctx: CanvasRenderingContext2D, text: string, from: number, to: number, or: number, ir: number) {
    var fromRad = hourToRad(from), toRad = hourToRad(to);
    ctx.beginPath();
    ctx.arc(0, 0, ir, fromRad, toRad);
    ctx.lineTo(cos(toRad)*or, sin(toRad)*or);
    ctx.arc(0, 0, or, toRad, fromRad, true);
    ctx.lineTo(cos(fromRad)*ir, sin(fromRad)*ir);
    ctx.stroke();
    arcText(ctx, text, from, to, (ir + or)/2);
  }

  function tick(ctx: CanvasRenderingContext2D, pos: number, ir: number, or: number) {
    var a = hourToRad(pos);
    var s = sin(a), c = cos(a);
    ctx.beginPath();
    ctx.moveTo(c*or, s*or);
    ctx.lineTo(c*ir, s*ir);
    ctx.stroke();
  }

  function circle(ctx: CanvasRenderingContext2D, r: number) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
  }

  class Ring {
    private _canvas: HTMLCanvasElement;
    private _theta = 0;

    constructor() {
      this._canvas = document.createElement("canvas");
      this._canvas.style.position = "absolute";
      this._canvas.style.left = "0px";
      this._canvas.style.top = "0px";
    }

    resize(size: number) {
      var halfSize = size/2;
      var scale = halfSize/1000;

      this._canvas.width = size;
      this._canvas.height = size;
      var ctx = this._canvas.getContext("2d");
      ctx.save();
      ctx.strokeStyle = "green";
      ctx.fillStyle = "green";
      ctx.lineWidth = 5;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "48px Helvetica";
      ctx.translate(halfSize, halfSize);
      ctx.scale(scale, scale);
      this.paint(ctx);
      ctx.restore();
    }

    canvas(): HTMLCanvasElement { return this._canvas; }

    theta(): number { return this._theta; }
    setTheta(theta: number) {
      this._theta = theta;
      this._canvas.style.transform = "rotate(" + theta + "rad)";
    }

    paint(ctx: CanvasRenderingContext2D) { }
  }

  class DateRing extends Ring {
    paint(ctx: CanvasRenderingContext2D) {
      var or = 980, ir = 900;
      thickLine(ctx, "Feb 2", 0, 20, or, ir);
      thickLine(ctx, "Feb 3", 20, 0, or, ir);
    }
  }

  class TimeRing extends Ring {
    paint(ctx: CanvasRenderingContext2D) {
      var or = 900, ir = 800;

      // rings.
      circle(ctx, or);
      circle(ctx, ir);

      // ticks.
      for (var i = 0; i < 24; i++) {
        if (i % 6 == 0) continue;
        tick(ctx, i, ir, or);
      }

      // numbers.
      var cr = (ir + or)/2;
      arcText(ctx, "24", 0, 0, cr);
      arcText(ctx, "6",  6, 6, cr);
      arcText(ctx, "12", 12, 12, cr);
      arcText(ctx, "18", 18, 18, cr);
    }
  }

  class HoursRing extends Ring {
    paint(ctx: CanvasRenderingContext2D) {
      var or = 800, ir = 740;

      thickLine(ctx, "rude to call", 22, 8, or, ir);
      thickLine(ctx, "business hours", 9, 17, or, ir);
    }
  }

  class ContinentRing extends Ring {
    paint(ctx: CanvasRenderingContext2D) {
      var or = 660, ir = 600;

      thickLine(ctx, "europe", 0, 3, ir, or);
      thickLine(ctx, "asia", 3, 12, ir, or);
      thickLine(ctx, "north america", 15, 20, ir, or);

      ir -= 80; or -= 80;
      thickLine(ctx, "africa", 0, 3, ir, or);
      thickLine(ctx, "oceania", 8, 13, ir, or);
      thickLine(ctx, "south america", 18, 21, ir, or);
    }
  }

  class Clock {
    private _container: HTMLElement;
    private _rings: Ring[] = [];
    private _dateRing: DateRing;
    private _timeRing: TimeRing;
    private _hoursRing: HoursRing;
    private _contRing: ContinentRing;

    constructor() {
      this._container = document.createElement("div");
      this._container.style.position = "absolute";

      this.addRing(this._dateRing = new DateRing());
      this.addRing(this._timeRing = new TimeRing());
      this.addRing(this._hoursRing = new HoursRing());
      this.addRing(this._contRing = new ContinentRing());
    }

    elem(): HTMLElement { return this._container; }

    resize(size: number) {
      for (var i = 0; i < this._rings.length; ++i) {
        this._rings[i].resize(size);
      }
    }

    private addRing(ring: Ring) {
      this._container.appendChild(ring.canvas());
      this._rings.push(ring);
    }
  }

  var clock = new Clock();
  document.body.appendChild(clock.elem());

  function resize() {
    var docElem = document.documentElement;
    var width = docElem.clientWidth, height = docElem.clientHeight;
    var size = width > height ? height : width;
    clock.resize(size);
    var elem = clock.elem();
    elem.style.left = ((width - size)/2) + "px";
    elem.style.top = ((height - size)/2) + "px";
  }

  window.onresize = resize;
  resize();
}