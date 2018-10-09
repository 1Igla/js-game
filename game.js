'use strict';

//позволяет контролировать расположение объектов
class Vector {
	constructor(x = 0,y = 0){
		this.x = x;
		this.y = y;
	}

	plus(obj){
		if(!(obj instanceof Vector)){
			throw  new Error('Можно прибавлять к вектору только вектор типа Vector');
		}
		return new Vector(this.x + obj.x, this.y + obj.y);
	}

	times(multiplier){
		return new Vector(this.x * multiplier, this.y * multiplier);
	}
};

//позволит контролировать все движущиеся объекты на игровом поле и контролировать их пересечение
class Actor{
	constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0)) {
		if (!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector)) {
			throw new Error('Аргументы должны быть только типа Vector');
		}
		this.pos = pos;
		this.size = size;
		this.speed = speed;
	};

  act(){}

  get left(){
		return this.pos.x;
	}

  get top(){
    return this.pos.y;
  }

  get right(){
    return this.pos.x + this.size.x;
  }

  get bottom(){
    return this.pos.y + this.size.y;
  }

	get type(){
		return 'actor';
	}

	isIntersect(actor){
		if(!(actor instanceof Actor) || (actor === '')) {
			throw new Error(`Аргумент должен быть типа Actor`);
		}

		if(actor === this){
			return false;
		}

		return (this.right > actor.left &&
					 this.top < actor.bottom &&
					 this.left < actor.right &&
					 this.bottom > actor.top);
		}
};

// Игровое поле
class Level{
	constructor(grid=[], actors=[]){ //сетку игрового поля с препятствиями и список движущихся объектов
		this.grid = grid; //сетку игрового поля, двумерный массив
		this.actors = actors; // список движущихся объектов
    for(let actor of actors) {
      if(actor.type === 'player') {
        this.player = actor;
        break;
      }
    }
		this.height = this.grid.length; //высоту игрового поля, равное числу строк в сетке из первого аргумента.
		this.width = this.grid.reduce((memo, item) => {
        if (memo > item.length) {
          return memo;
        } else {
          return item.length;
        }
      }, 0); // ширину игрового поля, равное числу ячеек в строке сетки из первого аргумента
    this.status = null;
    this.finishDelay = 1;

		if(grid.length !== 0){
			for(let arr of this.grid){
				if(typeof arr != 'undefined'){
					if(this.width < arr.length){
						this.width = arr.length;
					}
				}
			}
		}
	};

	isFinished(){
		 return this.status != null && this.finishDelay < 0;
	};

	actorAt(actor){
		if(!(actor instanceof Actor)){
			throw new Error('Движущийся объект должен иметь тип Actor');
		}
		return this.actors.find(memo => memo.isIntersect(actor));
	};

	obstacleAt(pos, size){
		if(!(pos instanceof Vector) || !(size instanceof Vector)) {
			throw 'объект должен быть типом Vector';
		}

		const xStart = Math.floor(pos.x);
		const xEnd = Math.ceil(pos.x + size.x);
		const yStart = Math.floor(pos.y);
		const yEnd = Math.ceil(pos.y + size.y);

		if (xStart < 0 || xEnd > this.width || yStart < 0) {
			return 'wall';
		}

		if (yEnd > this.height) {
			return 'lava';
		}

		for (var y = yStart; y < yEnd; y++) {
			for (var x = xStart; x < xEnd; x++) {
				const l = this.grid[y][x];
				if (l) {
					return l;
				}
			}
		}
	};

	removeActor(actor){
		const i = this.actors.indexOf(actor);
		this.actors.splice(i, 1);
	};

	noMoreActors(type){
		for(var actor of this.actors){
			if(actor.type === type){
				return false;
				}
		 }
		return true;
	};

	playerTouched(type, actor){
		if(this.status != null){
			return;
		}

		if(type === 'lava' || type === 'fireball'){
			this.status = 'lost';
		}

		if(type === 'coin' && actor.type === 'coin'){
			this.removeActor(actor);
			if(this.noMoreActors('coin')){
				this.status = 'won';
			}
		}
	}
};

class LevelParser{
	constructor(dictionary){
		this.dictionary = dictionary;
	};

	actorFromSymbol(symbol){
		if(typeof symbol === 'undefined'){
			return undefined;
		}

		if(typeof this.dictionary ===  'undefined'){
			return undefined;
		}

		return this.dictionary[symbol];
	};

	obstacleFromSymbol(symbol){
		const symbols = { 'x': 'wall', '!': 'lava' };
		return symbols[symbol];
	};

	createGrid(plan){
		return plan.map(line => {
			let str = [];
 		  for(let i = 0; i < line.length; i++) {
 		    str.push(this.obstacleFromSymbol(line[i]));
 		  }
 		  return str;
 		})
	};

	createActors(plan) {
	let thisPlan = this;
	return plan.reduce(function(prev, rowY, y) {
		[...rowY].forEach(function(rowX, x) {
			if (rowX) {
				let constructor = thisPlan.actorFromSymbol(rowX); 
				if (constructor && typeof constructor === 'function') {
					let actor = new constructor (new Vector(x, y));
					if (actor instanceof Actor) {
						prev.push(actor);
					}
				}
			}
		});
		return prev;
	}, []);
}

parse(plan) {
	return new Level(this.createGrid(plan), this.createActors(plan));
}
};

class Fireball extends Actor{
	constructor(pos  = new Vector(0,0),speed = new Vector(0,0)){
		super(pos, new Vector(1,1), speed);
	};

	get type(){
		return 'fireball';
	};

	getNextPosition(time = 1){
		return this.pos.plus(this.speed.times(time));
	};

	handleObstacle(){
		this.speed = this.speed.times(-1);
	};

	act(time, level){
		var newPos = this.getNextPosition(time);
		if(level.obstacleAt(newPos, this.size)){
			this.handleObstacle();
		}else{
			this.pos = newPos;
		}
	}
};

class HorizontalFireball extends Fireball{
	constructor(pos = new Vector(0,0)){
		super(pos,new Vector(2,0));
	}
};

class VerticalFireball extends Fireball{
	constructor(pos = new Vector(0,0)){
		super(pos, new Vector(0,2));
	}
};

class FireRain extends Fireball{
	constructor(pos = new Vector(0,0)){
	super(pos, new Vector(0,3));
		this.initPos = pos;
	};

	get type(){
		return 'firerain';
	}

	handleObstacle(){
		this.pos = this.initPos;
	}
};

class Coin extends Actor{
	constructor(pos=new Vector(1,1)){
		super(new Vector(pos.x + 0.2, pos.y + 0.1), new Vector(0.6,0.6));
		this.initPos = this.pos;
		this.springSpeed = 8;
		this.springDist = 0.07;
		this.spring = Math.random() * 2*Math.PI
	};

	get type(){
		return 'coin';
	};

	updateSpring(time = 1){
			this.spring += this.springSpeed*time;
		};

	getSpringVector(){
		return new Vector(0,Math.sin(this.spring)*this.springDist);
	};

	getNextPosition(time = 1){
		this.updateSpring(time);
		const springVector = this.getSpringVector();
	return this.initPos.plus(springVector);
	};

	act(time){
		this.pos = this.getNextPosition(time);
	}
};

class Player extends Actor{
	constructor(pos=new Vector(1,1)){
		super(new Vector(pos.x, pos.y - 0.5), new Vector(0.8,1.5));
	}

	get type(){
		return 'player';
	}
}

const schemas = [
  [
    '         ',
    '   h     ',
    '         ',
    '       o ',
    '@     xxx',
    '         ',
    'xxx      ',
    '         '
  ],
  [
    '   v     ',
    '         ',
    '         ',
    '@       o',
    '        x',
    '    x    ',
    'x        ',
    '         '
  ],
   [
    '            ',
    '      v     ',
    '           o',
    '@       o  x',
    '    o   x   ',
    '    x       ',
    'x           ',
    '            '
  ],
   [
    ' v           ',
    '             ',
    '             ',
    '@   h    o   ',
    '        xx   ',
    '    xx       ',
    'xx         o ',
    '           xx'
  ]
];

const actorDict = {
  '@': Player,
  'v': VerticalFireball,
  'o': Coin,
  'h': HorizontalFireball,
  'f': FireRain
}

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Красава! Дай пять!'));
