'use strict';

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(obj) {
    if(!(obj instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + obj.x, this.y + obj.y);
  }
  times(multiplier = 1) {
    return new Vector(this.x * multiplier, this.y * multiplier);
  }
}

/*const start = new Vector(30, 50);
console.log(start)
const moveTo = new Vector(5, 10 );
const finish = start.plus(moveTo).times(2)
console.log(finish)

console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`)*/


class Actor {
  constructor (pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {
    if(!(pos instanceof Vector) || !(size instanceof Vector) || !(speed instanceof Vector) ) {
      throw new Error('Аргументы должны быть только типа Vector');
    } else {
        this.pos = pos;
        this.size = size;
        this.speed = speed;
        Object.defineProperties(this, {
          left: {
            get: function() {
              return this.pos.x;
          }
        },
          top: {
            get: function() {
              return this.pos.y;
          }
        },
        right: {
          get: function() {
            return this.pos.x + this.size.x;
          }
        },
        bottom: {
          get: function() {
            return this.pos.y + this.size.y;
          }
        },
        typ: {
          get: function() {
            return 'actor';
          }
        }
      });
    }
  }
  
  isIntersect(typeActor) {
    if (typeActor === undefined || !(typeActor instanceof Actor)) {
    	throw 'В метод isIntersect не передан движущийся объект типа Actor.';
    } else if (typeActor === this) {
      return false;
    } else if (typeActor.right <= this.left) {
      return false;
    } else if (typeActor.left >= this.right) {
      return false;
    } else if (typeActor.bottom <= this.top) {
      return false;
    } else if (typeActor.top >=this.bottom) {
      return false;
    }
    return true;
  }
};

/*const items = new Map();
const player = new Actor();
items.set('Игрок', player);
items.set('Первая монета', new Actor(new Vector(10, 10)));
items.set('Вторая монета', new Actor(new Vector(15, 5)));

function position(item) {
  return ['left', 'top', 'right', 'bottom']
    .map(side => `${side}: ${item[side]}`)
    .join(', ');  
}

function movePlayer(x, y) {
  player.pos = player.pos.plus(new Vector(x, y));
}

function status(item, title) {
  console.log(`${title}: ${position(item)}`);
  if (player.isIntersect(item)) {
    console.log(`Игрок подобрал ${title}`);
  }
}
items.forEach(status);
movePlayer(10, 10);
items.forEach(status);
movePlayer(5, -5);
items.forEach(status);*/


class Level {
  constructor(grid, actors) {
    this.grid = grid;
    this.actors = actors;
    if (actors !== undefined) {
      this.player = actors.filter(actor => actor.type === 'player')[0];
    };
    if (grid === undefined) {
      this.height = 0;
      this.width = 0;
    } else {
      this.height = this.grid.length;
      let max = 0;
      grid.forEach(function(line){
        if (line.length > max) {
          max = line.length;
        }
      });
      this.width = max;
    }
    this.status = null;
    this.finishDelay = 1;
  };

  isFinished() {
    if ((this.status !== 'null') && (this.finishDelay < 0)) {
      return true;
    } else {
      return false;
    }
  };

  actorAt(pl) {
    if (pl === undefined || !(pl instanceof Actor)) {
      throw new Error('В метод isIntersect не передан движущийся объект типа Actor.');
    }
    
    let intersectingElements = this.actors.filter(element => pl.isIntersect(element)); 

    if (intersectingElements.length > 0) {
      return intersectingElements[0];
    } 
  };

  obstacleAt(pos, size) {
    if ((!(pos instanceof Vector) || !(size instanceof Vector))) {
      throw new Error('В метод obstacleAt передан не объект типа Vector.');
    } 
    let actor = new Actor (pos, size);
    if (actor.bottom > this.height){
      return 'lava';
    } else if ((actor.top < 0) || (actor.left < 0) || (actor.right > this.width)) {
      return 'wall';
    } 
    let left = Math.floor(actor.left);
    let right = Math.ceil(actor.right);
    let top = Math.floor(actor.top);
    let bottom = Math.ceil(actor.bottom);
    
    for (let j = top; j < bottom; j++) {
      for (let i = left; i < right; i++) {
        if (this.grid[j][i] === 'lava') {
          return 'lava';
        }  
        if (this.grid[j][i] === 'wall') {
          return 'wall';
        }
      }
    }
    return undefined;
  };

  removeActor(ac) {
    let i = this.actors.indexOf(ac);
      if (i < 0) {
      return;
    }
    this.actors.splice(i, 1);
  };

  noMoreActors(typ) {
    if (((this.actors === undefined) || (this.actors.length === 0))) {
      return true;
    } let results = this.actors.filter(element => element.type === typ);
    if (results.length === 0) {
      return true;
    } 
    else {
      return false;
    }
  };

  playerTouched(obstacle, actor) {
    if ((obstacle === 'lava') || (obstacle === 'fireball')) {
      return this.status = 'lost';
    } else if (obstacle === 'coin') {
      this.removeActor(actor);
    };
    if (this.noMoreActors('coin') === true) {
      return this.status = 'won';
    }
  }
};


/*const grid = [
  [undefined, undefined],
  ['wall', 'wall']
];

function MyCoin(title) {
  this.type = 'coin';
  this.title = title;
}
MyCoin.prototype = Object.create(Actor);
MyCoin.constructor = MyCoin;

const goldCoin = new MyCoin('Золото');
const bronzeCoin = new MyCoin('Бронза');
const player = new Actor();
const fireball = new Actor();

const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);

level.playerTouched('coin', goldCoin);
level.playerTouched('coin', bronzeCoin);

if (level.noMoreActors('coin')) {
  console.log('Все монеты собраны');
  console.log(`Статус игры: ${level.status}`);
}

const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
if (obstacle) {
  console.log(`На пути препятствие: ${obstacle}`);
}

const otherActor = level.actorAt(player);
if (otherActor === fireball) {
  console.log('Пользователь столкнулся с шаровой молнией');
}*/

class LevelParser {
  constructor(obj) {
    this.obj = obj;
  };
 actorFromSymbol(str) { // check
   if (str === obj) {
     return constructor(obj);
   } else if (str !== obj) {
     return undefined;
   }
 };
    obstacleFromSymbol(symb) {
    this.symb = symb;
    if (obj === 'x') {
      return 'wall';
    } else if (obj === '!') {
      return 'lava';
    } else if (obj !== symb) {
      return undefined;
    }
  };
  createGrid(arrSrtings) {
    
  }
}