'use strict';

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

		if(this === actor){
			return false;
		}

		if((this.pos.x === actor.pos.x + actor.size.x)||(this.pos.y === actor.pos.y + actor.size.y)
      ||(actor.pos.x === this.pos.x + actor.size.x)||(actor.pos.y === this.pos.y + actor.size.y)) {
			return false;
		  }
		 else if(((this.pos.x <= actor.pos.x + actor.size.x) && (this.pos.x >= actor.pos.x) && (this.pos.y <= actor.pos.y + actor.size.y) && (this.pos.y >= actor.pos.y)) ||
		 ((this.pos.x <= actor.pos.x + actor.size.x) && (this.pos.x >= actor.pos.x) && (this.pos.y + this.size.y <= actor.pos.y + actor.size.y) && (this.pos.y + this.size.y >= actor.pos.y)) ||
		 ((this.pos.x + this.size.x <= actor.pos.x + actor.size.x) && (this.pos.x + this.size.x >= actor.pos.x) && (this.pos.y <= actor.pos.y + actor.size.y) && (this.pos.y >= actor.pos.y)) ||
		 ((this.pos.x + this.size.x <= actor.pos.x + actor.size.x) && (this.pos.x + this.size.x >= actor.pos.x) && (this.pos.y + this.size.y <= actor.pos.y + actor.size.y) &&
       (this.pos.y + this.size.y >= actor.pos.y)) ||
		 ((actor.pos.x <= this.pos.x + this.size.x) && (actor.pos.x >= this.pos.x) && (actor.pos.y <= this.pos.y + this.size.y) && (actor.pos.y >= this.pos.y)) ||
		 ((actor.pos.x <= this.pos.x + this.size.x) && (actor.pos.x >= this.pos.x) && (actor.pos.y + actor.size.y <= this.pos.y + this.size.y) && (actor.pos.y + actor.size.y >= this.pos.y)) ||
		 ((actor.pos.x + actor.size.x <= this.pos.x + this.size.x) && (actor.pos.x + actor.size.x >= this.pos.x) && (actor.pos.y <= this.pos.y + this.size.y) && (actor.pos.y >= this.pos.y)) ||
		 ((actor.pos.x + actor.size.x <= this.pos.x + this.size.x) && (actor.pos.x + actor.size.x >= this.pos.x) && (actor.pos.y + actor.size.y <= this.pos.y + this.size.y) &&
       (actor.pos.y + actor.size.y >= this.pos.y))) {
       return true;
        }
	}
};

class Level{
	constructor(grid=[], actors=[]){ //сетку игрового поля с препятствиями и список движущихся объектов
		this.grid = grid; //сетку игрового поля
		this.actors = actors; // список движущихся объектов
    for(const actor of actors) {
      if(actor.type === 'player') {
        this.player = actor;
        break;
      }
    }
		this.height = grid.length; //высоту игрового поля, равное числу строк в сетке из первого аргумента.
		this.width = 0; // ширину игрового поля, равное числу ячеек в строке сетки из первого аргумента
    this.status = null;
    this.finishDelay = 1;

		if(grid.length !== 0){
			for(const arr of this.grid){
				if(typeof arr != 'undefined'){
					if(this.width < arr.length){
						this.width = arr.length;
					}
				}
			}
		}
	};

	isFinished(){
		if(this.status != null && this.finishDelay < 0) {
      return true;
    }
	};

	actorAt(actor){
		if(!(actor instanceof Actor)){
			throw new Error('Движущийся объект должен иметь тип Actor');
		}

		if(this.grid === undefined ){
			return undefined;
		}

		for(let i of this.actors){
			if (typeof i !='undefined' && actor.isIntersect(i)){
				return i;
			}
		}
		return undefined;
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
				if (typeof l!== 'undefined') {
					return l;
				}
			}
		}
		return undefined;
	}

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

	createGrid(strings){
		var arr = [];
		var i = 0;
		for(var string of strings){
			arr[i] = [];
			for(let j = 0; j < string.length; j++){
				const symb = string.charAt(j);
				if(symb === 'x' || symb === 'o' || symb === '!'){
					arr[i].push(this.obstacleFromSymbol(symb));
				}else{
					arr[i].push(undefined);
				}
			}
			i++;
		}
		return arr;
	};

	createActors(strings){
		const array = [];
		let j = 0;
		for(let i = 0; i < strings.length; i++ ){
			const str = strings[i];
			for(let n = 0; n < str.length; n++){
				const symbol = str.charAt(n);
				const act = this.actorFromSymbol(symbol);
				if(typeof act === 'function'){
					const actor = new act();
					if(actor instanceof Actor){
						array[j] = new act();
						array[j].pos = new Vector(n,i);
						j++;
					}
				}
			}
		}
		return array;
	};

	parse(Arrstrings){
	return new Level(this.createGrid(Arrstrings), this.createActors(Arrstrings));
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
	constructor(pos) {
		 let speed = new Vector(0, 3);
		 super(pos, speed);
		 this.startPos = pos;
	 }

	 handleObstacle() {
		 this.pos = this.startPos;
	 }
};

class Coin extends Actor{
	constructor(pos=new Vector(1,1)){
		super(new Vector(pos.x + 0.2, pos.y + 0.1), new Vector(0.6,0.6));
		this.initPos = pos;
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
		return new Vector(this.pos.x,this.pos.y + springVector.y*time);
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
  .then(() => console.log('Вы выиграли приз!'));
