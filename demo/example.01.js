const ObserableObject = require('../index.js')

var a = new ObserableObject({a: 1, b: 2, c: [3]})

function cChangeNotifier (value, prop) {
  if (typeof value === 'undefined') {
    if (prop === null) {
      console.log('c got deleted')
    } else {
      console.log('c[%s] got deleted', prop)
    }
  } else {
    if (prop === null) {
      console.log('new value of c=', value)
    } else {
      console.log('new value at c[%s]= %s', prop, value)
    }
  }
}

// This only listen when whole c property changed
a.listener = ['c', cChangeNotifier]
// This will listen to any internal changes of c
a.c.listener = ['*', cChangeNotifier]

// any update to c property will be notified
a.c.push(4)

a.c = [1, 2, 3, 4]
a.c.push(3)

// remove global listener on propety c
a.c.listener = ['-*']
// listener on c.* has been removed, you can't hear this below change
a.c.shift(5)
// a.c.splice(2, 1)

// but you will be notified by this
a.c = { hi: 'I am something else' }
delete a.c



