/**
 * An Obserable Object that will notify registered listeners when its properties' changed
 *
 * @require: nodejs v6.0 or greater
 * @author: Quang Le
 * @since: November 14, 2016
 **/
'use strict'

var ObserableObject = function (data) {
  data = data || {}
  if (typeof data !== 'object') {
    throw new Error('given data is not an object')
  }

  // create a proxy to watch for changes in data object
  let proxy = new Proxy(data, {
    /** this is called when the properties of proxy is changed */
    set: function (obj, prop, value, receiver) {
      switch (prop) {
        case 'listener':
          if (Array.isArray(value) && (typeof value[0] === 'string')) {
            this.__listeners = this.__listeners || []
            const prop = value[0]
            if (prop[0] === '-') {
              if (prop[1]) {
                // remove listener
                for (let i = 0; i < this.__listeners.length; i++) {
                  let f = this.__listeners[i]
                  // if function is not provided, than delete all listeners on this property
                  if ((f.prop === prop[1]) && (!(value[1]) || (value[1] === f.func))) {
                    this.__listeners.splice(i, 1)
                  } else {
                    i++
                  }
                }
                return true
              }
            } else if (typeof value[1] === 'function') {
              this.__listeners.push({ prop: prop, func: value[1], caller: value[2] })
              return true
            }
          }
          return false

        default:
          // when an object is assigned, turn it into a ObserableObject to monitor its changes
          // console.log('SET:', obj, prop, value)
          if (typeof value === 'object') {
            // if value for a property is an object, than turns it to ObserableObject
            obj[prop] = new ObserableObject(value)
            // transfer the listener to the new object
            this.findListeners(prop).forEach(f => {
              obj[prop].listener = ['*', f.func, f.caller]
            })
          } else {
            obj[prop] = value
          }
          if (!Array.isArray(obj) || (prop !== 'length')) {
            // no need to notify when length of array is changed
            this.notify(prop, value)
          }
          break
      }
      return true
    },

    // find registered listeners by Property
    findListeners: function (prop) {
      if (this.__listeners && Array.isArray(this.__listeners)) {
        return this.__listeners.filter(f => f.prop === prop)
      }
      return []
    },

    // Notify changes to registered listeners
    notify: function (prop, value) {
      // notify change to observers
      this.findListeners('*').forEach(f => {
        f.func.call(f.caller, value, prop)
      })
      this.findListeners(prop).forEach(f => {
        f.func.call(f.caller, value, null)
      })
    },

    deleteProperty: function (target, prop) {
      if (target instanceof Array) {
        target.splice(prop, 1)
      } else if (prop in target) {
      }
      this.notify(prop)
      return true
    }

  })

  for (let p in data) {
    if (typeof data[p] === 'object') {
      proxy[p] = data[p]
    }
  }

  return proxy
}

module.exports = ObserableObject
