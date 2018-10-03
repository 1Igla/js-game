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

const start = new Vector(30, 50);
console.log(start)
const moveTo = new Vector(5, 10 );
const finish = start.plus(moveTo).times(2)
console.log(finish)


console.log(`Исходное расположение: ${start.x}:${start.y}`);
console.log(`Текущее расположение: ${finish.x}:${finish.y}`)


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
        type: {
          get: function() {
            return 'actor';
          }
        }
      });
    }
  }

  act() {}

  isIntersect(item) {
    if (this == item) return false;
    if (item === undefined || !(item instanceof Actor)) {
    	throw new Error('В метод isIntersect не передан движущийся объект типа Actor.');
    } else {
      if (this.left == item.left && this.right == item.right && this.top == item.top && this.bottom == item.bottom) {
        return true;
      } else {
        for (let i = this.top + 1; i < this.bottom - 1; i++) {
          if (i >= item.top && i <= item.bottom) {
            for (let j = this.left + 1; j < this.right - 1; j++) {
              if (j >= item.left && j <= item.right) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
}

const items = new Map();
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
items.forEach(status);
