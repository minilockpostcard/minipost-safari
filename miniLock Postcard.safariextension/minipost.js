/* Zepto v1.1.4 - zepto event ajax form ie - zeptojs.com/license */

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    dom.__proto__ = $.fn
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className,
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    var num
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = []
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode
      return $(node)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (!this.length || this[0].nodeType !== 1 ? undefined :
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
        ) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && setAttribute(this, name) })
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        }) :
        (this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
        )
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0], computedStyle = getComputedStyle(element, '')
        if(!element) return
        if (typeof property == 'string')
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {
          var props = {}
          $.each(isArray(property) ? property: [property], function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // items in the collection might not be DOM elements
      if('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return callback ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  ;['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback)
      else this.each(function(){
        try { this[name]() }
        catch(e) {}
      })
      return this
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred()
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
      RegExp.$2 != window.location.host

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var result = [], el
    $([].slice.call(this.get(0).elements)).each(function(){
      el = $(this)
      var type = el.attr('type')
      if (this.nodeName.toLowerCase() != 'fieldset' &&
        !this.disabled && type != 'submit' && type != 'reset' && type != 'button' &&
        ((type != 'radio' && type != 'checkbox') || this.checked))
        result.push({
          name: el.attr('name'),
          value: el.val()
        })
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (callback) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)
;

//     Underscore.js 1.7.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.7.0';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  _.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
      for (i = 0; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = _.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
      if (!length) throw new TypeError(reduceError);
      memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== + obj.length && _.keys(obj),
        index = (keys || obj).length,
        currentKey;
    if (arguments.length < 3) {
      if (!index) throw new TypeError(reduceError);
      memo = obj[keys ? keys[--index] : --index];
    }
    while (index--) {
      currentKey = keys ? keys[index] : index;
      memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    predicate = _.iteratee(predicate, context);
    _.some(obj, function(value, index, list) {
      if (predicate(value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = _.iteratee(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(_.iteratee(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    if (obj == null) return true;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
      currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = _.values(obj);
    return _.indexOf(obj, target) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = obj.length === +obj.length ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = obj && obj.length === +obj.length ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = _.iteratee(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = _.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return obj.length === +obj.length ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = _.iteratee(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = _.iteratee(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (isSorted) {
        if (!i || seen !== value) result.push(value);
        seen = value;
      } else if (iteratee) {
        var computed = iteratee(value, i, array);
        if (_.indexOf(seen, computed) < 0) {
          seen.push(computed);
          result.push(value);
        }
      } else if (_.indexOf(result, value) < 0) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var idx = array.length;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var Ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      Ctor.prototype = func.prototype;
      var self = new Ctor;
      Ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (_.isObject(result)) return result;
      return self;
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = hasher ? hasher.apply(this, arguments) : key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed before being called N times.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      } else {
        func = null;
      }
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iteratee, context) {
    var result = {}, key;
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      iteratee = createCallback(iteratee, context);
      for (key in obj) {
        var value = obj[key];
        if (iteratee(value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      obj = new Object(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (
      aCtor !== bCtor &&
      // Handle Object.create(x) cases
      'constructor' in a && 'constructor' in b &&
      !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
        _.isFunction(bCtor) && bCtor instanceof bCtor)
    ) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size, result;
    // Recursively compare objects and arrays.
    if (className === '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size === b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      size = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      result = _.keys(b).length === size;
      if (result) {
        while (size--) {
          // Deep compare each member
          key = keys[size];
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around an IE 11 bug.
  if (typeof /./ !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs), length = pairs.length;
    return function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0];
        if (pair[1] !== obj[key] || !(key in obj)) return false;
      }
      return true;
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = createCallback(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? object[property]() : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));
;

//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('underscore');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));
;

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Alice, Bobby, MinipostRouter, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (location.hostname === "minipostlink.github.io" && location.protocol !== "https:") {
  return window.location = location.toString().replace("http:", "https:");
}

Function.delay = function(amount, f) {
  return setTimeout(f, amount);
};

window.minipost = {
  hostname: location.hostname === "minipost.dev" ? "minipost.link" : location.hostname,
  HTMLsuffix: (_ref = location.hostname) === "minipost.link" || _ref === "auto.minipost.link" || _ref === "minipostlink.github.io" ? "" : ".html"
};

$(document).ready(function() {
  var available, container, id, monospaceWidth, name, tests, typefaceIsAvailable, typefaces, _i, _len, _ref1;
  typefaces = {
    avenir: "AvenirNext-DemiBold",
    corbel: "Corbel",
    optima: "Optima"
  };
  available = [];
  tests = ["<a id=\"monospace\" style=\"font: 100px/1 monospace; display:inline-block;\">ii</a>"];
  for (id in typefaces) {
    name = typefaces[id];
    tests.push("<a id=\"" + id + "\" style=\"font: 100px/1 '" + name + "', monospace; display:inline-block;\">ii</a>");
  }
  container = document.createElement("div");
  container.innerHTML = tests.join("");
  document.body.appendChild(container);
  monospaceWidth = $("#monospace").width();
  _ref1 = Object.keys(typefaces);
  for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
    id = _ref1[_i];
    typefaceIsAvailable = $("#" + id).width() !== monospaceWidth;
    if (typefaceIsAvailable) {
      available.push(id);
    }
  }
  container.remove();
  return document.body.classList.add(available[0]);
});

$(document).ready(function() {
  minipost.router = new MinipostRouter;
  return Backbone.history.start({
    pushState: true
  });
});

MinipostRouter = (function(_super) {
  var IndexPageView, UnlockPostcardView, WritePostcardView;

  __extends(MinipostRouter, _super);

  function MinipostRouter() {
    this.online = __bind(this.online, this);
    this.offline = __bind(this.offline, this);
    return MinipostRouter.__super__.constructor.apply(this, arguments);
  }

  IndexPageView = require("./views/index_page_view.coffee");

  WritePostcardView = require("./views/write_postcard.coffee");

  UnlockPostcardView = require("./views/unlock_postcard.coffee");

  MinipostRouter.prototype.initialize = function() {
    $(window).on({
      offline: this.offline,
      online: this.online
    });
    return this.renderNetworkStatus();
  };

  MinipostRouter.prototype.routes = {
    "": "showIndex",
    "index": "showIndex",
    "write": "writePostcard",
    "unlock": "unlockPostcard",
    "index.html": "showIndex",
    "write.html": "writePostcard",
    "unlock.html": "unlockPostcard",
    ":bundle/index.html": "showIndex",
    ":bundle/write.html": "writePostcard",
    ":bundle/unlock.html": "unlockPostcard"
  };

  MinipostRouter.prototype.showIndex = function() {
    var _ref1;
    console.info("showIndex");
    if ((_ref1 = this.currentView) != null) {
      _ref1.remove();
    }
    return this.currentView = new IndexPageView(this.params());
  };

  MinipostRouter.prototype.writePostcard = function() {
    var _ref1;
    console.info("writePostcard");
    if ((_ref1 = this.currentView) != null) {
      _ref1.remove();
    }
    return this.currentView = new WritePostcardView(this.params());
  };

  MinipostRouter.prototype.unlockPostcard = function() {
    var _ref1;
    console.info("unlockPostcard");
    if ((_ref1 = this.currentView) != null) {
      _ref1.remove();
    }
    return this.currentView = new UnlockPostcardView(this.params());
  };

  MinipostRouter.prototype.params = function() {
    var name, pair, params, value, _i, _len, _ref1, _ref2;
    params = {};
    if (location.search) {
      _ref1 = location.search.replace("?", "").split("&");
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        pair = _ref1[_i];
        _ref2 = pair.split("="), name = _ref2[0], value = _ref2[1];
        params[name] = decodeURIComponent(value);
      }
    }
    return params;
  };

  MinipostRouter.prototype.offline = function() {
    return this.renderNetworkStatus();
  };

  MinipostRouter.prototype.online = function() {
    return this.renderNetworkStatus();
  };

  MinipostRouter.prototype.renderNetworkStatus = function() {
    document.body.classList[navigator.onLine ? "add" : "remove"]("online");
    return document.body.classList[navigator.onLine ? "remove" : "add"]("offline");
  };

  return MinipostRouter;

})(Backbone.Router);

$(document).ready(function() {
  document.body.classList.add("ready");
  if (navigator.userAgent.match(/Paparazzi!/)) {
    if (window.innerWidth === 1200) {
      document.body.style.padding = "0px";
    }
    if (window.innerWidth === 3000) {
      return document.body.style.padding = "180px 0 0";
    }
  }
});

$(document).on("click", "a[href]", function(event) {
  var destination, hrefAttribute;
  if (event.metaKey === true) {
    return;
  }
  hrefAttribute = event.currentTarget.getAttribute("href");
  destination = new URL(event.currentTarget.href);
  if (destination.hostname === location.hostname) {
    if (hrefAttribute[0] === "/") {
      Backbone.history.navigate(hrefAttribute, {
        trigger: true
      });
      return event.preventDefault();
    }
  }
});

$(document).on("mousedown", "a.copy_n_paste, em.copy_n_paste", function(event) {
  var range, selection;
  event.preventDefault();
  range = document.createRange();
  range.selectNodeContents(event.currentTarget);
  selection = window.getSelection();
  selection.removeAllRanges();
  return selection.addRange(range);
});

$(document).on("input", "textarea, input", function(event) {
  if (event.currentTarget.value.trim() === "") {
    event.currentTarget.classList.add("undefined");
    return event.currentTarget.classList.remove("valuable");
  } else {
    event.currentTarget.classList.remove("undefined");
    return event.currentTarget.classList.add("valuable");
  }
});

$(document).on("input", "div.input", function(event) {
  if (event.target.value.trim() === "") {
    event.currentTarget.classList.add("undefined");
    return event.currentTarget.classList.remove("valuable");
  } else {
    event.currentTarget.classList.remove("undefined");
    return event.currentTarget.classList.add("valuable");
  }
});

Alice = minipost.Alice = {};

Alice.secretPhrase = "lions and tigers and all the fear in my heart";

Alice.emailAddress = "alice@example.org";

Alice.miniLockID = "zDRLdbPFEb95Q7xzTuiHr24qUSpearDoB5c9DS1To93cZ";

Bobby = minipost.Bobby = {};

Bobby.secretPhrase = "No I also got a quesadilla, it’s from the value menu";

Bobby.emailAddress = "bobby@example.org";

Bobby.miniLockID = "PYN1P1uhHXTNT5MUccZYv1mhvPBFQX2cS7g9n3wcof8JU";



},{"./views/index_page_view.coffee":8,"./views/unlock_postcard.coffee":12,"./views/write_postcard.coffee":13}],2:[function(require,module,exports){
var Identity,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Identity = (function(_super) {
  __extends(Identity, _super);

  function Identity() {
    return Identity.__super__.constructor.apply(this, arguments);
  }

  module.exports = Identity;

  Identity.prototype.keys = function() {
    return this.get("keys");
  };

  Identity.prototype.publicKey = function() {
    if (this.has("keys")) {
      return this.get("keys").publicKey;
    }
    if (this.has("miniLockID")) {
      return miniLockLib.ID.decode(this.get("miniLockID"));
    }
  };

  Identity.prototype.secretKey = function() {
    var _ref;
    return (_ref = this.get("keys")) != null ? _ref.secretKey : void 0;
  };

  Identity.prototype.miniLockID = function() {
    if (this.has("keys")) {
      return miniLockLib.ID.encode(this.publicKey());
    }
  };

  Identity.prototype.makeKeyPair = function() {
    this.trigger("keypair:start");
    return Function.delay(1, (function(_this) {
      return function() {
        return miniLockLib.makeKeyPair(_this.get('secret_phrase'), _this.get('email_address'), function(error, keys) {
          if (keys) {
            _this.set("keys", keys);
            return Function.delay(1, function() {
              return _this.trigger("keypair:ready");
            });
          } else {
            console.error(error);
            return Function.delay(1, function() {
              return _this.trigger("keypair:error", error);
            });
          }
        });
      };
    })(this));
  };

  return Identity;

})(Backbone.Model);



},{}],3:[function(require,module,exports){
var Postcard,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Postcard = (function(_super) {
  var Identity;

  __extends(Postcard, _super);

  function Postcard() {
    return Postcard.__super__.constructor.apply(this, arguments);
  }

  module.exports = Postcard;

  Identity = require("../models/identity.coffee");

  Postcard.prototype.initialize = function(options) {
    this.postie = new Identity;
    return this.author = new Identity;
  };

  Postcard.prototype.minHue = 40;

  Postcard.prototype.maxHue = 320;

  Postcard.prototype.url = function(options) {
    if (options == null) {
      options = {};
    }
    return "/unlock" + minipost.HTMLsuffix + "?Base58=" + (this.get("Base58"));
  };

  Postcard.prototype.validate = function(attributes) {
    var error;
    if (attributes.Base58 != null) {
      if (attributes.Base58.trim() === "") {
        return "Unacceptable Base58 input";
      }
      if (attributes.Base58.length < 256) {
        return "Unacceptable Base58 input";
      }
      try {
        miniLockLib.Base58.decode(attributes.Base58);
      } catch (_error) {
        error = _error;
        return "Unacceptable Base58 input";
      }
    }
    return void 0;
  };

  Postcard.prototype.isUndefined = function() {
    return this.get("text") === void 0 && this.get("Base58") === void 0;
  };

  Postcard.prototype.isUnlocked = function() {
    return this.has("text") && this.has("hue") && this.has("senderID") && this.has("recipientID");
  };

  Postcard.prototype.isLocked = function() {
    var _ref, _ref1, _ref2;
    return (((this.get("text") === (_ref2 = this.get("hue")) && _ref2 === (_ref1 = this.get("senderID"))) && _ref1 === (_ref = this.get("recipientID"))) && _ref === void 0);
  };

  Postcard.prototype.lock = function() {
    this.unset("text");
    this.unset("hue");
    this.unset("mailto");
    this.unset("mailfrom");
    this.unset("senderID");
    return this.unset("recipientID");
  };

  Postcard.prototype.serialize = function() {
    return JSON.stringify({
      text: this.get("text"),
      hue: this.get("hue"),
      mailto: this.get("mailto"),
      mailfrom: this.get("mailfrom")
    });
  };

  Postcard.prototype.parse = function(serialized) {
    return JSON.parse(serialized);
  };

  Postcard.prototype.blockOfBase58Text = function() {
    var block, char, lineLength, _i, _len, _ref;
    lineLength = 0;
    block = "";
    if (this.has("Base58")) {
      _ref = this.get("Base58");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        char = _ref[_i];
        if (lineLength < 80) {
          block += char;
        } else {
          lineLength = 0;
          block += "\n";
          block += char;
        }
        lineLength = lineLength + 1;
      }
    }
    return block;
  };

  Postcard.prototype.isAcceptable = function() {
    switch (false) {
      case this.get("text") !== void 0:
        return false;
      case this.get("text").trim() !== "":
        return false;
      case miniLockLib.ID.isAcceptable(this.get("miniLockID")) !== false:
        return false;
      default:
        return true;
    }
  };

  Postcard.prototype.encryptedBlob = function() {
    return this.get("file") || new Blob([miniLockLib.Base58.decode(this.get("Base58"))], {
      type: "application/octet-stream"
    });
  };

  Postcard.prototype.unencryptedBlob = function() {
    return new Blob([this.serialize()], {
      type: "text/plain"
    });
  };

  Postcard.prototype.unlock = function(keys) {
    var operation;
    operation = new miniLockLib.DecryptOperation({
      data: this.encryptedBlob(),
      keys: keys
    });
    return operation.start((function(_this) {
      return function(error, decrypted) {
        var reader;
        if (decrypted) {
          console.info("decrypted", decrypted, decrypted.duration);
          reader = new FileReader;
          reader.readAsArrayBuffer(decrypted.data);
          reader.onerror = function(event) {
            return _this.trigger("decrypt:error", "reader.onerror", event);
          };
          reader.onabort = function(event) {
            return _this.trigger("decrypt:error", "reader.onabort", event);
          };
          return reader.onload = function() {
            _this.set(_this.parse(miniLockLib.NaCl.util.encodeUTF8(new Uint8Array(reader.result))));
            _this.set("senderID", decrypted.senderID);
            _this.set("recipientID", decrypted.recipientID);
            return _this.trigger("decrypt:complete");
          };
        } else {
          console.error(error, operation);
          return Function.delay(1, function() {
            return _this.trigger("decrypt:error", error);
          });
        }
      };
    })(this));
  };

  Postcard.prototype.unlockFile = function(keys) {
    var operation;
    operation = new miniLockLib.DecryptOperation({
      data: this.get("file"),
      keys: keys
    });
    return operation.start((function(_this) {
      return function(error, decrypted) {
        var reader;
        if (decrypted) {
          console.info("decrypted", decrypted, decrypted.duration);
          reader = new FileReader;
          reader.readAsArrayBuffer(decrypted.data);
          reader.onerror = function(event) {
            return _this.trigger("encrypt:reader:error", event);
          };
          reader.onabort = function(event) {
            return _this.trigger("encrypt:reader:abort", event);
          };
          return reader.onload = function(event) {
            var decryptedBytes;
            decryptedBytes = new Uint8Array(reader.result);
            _this.set(_this.parse(miniLockLib.NaCl.util.encodeUTF8(decryptedBytes)));
            return _this.trigger("decrypt:complete");
          };
        } else {
          console.error(error, operation);
          return Function.delay(1, function() {
            return _this.trigger("decrypt:error", error);
          });
        }
      };
    })(this));
  };

  Postcard.prototype.encrypt = function(keys) {
    var operation;
    operation = new miniLockLib.EncryptOperation({
      data: this.unencryptedBlob(),
      name: "Postcard for " + (this.postie.get("email_address")) + " in hue #" + (this.get('hue')),
      keys: keys,
      miniLockIDs: [this.postie.get("miniLockID")]
    });
    return operation.start((function(_this) {
      return function(error, encrypted) {
        var reader;
        if (encrypted) {
          console.info("encrypted", encrypted, encrypted.duration);
          reader = new FileReader;
          reader.readAsArrayBuffer(encrypted.data);
          reader.onerror = function(event) {
            return _this.trigger("encrypt:reader:error", event);
          };
          reader.onabort = function(event) {
            return _this.trigger("encrypt:reader:abort", event);
          };
          return reader.onload = function(event) {
            var encryptedBytes;
            encryptedBytes = new Uint8Array(reader.result);
            _this.set("Base58", miniLockLib.Base58.encode(encryptedBytes));
            return Function.delay(1, function() {
              return _this.trigger("encrypt:complete");
            });
          };
        } else {
          console.error(error, operation);
          return Function.delay(1, function() {
            return _this.trigger("encrypt:error", error);
          });
        }
      };
    })(this));
  };

  return Postcard;

})(Backbone.Model);



},{"../models/identity.coffee":2}],4:[function(require,module,exports){
var Shortcut,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Shortcut = (function(_super) {
  __extends(Shortcut, _super);

  function Shortcut() {
    return Shortcut.__super__.constructor.apply(this, arguments);
  }

  module.exports = Shortcut;

  Shortcut.prototype.initialize = function() {
    var number;
    return this.set("identifier", ((function() {
      var _i, _len, _ref, _results;
      _ref = miniLockLib.NaCl.randomBytes(4);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        number = _ref[_i];
        _results.push(number.toString());
      }
      return _results;
    })()).join(""));
  };

  Shortcut.prototype.url = function(options) {
    if (options == null) {
      options = {};
    }
    return "/unlock" + minipost.HTMLsuffix + "?Base58=" + (this.get("Base58"));
  };

  return Shortcut;

})(Backbone.Model);



},{}],5:[function(require,module,exports){
exports.fileExtension = location.hostname === "minipost.dev" ? ".html" : "";

exports.stamps = require("./HTML.stamps.coffee");

exports.stamp = function(name, attributes) {
  if (attributes == null) {
    attributes = {};
  }
  attributes["class"] = "stamp";
  return this.stamps[name].replace("<svg", "<svg " + (this.attributes(attributes)));
};

exports.attributes = function(attributes) {
  var name, value;
  return ((function() {
    var _results;
    _results = [];
    for (name in attributes) {
      value = attributes[name];
      _results.push(name + "=" + '"' + value + '"');
    }
    return _results;
  })()).join(" ");
};

exports.a = function(text, attributes) {
  if (attributes == null) {
    attributes = {};
  }
  if (attributes.href) {
    if (attributes.href[0] === "/") {
      attributes.href = attributes.href.indexOf("?") !== -1 ? attributes.href.replace("?", "" + this.fileExtension + "?") : attributes.href + this.fileExtension;
    }
    attributes.href = encodeURI(attributes.href);
  }
  if (attributes.tabindex == null) {
    attributes.tabindex = -1;
  }
  return "<a " + (this.attributes(attributes)) + ">" + text + "</a>";
};

exports.input = function(attributes) {
  attributes["class"] = attributes.value != null ? "valuable" : "undefined";
  if (attributes.value == null) {
    attributes.value = "";
  }
  return "<input " + (this.attributes(attributes)) + ">";
};

exports.textarea = function(attributes) {
  var value;
  attributes["class"] = attributes.value != null ? "valuable" : "undefined";
  value = attributes.value || "";
  delete attributes.value;
  return "<textarea " + (this.attributes(attributes)) + ">" + value + "</textarea>";
};

exports.miniLockIconHTML = "<svg viewBox=\"0 0 525 702\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n  <g fill-rule=\"evenodd\">\n    <path fill=\"black\" d=\"M347.8125,478.934579 C369.558712,478.934579 387.1875,461.310499 387.1875,439.570093 C387.1875,417.829688 369.558712,400.205607 347.8125,400.205607 C326.066288,400.205607 308.4375,417.829688 308.4375,439.570093 C308.4375,461.310499 326.066288,478.934579 347.8125,478.934579 Z M177.1875,478.934579 C198.933712,478.934579 216.5625,461.310499 216.5625,439.570093 C216.5625,417.829688 198.933712,400.205607 177.1875,400.205607 C155.441288,400.205607 137.8125,417.829688 137.8125,439.570093 C137.8125,461.310499 155.441288,478.934579 177.1875,478.934579 Z M177.1875,255.869159 L177.1875,223.065421 L177.228748,223.065421 C177.201304,221.975295 177.1875,220.881783 177.1875,219.785047 C177.1875,149.12873 234.481061,91.8504673 305.15625,91.8504673 C375.831439,91.8504673 433.125,149.12873 433.125,219.785047 C433.125,220.881783 433.111196,221.975295 433.083752,223.065421 L433.125,223.065421 L433.125,255.869159 L523.525694,255.869159 L525,255.869159 L525,219.785047 C525,98.4011172 426.5726,0 305.15625,0 C183.7399,0 85.3125,98.4011172 85.3125,219.785047 L85.3125,255.869159 L86.7868059,255.869159 L177.1875,255.869159 L177.1875,255.869159 Z M131.25,616.71028 C105.879419,616.71028 85.3125,596.148853 85.3125,570.785047 L85.3125,347.719626 L439.6875,347.719626 L439.6875,570.785047 C439.6875,596.148853 419.120581,616.71028 393.75,616.71028 L131.25,616.71028 L131.25,616.71028 Z M131.25,702 C58.7626266,702 0,643.253064 0,570.785047 L0,255.869159 L525,255.869159 L525,570.785047 C525,643.253064 466.237373,702 393.75,702 L131.25,702 L131.25,702 Z\"></path>\n  </g>\n</svg>";

exports.renderByteStream = function(typedArray) {
  var byte, bytes;
  if (typedArray) {
    bytes = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = typedArray.length; _i < _len; _i++) {
        byte = typedArray[_i];
        _results.push('<b class="byte" style="background-color: hsla(0, 0%, 0%, ' + byte / 255 + ');"></b>');
      }
      return _results;
    })();
    return '<div class="byte_stream">' + bytes.join("") + '</div>';
  } else {
    return "&nbsp;";
  }
};



},{"./HTML.stamps.coffee":6}],6:[function(require,module,exports){
module.exports["black-with-eyes"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>black-with-eyes</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"black-with-eyes\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"#FFFFFF\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"backface\" fill=\"#000000\"></path>\n            <path d=\"M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z\" class=\"frontface\" fill=\"#000000\"></path>\n            <ellipse class=\"eye\" fill=\"#FFFFFF\" cx=\"48.125\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <ellipse class=\"eye\" fill=\"#FFFFFF\" cx=\"31.875\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <path d=\"M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"handle\" fill=\"#000000\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["confused"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>confused</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"confused\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <path d=\"M58.486,36.6885 C58.486,38.4265087 58.2753354,39.9538267 57.854,41.2705 C57.4326646,42.5871733 56.8401705,43.7984945 56.0765,44.9045 C55.3128295,46.0105055 54.3911721,47.0506618 53.3115,48.025 C52.2318279,48.9993382 51.0073402,50.0131614 49.638,51.0665 C48.7953291,51.7511701 48.0975028,52.3568307 47.5445,52.8835 C46.9914972,53.4101693 46.5570016,53.9499972 46.241,54.503 C45.9249984,55.0560028 45.7011673,55.6353303 45.5695,56.241 C45.4378327,56.8466697 45.372,57.5708291 45.372,58.4135 L45.372,60.4675 L33.048,60.4675 L33.048,57.4655 C33.048,56.0961598 33.1796653,54.8716721 33.443,53.792 C33.7063347,52.7123279 34.1013307,51.7248378 34.628,50.8295 C35.1546693,49.9341622 35.7998295,49.0651709 36.5635,48.2225 C37.3271705,47.3798291 38.2356614,46.5108378 39.289,45.6155 L41.896,43.1665 C42.7913378,42.3764961 43.5549968,41.5470043 44.187,40.678 C44.8190032,39.8089957 45.135,38.7688394 45.135,37.5575 C45.135,35.8721582 44.6215051,34.5291717 43.5945,33.5285 C42.5674949,32.5278283 41.1586756,32.0275 39.368,32.0275 C37.1559889,32.0275 35.4970055,32.7779925 34.391,34.279 C33.2849945,35.7800075 32.6793339,37.4784905 32.574,39.3745 L20.013,38.0315 C20.3290016,35.1874858 21.053161,32.6858441 22.1855,30.5265 C23.317839,28.3671559 24.7793244,26.5765071 26.57,25.1545 C28.3606756,23.7324929 30.388322,22.6660036 32.653,21.955 C34.917678,21.2439964 37.3139874,20.8885 39.842,20.8885 C42.2120119,20.8885 44.5161555,21.1913303 46.7545,21.797 C48.9928445,22.4026697 50.9809913,23.3506602 52.719,24.641 C54.4570087,25.9313398 55.8526614,27.5771567 56.906,29.5785 C57.9593386,31.5798433 58.486,33.9498196 58.486,36.6885 L58.486,36.6885 Z M46.952,71.6065 C46.952,73.7131772 46.214674,75.4906594 44.74,76.939 C43.265326,78.3873406 41.4483441,79.1115 39.289,79.1115 C38.2356614,79.1115 37.2481713,78.9271685 36.3265,78.5585 C35.4048287,78.1898315 34.5885036,77.6631701 33.8775,76.9785 C33.1664964,76.2938299 32.6003354,75.5038378 32.179,74.6085 C31.7576646,73.7131622 31.547,72.7388386 31.547,71.6855 C31.547,70.6848283 31.744498,69.7236713 32.1395,68.802 C32.534502,67.8803287 33.0874964,67.0771701 33.7985,66.3925 C34.5095036,65.7078299 35.3389953,65.168002 36.287,64.773 C37.2350047,64.377998 38.2356614,64.1805 39.289,64.1805 C40.3423386,64.1805 41.3298287,64.377998 42.2515,64.773 C43.1731713,65.168002 43.9894964,65.6946634 44.7005,66.353 C45.4115036,67.0113366 45.964498,67.8013287 46.3595,68.723 C46.754502,69.6446713 46.952,70.6058283 46.952,71.6065 L46.952,71.6065 Z\" class=\"?\" fill-opacity=\"0.254472373\" fill=\"#000000\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["locked-backup"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>locked-backup</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"locked-backup\" fill=\"#FFFFFF\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 L80,23.5 Z M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 Z M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 Z\" class=\"Paper\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["locked"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>locked</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"locked\" fill-opacity=\"0.100000001\" fill=\"#000000\">\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"Path\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["miniLock"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>miniLock</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"miniLock\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"#89AFDD\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M48.125,62.7102804 C50.1960678,62.7102804 51.875,61.02821 51.875,58.953271 C51.875,56.8783321 50.1960678,55.1962617 48.125,55.1962617 C46.0539322,55.1962617 44.375,56.8783321 44.375,58.953271 C44.375,61.02821 46.0539322,62.7102804 48.125,62.7102804 Z M31.875,62.7102804 C33.9460678,62.7102804 35.625,61.02821 35.625,58.953271 C35.625,56.8783321 33.9460678,55.1962617 31.875,55.1962617 C29.8039322,55.1962617 28.125,56.8783321 28.125,58.953271 C28.125,61.02821 29.8039322,62.7102804 31.875,62.7102804 Z M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"miniLock-Icon\" fill=\"#FFFFFF\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["pink-on-grey"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>pink-on-grey</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"pink-on-grey\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"#D9D9D9\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"backface\" fill=\"#A83996\"></path>\n            <path d=\"M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z\" class=\"frontface\" fill=\"#D9D9D9\"></path>\n            <ellipse class=\"eye\" fill=\"#A83996\" cx=\"48.125\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <ellipse class=\"eye\" fill=\"#A83996\" cx=\"31.875\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <path d=\"M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"handle\" fill=\"#A83996\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["playmobil"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>playmobil</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"playmobil\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"#57ABFF\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"backface\" fill=\"#FFFF57\"></path>\n            <path d=\"M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z\" class=\"frontface\" fill=\"#FF57E3\"></path>\n            <ellipse class=\"eye\" fill=\"#57FFC7\" cx=\"48.125\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <ellipse class=\"eye\" fill=\"#57FFC7\" cx=\"31.875\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <path d=\"M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"handle\" fill=\"#8F57FF\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["purple"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>purple</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"purple\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"#8F57FF\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"backface\" fill=\"#FFFFFF\"></path>\n            <path d=\"M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z\" class=\"frontface\" fill=\"#8F57FF\"></path>\n            <ellipse class=\"eye\" fill=\"#FFFFFF\" cx=\"48.125\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <ellipse class=\"eye\" fill=\"#FFFFFF\" cx=\"31.875\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <path d=\"M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"handle\" fill=\"#FFFFFF\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["rainbow-blue"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>rainbow-blue</title>\n    <defs>\n        <radialGradient cx=\"50%\" cy=\"50%\" fx=\"50%\" fy=\"50%\" r=\"100%\" id=\"rainbow-blue-radialGradient-1\">\n            <stop stop-color=\"#F2F9FF\" offset=\"0%\"></stop>\n            <stop stop-color=\"#ABD5FF\" offset=\"100%\"></stop>\n        </radialGradient>\n    </defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"rainbow-blue\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"url(#rainbow-blue-radialGradient-1)\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"backface\" fill=\"#8F57FF\"></path>\n            <path d=\"M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z\" class=\"frontface\" fill=\"#F3F9FF\"></path>\n            <ellipse class=\"eye\" fill=\"#57ABFF\" cx=\"48.125\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <ellipse class=\"eye\" fill=\"#57ABFF\" cx=\"31.875\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <path d=\"M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"handle\" fill=\"#57ABFF\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["rainbow-pink"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>rainbow-pink</title>\n    <defs>\n        <radialGradient cx=\"50%\" cy=\"50%\" fx=\"50%\" fy=\"50%\" r=\"100%\" id=\"rainbow-pink-radialGradient-1\">\n            <stop stop-color=\"#F2F9FF\" offset=\"0%\"></stop>\n            <stop stop-color=\"#ABD5FF\" offset=\"100%\"></stop>\n        </radialGradient>\n    </defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"rainbow-pink\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"url(#rainbow-pink-radialGradient-1)\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"backface\" fill=\"#8F57FF\"></path>\n            <path d=\"M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z\" class=\"frontface\" fill=\"#FFFFFF\"></path>\n            <ellipse class=\"eye\" fill=\"#57ABFF\" cx=\"48.125\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <ellipse class=\"eye\" fill=\"#57ABFF\" cx=\"31.875\" cy=\"58.953271\" rx=\"3.75\" ry=\"3.75700935\"></ellipse>\n            <path d=\"M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z\" class=\"handle\" fill=\"#FF57E3\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["transparent"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>transparent</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"transparent\"></g>\n    </g>\n</svg>";

module.exports["undefined"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>undefined</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"undefined\" fill=\"#FFFFFF\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\"></path>\n        </g>\n    </g>\n</svg>";

module.exports["unlocked"] = "<svg width=\"80px\" height=\"100px\" viewBox=\"0 0 80 100\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:sketch=\"http://www.bohemiancoding.com/sketch/ns\">\n    <!-- Generator: Sketch 3.1 (8751) - http://www.bohemiancoding.com/sketch -->\n    <title>unlocked</title>\n    <defs></defs>\n    <g class=\"Page-1\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\">\n        <g class=\"unlocked\">\n            <path d=\"M80,23.5 L80,21.5 C79.1715729,21.5 78.5,20.8284271 78.5,20 C78.5,19.1715729 79.1715729,18.5 80,18.5 L80,16.5 C79.1715729,16.5 78.5,15.8284271 78.5,15 C78.5,14.1715729 79.1715729,13.5 80,13.5 L80,11.5 C79.1715729,11.5 78.5,10.8284271 78.5,10 C78.5,9.17157288 79.1715729,8.5 80,8.5 L80,8.5 L80,6.5 C79.1715729,6.5 78.5,5.82842712 78.5,5 C78.5,4.17157288 79.1715729,3.5 80,3.5 L80,1.5 C79.1715729,1.5 78.5,0.828427125 78.5,0 L76.5,0 C76.5,0.828427125 75.8284271,1.5 75,1.5 C74.1715729,1.5 73.5,0.828427125 73.5,0 L71.5,0 C71.5,0.828427125 70.8284271,1.5 70,1.5 C69.1715729,1.5 68.5,0.828427125 68.5,0 L66.5,0 C66.5,0.828427125 65.8284271,1.5 65,1.5 C64.1715729,1.5 63.5,0.828427125 63.5,0 L61.5,0 C61.5,0.828427125 60.8284271,1.5 60,1.5 C59.1715729,1.5 58.5,0.828427125 58.5,0 L56.5,0 C56.5,0.828427125 55.8284271,1.5 55,1.5 C54.1715729,1.5 53.5,0.828427125 53.5,0 L51.5,0 C51.5,0.828427125 50.8284271,1.5 50,1.5 C49.1715729,1.5 48.5,0.828427125 48.5,0 L46.5,0 C46.5,0.828427125 45.8284271,1.5 45,1.5 C44.1715729,1.5 43.5,0.828427125 43.5,0 L43.5,0 L41.5,0 C41.5,0.828427125 40.8284271,1.5 40,1.5 C39.1715729,1.5 38.5,0.828427125 38.5,0 L36.5,0 C36.5,0.828427125 35.8284271,1.5 35,1.5 C34.1715729,1.5 33.5,0.828427125 33.5,0 L31.5,0 C31.5,0.828427125 30.8284271,1.5 30,1.5 C29.1715729,1.5 28.5,0.828427125 28.5,0 L26.5,0 C26.5,0.828427125 25.8284271,1.5 25,1.5 C24.1715729,1.5 23.5,0.828427125 23.5,0 L23.5,0 L21.5,0 C21.5,0.828427125 20.8284271,1.5 20,1.5 C19.1715729,1.5 18.5,0.828427125 18.5,0 L18.5,0 L16.5,0 C16.5,0.828427125 15.8284271,1.5 15,1.5 C14.1715729,1.5 13.5,0.828427125 13.5,0 L11.5,0 C11.5,0.828427125 10.8284271,1.5 10,1.5 C9.17157288,1.5 8.5,0.828427125 8.5,0 L6.5,0 L6.5,0 C6.5,0.828427125 5.82842712,1.5 5,1.5 C4.17157288,1.5 3.5,0.828427125 3.5,0 L1.5,0 L1.5,0 C1.5,0.828427125 0.828427125,1.5 0,1.5 L0,3.5 L2.22044605e-16,3.5 C0.828427125,3.5 1.5,4.17157288 1.5,5 C1.5,5.82842712 0.828427125,6.5 0,6.5 L0,8.5 L2.22044605e-16,8.5 C0.828427125,8.5 1.5,9.17157288 1.5,10 C1.5,10.8284271 0.828427125,11.5 0,11.5 L0,13.5 L2.22044605e-16,13.5 C0.828427125,13.5 1.5,14.1715729 1.5,15 C1.5,15.8284271 0.828427125,16.5 0,16.5 L0,18.5 L2.22044605e-16,18.5 C0.828427125,18.5 1.5,19.1715729 1.5,20 C1.5,20.8284271 0.828427125,21.5 0,21.5 L0,23.5 L2.22044605e-16,23.5 C0.828427125,23.5 1.5,24.1715729 1.5,25 C1.5,25.8284271 0.828427125,26.5 0,26.5 L0,28.5 L2.22044605e-16,28.5 C0.828427125,28.5 1.5,29.1715729 1.5,30 C1.5,30.8284271 0.828427125,31.5 0,31.5 L0,33.5 L2.22044605e-16,33.5 C0.828427125,33.5 1.5,34.1715729 1.5,35 C1.5,35.8284271 0.828427125,36.5 0,36.5 L0,38.5 L2.22044605e-16,38.5 C0.828427125,38.5 1.5,39.1715729 1.5,40 C1.5,40.8284271 0.828427125,41.5 0,41.5 L0,43.5 L2.22044605e-16,43.5 C0.828427125,43.5 1.5,44.1715729 1.5,45 C1.5,45.8284271 0.828427125,46.5 0,46.5 L0,48.5 L2.22044605e-16,48.5 C0.828427125,48.5 1.5,49.1715729 1.5,50 C1.5,50.8284271 0.828427125,51.5 0,51.5 L0,53.5 L2.22044605e-16,53.5 C0.828427125,53.5 1.5,54.1715729 1.5,55 C1.5,55.8284271 0.828427125,56.5 0,56.5 L0,58.5 L2.22044605e-16,58.5 C0.828427125,58.5 1.5,59.1715729 1.5,60 C1.5,60.8284271 0.828427125,61.5 0,61.5 L0,63.5 L2.22044605e-16,63.5 C0.828427125,63.5 1.5,64.1715729 1.5,65 C1.5,65.8284271 0.828427125,66.5 0,66.5 L0,68.5 L2.22044605e-16,68.5 C0.828427125,68.5 1.5,69.1715729 1.5,70 C1.5,70.8284271 0.828427125,71.5 0,71.5 L0,73.5 L2.22044605e-16,73.5 C0.828427125,73.5 1.5,74.1715729 1.5,75 C1.5,75.8284271 0.828427125,76.5 0,76.5 L0,78.5 L2.22044605e-16,78.5 C0.828427125,78.5 1.5,79.1715729 1.5,80 C1.5,80.8284271 0.828427125,81.5 0,81.5 L0,83.5 L2.22044605e-16,83.5 C0.828427125,83.5 1.5,84.1715729 1.5,85 C1.5,85.8284271 0.828427125,86.5 0,86.5 L0,88.5 L2.22044605e-16,88.5 C0.828427125,88.5 1.5,89.1715729 1.5,90 C1.5,90.8284271 0.828427125,91.5 0,91.5 L0,93.5 L2.22044605e-16,93.5 C0.828427125,93.5 1.5,94.1715729 1.5,95 C1.5,95.8284271 0.828427125,96.5 0,96.5 L0,98.5 C0.828427125,98.5 1.5,99.1715729 1.5,100 L1.5,100 L3.5,100 C3.5,99.1715729 4.17157288,98.5 5,98.5 C5.82842712,98.5 6.5,99.1715729 6.5,100 L6.5,100 L8.5,100 L8.5,100 C8.5,99.1715729 9.17157288,98.5 10,98.5 C10.8284271,98.5 11.5,99.1715729 11.5,100 L13.5,100 C13.5,99.1715729 14.1715729,98.5 15,98.5 C15.8284271,98.5 16.5,99.1715729 16.5,100 L16.5,100 L18.5,100 L18.5,100 C18.5,99.1715729 19.1715729,98.5 20,98.5 C20.8284271,98.5 21.5,99.1715729 21.5,100 L23.5,100 L23.5,100 C23.5,99.1715729 24.1715729,98.5 25,98.5 C25.8284271,98.5 26.5,99.1715729 26.5,100 L28.5,100 L28.5,100 C28.5,99.1715729 29.1715729,98.5 30,98.5 C30.8284271,98.5 31.5,99.1715729 31.5,100 L33.5,100 L33.5,100 C33.5,99.1715729 34.1715729,98.5 35,98.5 C35.8284271,98.5 36.5,99.1715729 36.5,100 L38.5,100 C38.5,99.1715729 39.1715729,98.5 40,98.5 C40.8284271,98.5 41.5,99.1715729 41.5,100 L43.5,100 C43.5,99.1715729 44.1715729,98.5 45,98.5 C45.8284271,98.5 46.5,99.1715729 46.5,100 L48.5,100 C48.5,99.1715729 49.1715729,98.5 50,98.5 C50.8284271,98.5 51.5,99.1715729 51.5,100 L51.5,100 L53.5,100 C53.5,99.1715729 54.1715729,98.5 55,98.5 C55.8284271,98.5 56.5,99.1715729 56.5,100 L58.5,100 C58.5,99.1715729 59.1715729,98.5 60,98.5 C60.8284271,98.5 61.5,99.1715729 61.5,100 L61.5,100 L63.5,100 C63.5,99.1715729 64.1715729,98.5 65,98.5 C65.8284271,98.5 66.5,99.1715729 66.5,100 L68.5,100 L68.5,100 C68.5,99.1715729 69.1715729,98.5 70,98.5 C70.8284271,98.5 71.5,99.1715729 71.5,100 L73.5,100 C73.5,99.1715729 74.1715729,98.5 75,98.5 C75.8284271,98.5 76.5,99.1715729 76.5,100 L78.5,100 C78.5,99.1715729 79.1715729,98.5 80,98.5 L80,96.5 C79.1715729,96.5 78.5,95.8284271 78.5,95 C78.5,94.1715729 79.1715729,93.5 80,93.5 L80,93.5 L80,91.5 C79.1715729,91.5 78.5,90.8284271 78.5,90 C78.5,89.1715729 79.1715729,88.5 80,88.5 L80,88.5 L80,86.5 C79.1715729,86.5 78.5,85.8284271 78.5,85 C78.5,84.1715729 79.1715729,83.5 80,83.5 L80,83.5 L80,81.5 C79.1715729,81.5 78.5,80.8284271 78.5,80 C78.5,79.1715729 79.1715729,78.5 80,78.5 L80,78.5 L80,76.5 C79.1715729,76.5 78.5,75.8284271 78.5,75 C78.5,74.1715729 79.1715729,73.5 80,73.5 L80,73.5 L80,71.5 C79.1715729,71.5 78.5,70.8284271 78.5,70 C78.5,69.1715729 79.1715729,68.5 80,68.5 L80,68.5 L80,66.5 C79.1715729,66.5 78.5,65.8284271 78.5,65 C78.5,64.1715729 79.1715729,63.5 80,63.5 L80,63.5 L80,61.5 C79.1715729,61.5 78.5,60.8284271 78.5,60 C78.5,59.1715729 79.1715729,58.5 80,58.5 L80,58.5 L80,56.5 C79.1715729,56.5 78.5,55.8284271 78.5,55 C78.5,54.1715729 79.1715729,53.5 80,53.5 L80,53.5 L80,51.5 C79.1715729,51.5 78.5,50.8284271 78.5,50 C78.5,49.1715729 79.1715729,48.5 80,48.5 L80,48.5 L80,46.5 C79.1715729,46.5 78.5,45.8284271 78.5,45 C78.5,44.1715729 79.1715729,43.5 80,43.5 L80,41.5 C79.1715729,41.5 78.5,40.8284271 78.5,40 C78.5,39.1715729 79.1715729,38.5 80,38.5 L80,38.5 L80,36.5 C79.1715729,36.5 78.5,35.8284271 78.5,35 C78.5,34.1715729 79.1715729,33.5 80,33.5 L80,31.5 C79.1715729,31.5 78.5,30.8284271 78.5,30 C78.5,29.1715729 79.1715729,28.5 80,28.5 L80,26.5 C79.1715729,26.5 78.5,25.8284271 78.5,25 C78.5,24.1715729 79.1715729,23.5 80,23.5 Z\" class=\"Paper\" fill=\"#FFFFFF\"></path>\n            <rect class=\"Ink\" fill=\"#89AFDD\" x=\"5\" y=\"5\" width=\"70\" height=\"90\"></rect>\n            <path d=\"M48.125,62.7102804 C50.1960678,62.7102804 51.875,61.02821 51.875,58.953271 C51.875,56.8783321 50.1960678,55.1962617 48.125,55.1962617 C46.0539322,55.1962617 44.375,56.8783321 44.375,58.953271 C44.375,61.02821 46.0539322,62.7102804 48.125,62.7102804 Z M31.875,62.7102804 C33.9460678,62.7102804 35.625,61.02821 35.625,58.953271 C35.625,56.8783321 33.9460678,55.1962617 31.875,55.1962617 C29.8039322,55.1962617 28.125,56.8783321 28.125,58.953271 C28.125,61.02821 29.8039322,62.7102804 31.875,62.7102804 Z M31.875,41.4205607 L31.875,38.2897196 L31.8789284,38.2897196 C31.8763147,38.1856763 31.875,38.0813097 31.875,37.9766355 C31.875,31.2330839 37.3315296,25.7663551 44.0625,25.7663551 C50.7934704,25.7663551 56.25,31.2330839 56.25,37.9766355 C56.25,38.0813097 56.2486853,38.1856763 56.2460716,38.2897196 L56.25,38.2897196 L56.25,41.4205607 L64.8595899,41.4205607 L65,41.4205607 L65,37.9766355 C65,26.3915596 55.6259619,17 44.0625,17 C32.4990381,17 23.125,26.3915596 23.125,37.9766355 L23.125,41.4205607 L23.2654101,41.4205607 L31.875,41.4205607 L31.875,41.4205607 Z M27.5,75.8598131 C25.0837542,75.8598131 23.125,73.8973976 23.125,71.4766355 L23.125,50.1869159 L56.875,50.1869159 L56.875,71.4766355 C56.875,73.8973976 54.9162458,75.8598131 52.5,75.8598131 L27.5,75.8598131 L27.5,75.8598131 Z M27.5,84 C20.5964406,84 15,78.3930987 15,71.4766355 L15,41.4205607 L65,41.4205607 L65,71.4766355 C65,78.3930987 59.4035594,84 52.5,84 L27.5,84 L27.5,84 Z\" class=\"miniLock-Icon\" fill=\"#FFFFFF\"></path>\n        </g>\n    </g>\n</svg>";



},{}],7:[function(require,module,exports){
var IdentityView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IdentityView = (function(_super) {
  var HTML, Identity;

  __extends(IdentityView, _super);

  function IdentityView() {
    this.render = __bind(this.render, this);
    return IdentityView.__super__.constructor.apply(this, arguments);
  }

  module.exports = IdentityView;

  HTML = require("./HTML.coffee");

  Identity = require("../models/identity.coffee");

  IdentityView.prototype.initialize = function(options) {
    this.identity = options.model || new Identity;
    this.listenTo(this.identity, "keypair:ready", this.render);
    this.listenTo(this.identity, "keypair:error", this.render);
    return this.render();
  };

  IdentityView.prototype.render = function() {
    var _ref, _ref1;
    this.el.classList[this.identity.has("keys") ? "remove" : "add"]("undefined");
    return this.el.innerHTML = "<div class=\"miniLockID\">\n  <h2>" + HTML.miniLockIconHTML + " ID</h2>\n  " + (HTML.input({
      type: "text",
      name: "miniLockID",
      value: this.identity.miniLockID(),
      tabindex: "-1",
      readonly: "yes"
    })) + "\n</div>\n<div class=\"public key\">\n  <h2>Public Key</h2>\n  <div>" + (HTML.renderByteStream((_ref = this.identity.publicKey()) != null ? _ref : new Uint8Array(32))) + "</div>\n</div>\n<div class=\"secret key\">\n  <h2>Secret Key</h2>\n  <div>" + (HTML.renderByteStream((_ref1 = this.identity.secretKey()) != null ? _ref1 : new Uint8Array(32))) + "</div>\n</div>";
  };

  return IdentityView;

})(Backbone.View);



},{"../models/identity.coffee":2,"./HTML.coffee":5}],8:[function(require,module,exports){
var IndexPageView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

IndexPageView = (function(_super) {
  var HTML;

  __extends(IndexPageView, _super);

  function IndexPageView() {
    this.online = __bind(this.online, this);
    this.offline = __bind(this.offline, this);
    return IndexPageView.__super__.constructor.apply(this, arguments);
  }

  module.exports = IndexPageView;

  HTML = require("./HTML.coffee");

  IndexPageView.prototype.attributes = {
    id: "index_page_view"
  };

  IndexPageView.prototype.initialize = function() {
    $(window).on({
      online: this.online,
      offline: this.offline
    });
    this.render();
    document.querySelector("body").appendChild(this.el);
    return this.el.focus();
  };

  IndexPageView.prototype.events = {
    "mousedown .example img": "mousedownOnExampleImage"
  };

  IndexPageView.prototype.mousedownOnExampleImage = function(event) {
    var url;
    url = event.target.parentNode.querySelector("a[href]").getAttribute("href");
    return Backbone.history.navigate(url, {
      trigger: true
    });
  };

  IndexPageView.prototype.remove = function() {
    $(window).off({
      online: this.online,
      offline: this.offline
    });
    return Backbone.View.prototype.remove.call(this);
  };

  IndexPageView.prototype.offline = function() {
    return this.render();
  };

  IndexPageView.prototype.online = function() {
    return this.render();
  };

  IndexPageView.prototype.render = function() {
    document.querySelector("title").innerText = "miniLock Postcard Home";
    document.querySelector("body > h1").innerText = "Home";
    document.querySelector("body").style.backgroundColor = "";
    return this.el.innerHTML = "<header>\n  " + (HTML.stamp("rainbow-pink")) + "<b>miniLock</b> <b>Postcard</b>\n</header>\n<p>\n  This is " + minipost.hostname + "<br>\n  <br>\n  Everything we need to make and unlock postcards has loaded.<br>\n  <br>\n  " + (navigator.onLine ? "You can disconnect your network and continue your session offline if your soul has paranormal desires." : 'And now we are offline where the air is fresh and the noise is pink.') + "\n  <br>\n  <br>\n  " + (HTML.a("Make a postcard for your postie", {
      href: "/write"
    })) + "<br>\n  <br>\n  " + (HTML.a("Unlock a postcard code or file", {
      href: "/unlock"
    })) + "<br>\n</p>\n<br>\n<br>\n<div class=\"examples\">\n  <h2>Examples</h2>\n  <div class=\"example\">\n    " + (HTML.a("Make a postcard for Alice", {
      href: "/write?mailto=alice@example.org&amp;hue=60&amp;miniLockID=zDRLdbPFEb95Q7xzTuiHr24qUSpearDoB5c9DS1To93cZ"
    })) + "\n    <p>It’s only an example.<br>&amp; she probably won’t respond.</p>\n    <img alt=\"Writing a postcard for Alice.\" src=\"examples/Write a postcard to Alice.png\">\n  </div>\n  <div class=\"example\">\n    " + (HTML.a("Unlock a postcard addressed to Bobby", {
      href: "/unlock?address=bobby@example.org&amp;Base58=5diub1ZH8Tx8Yh1vq4yzMoAqSaeSKy9aBULxLSWBSjYKER5QMWgDTFn2QmFkWXqsPhZmzuGcxuzcQ9K42V3teB29azmRrhPqvTteKb4qnsZYy4D9BwJuhu8xP5ihTjgL2mCxSM3DaGbGccNE9csgEkJSL7vsgKFQteNb7C2Wcz2dGyvJSgBP5dD99sfjSfPVntKvTJvjLxoQo3PwPujLUPEhYgBQqaZ9oXAFpUrEjMjbMUvPtVPrpj17rHs15yhi7EDH4oVE7QqesqjpfLYtdcD8Ts6ajrj3hvGo25NMS9kTAqd97yGuqB9a6MVEnirRioZvpUkqghnvHLTpYVE7r2Gr5w5Dq5FWvwnztC77Tn3DMKwue6hXMHiJBRxYgzXs7Q6UrE9tTo6ap2kXmuZQD46E7HhNZ3rZJxuvmz3cbMof5UREDQgLsPnBxEsEcn4EUoJ6yxTTFjJbk5Kg7Wh5uMiq8ewddu9GLXzpmqBLoAAvjRMEQMsCX1uW3DkuoH8m8GFhtP1gprWje8pSKPaRCJoKqzP7RbRpc6HS2CZzbxTBcA3oM9dyCqCkyAMmPXhP4S9Cy3m5Ked6XDdqcCvpxuArCtVZM3x3W7a2X5ipnVNWoM5gQzaWL272BdzUziMfo8LYZ1iDQ2X3MmrJ9qdF5czCC35ccFRTkgY97aaMaXPJA3n2iXuqCiFtJxLrpo3ta6qsymkeSC6VPFP24Usjo2uiTgfbXufLoqoebt6YNAD7uhKJ66gXMSajgR6F1a7Q2oqdbS98XF2DGJxzP5PoQka6cuAtug599bm59jomAD5k8C8Z8MYX1PhMdu1NB3CKUvLTxGanAJCrQhruEYrE2BGKszSP5VKsDSFh2QjKeMpDPoDMBFVjgygAV3fVWsWRRDzCppE6TnES6LypMneWDphXKJmgTQTk7q8bL3yE9QC4WKrwbVZBKSgzSpmis1gYB4vS4Y9EDYbcrqKqZjLa4n9vZ1CL9c11jdWkMSJ2eSaTpc69u5V4LyhCqd5hhGpB3TxKg3HMFDNxyRjx9wn84f7Mepo99iGAAE5mzhsm8t6b7UFf7bMKKMSM7pnVErgbHy26WFNebB7hToBo88cvbWvDeWUeZMGinbg6NPfY1H2trhmBQ99Z9XeZkT64yWcivhWfUuZVTJqz5p1YyJro6zn5QmZMPHZwWBK3j1HScNs24E4Ew2DHZqfGT5TZpEia4QYw4mdk1LkA4mp4LgpGyme9uWjYpA2zxpXfXEim5XfGwou5cP9FKkLDx8CkHWzt7RGhuLeVv1Z34pStJ6iADn4BG4ZPFfjVgkfr9KCQeMXGNXSkpMQSYDSc5CnWEauyQekqmU6G9psGnypj3ugrHYC7qLK95DaPqKaeWxazuLZdfu6JjJUdSDWtx4FKQ4mRp4FofnfJGU87NMJVybfTR1f3qQ2MKNw2ADdceCWddJruPKkeTkYc8NipdeE9jX3xMLxck2XRfptpjEarPbjueQhiB4F69vg6oKGkV7JYQruYQrYmThBoR63e2X6wQ6JqisEb19j77gRopxFwPhmJ5b28gXqqBJMKTy3K9yf3hUH96uy9f6fqozZrz5K1B1wteM7BuAVGpND7b4JH7MFZPaasx3B8NJeAAYhy8tuhY5cUJHuWwGoA12RM4Pq34F3tQRxPigAmA28B56Xnx32zv9z3vmFcFbERq9Lgw5kkfqKfq6edNBddByYXLHZr8VNKBUi4Bab6tvzfE4ptBbZ4JyS6mwrHDfaEC8B3qMpaRT3vdPYcS8ZX1NKTH6NepcStMGsDqVXYVpuiAGnEJ3QiRHs8kyXtWvuy8Z3N4vcGfPeYNJ8FzmFtbj24SxWRMxp3Pa8S8CFAmbdT3o8Zki8PwYCRXAY4ZSiRz78eTSNQQevw6SFzoyCDGMvNyP1Nbq7V7MeAJzbqduUHkHzjJL5ZJUwtLvrJKvTjvedZi1RbqY2xvuvayNuzFYBuprZu6SkajrUYH31XY7brd58HHBAn4QB5zEc6tuUpPxRYK163aPwGU8GRuazhtapTNmwcZJtunBH5c9APxsVP7xgHh3z4Yf12LJVjbXfX4ZUoMfJVWCnQmhvG7JGwbtxm3xpJcHxncQhpe5UfmyxiWfyP8tHtfsZXedEUT9q8D6qRRNq2BtYygarMbSPEbJruyS4uquqZdT7yQFAKxWGQhTfY6jAYcWAUK3a9oReXNuKRSmmoRnwePZGe2hy6tBGVcmpHfg5WA88fu3RMxnzS8syKncb3wsL5k2MzDJas3sgQ9oaiFRg6vndq5Q9DhhHX52pSYE55oogf9BKo8SYeQj8MxZbm2BYYDkWX1aYE2zMCuG9YjSnox9MVFcKPrBK9Zmeq9zpKsuEy8xA6bqej2WBM5zqKcZSyU38bfizmGUrGV2ExQc4SQpuheLn4Q4K6kwNGgskgYdkufYjJKG5DUX6anKsrA3RCyZMHTpvSWbqpsnYFg3ark69zqnrGpY5xMafNhDgc6tLnwi2e1BnNzbbj3PcCjkZMwppLd5KYdznd1buqbrPmzXSkWi"
    })) + "\n    <p>His secret phrase is:<br><em class=\"copy_n_paste\">" + minipost.Bobby.secretPhrase + "</em></p>\n    <img alt=\"Unlocking Bobby’s postcard.\" src=\"examples/Unlock a postcard for Bobby.png\">\n  </div>\n  <div class=\"example\">\n    " + (HTML.a("Post a question to the author", {
      href: "/write?mailto=undefined@minipost.link&amp;hue=300&amp;miniLockID=29FnzFiUxGd6z8bveWWXZFhcaU5zNCkUgdnrz72SoAcsPc&amp;text=Hello!\n\nI have a question about miniLock Postcard.\n\n"
    })) + "\n    <p>The author of this site is <a tabindex=\"-1\" href=\"https://45678.github.io/\">undefined</a>.<br>Send them a message if you please.</p>\n    <img alt=\"Posting a question to the author.\" src=\"examples/Post a question.png\">\n  </div>\n</div>\n<br>\n<br>\n<div class=\"hosts\">\n  <h2>Hosts</h2>\n  <div class=\"easy\">\n    <a tabindex=\"-1\" href=\"https://minipost.link\">minipost.link</a><br>\n    <p>\n      <a href=\"https://www.ssllabs.com/ssltest/analyze.html?d=minipost.link\">Easy TLS connection with strong forward secure ciphers</a>.<br>\n      <a tabindex=\"-1\" href=\"" + location.protocol + "//" + location.hostname + "/certificates/minipost.link.crt\">Get X.509 Certificate</a>.\n      <a tabindex=\"-1\" href=\"https://github.com/minipostlink/minipost/tree/deploy\">Review the source code</a>.<br>\n      Hosted by <a tabindex=\"-1\" href=\"https://45678.github.io/\">undefined</a> in Singapore.<br>\n    </p>\n  </div>\n  <br>\n  <div class=\"autonomous\">\n    <a tabindex=\"-1\" href=\"https://auto.minipost.link\">auto.minipost.link</a><br>\n    <p>\n      <a href=\"https://www.ssllabs.com/ssltest/analyze.html?d=auto.minipost.link\">Autonomous TLS connection with strong forward secure ciphers</a>.<br>\n      <a tabindex=\"-1\" href=\"" + location.protocol + "//" + location.hostname + "/certificates/auto.minipost.link.crt\">Get X.509 Certificate</a>.\n      <a tabindex=\"-1\" href=\"https://github.com/minipostlink/minipost/tree/deploy\">Review the source code</a>.<br>\n      Hosted by <a tabindex=\"-1\" href=\"https://45678.github.io/\">undefined</a> in New York City.<br>\n    </p>\n  </div>\n  <br>\n  <div class=\"github\">\n    <a tabindex=\"-1\" href=\"https://minipostlink.github.io\">minipostlink.github.io</a><br>\n    <p>\n      <a href=\"https://www.ssllabs.com/ssltest/analyze.html?d=minipostlink.github.io\">Easy TLS connection with good forward secure ciphers</a><br>\n      &amp; <a tabindex=\"-1\" href=\"https://github.com/minipostlink/minipostlink.github.io/tree/master\">an authentic view of the source code</a>.<br>\n      Hosted by <a tabindex=\"-1\" href=\"https://github.com/\">Github</a> somewhere in the USA.\n    </p>\n  </div>\n</div>";
  };

  return IndexPageView;

})(Backbone.View);



},{"./HTML.coffee":5}],9:[function(require,module,exports){
var MakeKeysView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MakeKeysView = (function(_super) {
  var HTML, Identity, char;

  __extends(MakeKeysView, _super);

  function MakeKeysView() {
    this.render = __bind(this.render, this);
    this.errorMakingKeyPair = __bind(this.errorMakingKeyPair, this);
    this.keyPairIsReady = __bind(this.keyPairIsReady, this);
    return MakeKeysView.__super__.constructor.apply(this, arguments);
  }

  module.exports = MakeKeysView;

  HTML = require("./HTML.coffee");

  Identity = require("../models/identity.coffee");

  MakeKeysView.prototype.initialize = function(options) {
    this.identity = options.model || new Identity;
    this.listenTo(this.identity, "keypair:ready", this.keyPairIsReady);
    this.listenTo(this.identity, "keypair:error", this.errorMakingKeyPair);
    return this.render();
  };

  MakeKeysView.prototype.events = {
    "focus [name=secret_phrase]": "removeSecretPhraseMask",
    "blur  [name=secret_phrase]": "applySecretPhraseMask",
    "input [name=secret_phrase]": "setSecretPhrase",
    "input [name=email_address]": "setEmailAddress",
    "keypress [name=secret_phrase]": "makeKeyPairIfEnterKeyWasPressed",
    "keypress [name=email_address]": "makeKeyPairIfEnterKeyWasPressed"
  };

  MakeKeysView.prototype.removeSecretPhraseMask = function(event) {
    event.currentTarget.value = this.identity.get("secret_phrase") || "";
    return event.currentTarget.classList.remove("masked");
  };

  MakeKeysView.prototype.applySecretPhraseMask = function(event) {
    if (event.currentTarget.value !== "") {
      event.currentTarget.value = this.secretPhraseMask;
      return event.currentTarget.classList.add("masked");
    }
  };

  MakeKeysView.prototype.secretPhraseMask = ((function() {
    var _i, _results;
    _results = [];
    for (char = _i = 0; _i < 92; char = ++_i) {
      _results.push("•");
    }
    return _results;
  })()).join("");

  MakeKeysView.prototype.setSecretPhrase = function(event) {
    return this.identity.set("secret_phrase", event.currentTarget.value);
  };

  MakeKeysView.prototype.setEmailAddress = function(event) {
    return this.identity.set("email_address", event.currentTarget.value);
  };

  MakeKeysView.prototype.makeKeyPair = function() {
    console.info("makeKeyPair");
    Function.delay(1, (function(_this) {
      return function() {
        return _this.identity.makeKeyPair();
      };
    })(this));
    document.activeElement.blur();
    document.querySelector("article.postcard").classList.add("making_keys");
    return this.render();
  };

  MakeKeysView.prototype.makeKeyPairIfEnterKeyWasPressed = function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      return this.makeKeyPair();
    }
  };

  MakeKeysView.prototype.keyPairIsReady = function(event) {
    console.info("keyPairIsReady", event);
    delete this.error;
    document.querySelector("article.postcard").classList.remove("making_keys");
    document.querySelector("article.postcard").classList.add("keys_are_ready");
    return this.render();
  };

  MakeKeysView.prototype.errorMakingKeyPair = function(error) {
    console.info("errorMakingKeys", error);
    this.error = error;
    this.el.classList.remove("processing");
    document.querySelector("article.postcard").classList.remove("making_keys");
    this.render();
    if (/secret phrase/.test(error)) {
      this.el.querySelector('[name=secret_phrase]').focus();
    }
    if (/email address/.test(error)) {
      return this.el.querySelector('[name=email_address]').focus();
    }
  };

  MakeKeysView.prototype.render = function() {
    this.el.classList[this.identity.has("keys") ? "add" : "remove"]("complete");
    this.el.classList[this.identity.has("keys") ? "remove" : "add"]("incomplete");
    this.el.classList[this.error ? "add" : "remove"]("failed");
    return this.el.querySelector("div.error.message").innerHTML = this.error;
  };

  return MakeKeysView;

})(Backbone.View);



},{"../models/identity.coffee":2,"./HTML.coffee":5}],10:[function(require,module,exports){
var OutputView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

OutputView = (function(_super) {
  var HTML, Shortcut;

  __extends(OutputView, _super);

  function OutputView() {
    this.render = __bind(this.render, this);
    return OutputView.__super__.constructor.apply(this, arguments);
  }

  module.exports = OutputView;

  HTML = require("./HTML.coffee");

  Shortcut = require("../models/shortcut.coffee");

  OutputView.prototype.initialize = function(options) {
    this.postcard = options.model;
    this.shortcut = new Shortcut;
    this.listenTo(this.postcard, "change:Base58", this.render);
    this.listenTo(this.postcard, "encrypt:complete", this.render);
    this.listenTo(this.postcard, "encrypt:error", this.render);
    $(window).on("online", this.render);
    $(window).on("offline", this.render);
    this.renderHTML();
    return this.render();
  };

  OutputView.prototype.events = {
    "click .rw": "mousedownOnReadWriteInput",
    "input .rw": "readWriteInput",
    "focusout .rw": "readWriteInputLostFocus",
    "click .mail button": "sendPostcardByMail",
    "click .file button": "savePostcardFile",
    "click .shortcut button": "postPostcardShortcut"
  };

  OutputView.prototype.sendPostcardByMail = function(event) {
    var linkToOpenMailMessage, undefinedInput;
    if (this.mailOutputIsAvailable()) {
      if (undefinedInput = this.el.querySelector(".mail.output [name=email_address].undefined")) {
        event.preventDefault();
        return undefinedInput.focus();
      } else {
        event.target.classList.add("activated");
        event.target.blur();
        linkToOpenMailMessage = this.el.querySelector(".mail.output a");
        linkToOpenMailMessage.href = this.postcardMailtoURL();
        linkToOpenMailMessage.click();
        return Function.delay(333, function() {
          return event.target.classList.remove("activated");
        });
      }
    } else {
      return event.preventDefault();
    }
  };

  OutputView.prototype.savePostcardFile = function(event) {
    var basename, reader;
    if (this.fileOutputIsAvailable()) {
      event.target.classList.add("activated");
      event.target.blur();
      basename = this.el.querySelector(".file.output [name=basename]").value;
      reader = new FileReader;
      reader.readAsDataURL(this.postcard.encryptedBlob());
      return reader.onloadend = (function(_this) {
        return function() {
          var linkToSaveFile;
          linkToSaveFile = _this.el.querySelector("div.file a");
          linkToSaveFile.href = reader.result;
          linkToSaveFile.download = "" + basename + ".minilock";
          linkToSaveFile.click();
          return event.target.classList.remove("activated");
        };
      })(this);
    } else {
      return event.preventDefault();
    }
  };

  OutputView.prototype.postPostcardShortcut = function(event) {
    this.shortcut.set({
      "Base58": this.postcard.get("Base58")
    });
    this.shortcut.save();
    return this.shortcut.once("sync", (function(_this) {
      return function() {
        return console.info("Shortcut is ready", shortcut);
      };
    })(this));
  };

  OutputView.prototype.mailOutputIsAvailable = function() {
    return this.postcard.has("Base58");
  };

  OutputView.prototype.fileOutputIsAvailable = function() {
    return this.postcard.has("Base58");
  };

  OutputView.prototype.URLoutputIsAvailable = function() {
    return this.postcard.has("Base58");
  };

  OutputView.prototype.shortcutOutputIsAvailable = function() {
    return navigator.onLine && this.postcard.has("Base58");
  };

  OutputView.prototype.render = function() {
    this.el.querySelector(".mail.output button").disabled = this.mailOutputIsAvailable() === false;
    this.el.querySelector(".mail.output input").disabled = this.mailOutputIsAvailable() === false;
    this.el.querySelector(".mail.output").classList[this.mailOutputIsAvailable() ? "add" : "remove"]("available");
    this.el.querySelector(".mail.output").classList[this.mailOutputIsAvailable() ? "remove" : "add"]("unavailable");
    this.el.querySelector(".file.output button").disabled = this.fileOutputIsAvailable() === false;
    this.el.querySelector(".file.output input").disabled = this.fileOutputIsAvailable() === false;
    this.el.querySelector(".file.output").classList[this.fileOutputIsAvailable() ? "add" : "remove"]("available");
    this.el.querySelector(".file.output").classList[this.fileOutputIsAvailable() ? "remove" : "add"]("unavailable");
    this.el.querySelector(".shortcut.output button").disabled = this.mailOutputIsAvailable() === false;
    this.el.querySelector(".shortcut.output").classList[this.shortcutOutputIsAvailable() ? "add" : "remove"]("available");
    this.el.querySelector(".shortcut.output").classList[this.shortcutOutputIsAvailable() ? "remove" : "add"]("unavailable");
    this.el.querySelector(".copy.URL.output").classList[this.URLoutputIsAvailable() ? "add" : "remove"]("available");
    this.el.querySelector(".copy.URL.output").classList[this.URLoutputIsAvailable() ? "remove" : "add"]("unavailable");
    this.el.querySelector(".copy.URL a").innerHTML = "https://" + location.hostname + (this.postcard.url());
    this.el.querySelector(".visit.URL.output").classList[this.URLoutputIsAvailable() ? "add" : "remove"]("available");
    this.el.querySelector(".visit.URL.output").classList[this.URLoutputIsAvailable() ? "remove" : "add"]("unavailable");
    return this.el.querySelector(".visit.URL a").href = this.postcard.url();
  };

  OutputView.prototype.renderHTML = function() {
    return this.el.innerHTML = "<div class=\"mail output\"><a class=\"mail\" href=\"" + void 0 + "\" tabindex=\"-1\"></a>\n  <header>\n    <button>Mail Postcard</button> to\n    <a class=\"rw " + (this.postcard.postie.get("email_address") ? "valuable" : "undefined") + "\"><input placeholder=\"Paste an address\" name=\"email_address\" type=\"email\" value=\"" + (this.postcard.postie.get("email_address") || "") + "\"><var>" + (this.postcard.postie.get("email_address") || "Paste an address") + "</var></a>\n  </header>\n  <p>\n    Open a message in your mail program with a postcard code and link to unlock it.\n    You control the final delivery from your mail program.\n  </p>\n</div>\n<div class=\"file output\"><a class=\"file\" href=\"" + void 0 + "\" download=\"" + void 0 + ".minilock\" tabindex=\"-1\"></a>\n  <header>\n    <button>Save File</button> as\n    <a class=\"rw\"><input type=\"text\" name=\"basename\" value=\"Postcard\" default=\"Postcard\"><var>Postcard</var>.minilock</a>\n    </span>\n  </header>\n  <p>\n    Download a postcard file that you can move around any way you please.\n    Upload the file to this site when you need to unlock it.\n  </p>\n  <p style=\"display:" + (navigator.userAgent.match(/Version\/([\d.]+)([^S](Safari)|[^M]*(Mobile)[^S]*(Safari))/) ? "block" : "none") + ";\">\n    Unfortunately, the filename will be <em>Unknown</em> because we are having touble with Safari right now.\n  </p>\n</div>\n<div class=\"shortcut output\" style=\"display:none;\">\n  <header>\n    <button>Push Postcard</button> to <a href=\"\">minipost.link#<span class=\"io\" contenteditable=\"plaintext-only\" data-name=\"basename\">" + (this.shortcut.get("identifier")) + "</span></a>\n  </header>\n  <p>\n    Put this postcard at a publically accesible network address\n    that is short enough to share\n    in a bird song or another sort of chitter chatter.\n  </p>\n</div>\n<div class=\"copy URL output\">\n  <h2>Copy Postcard URL</h2>\n  <div><a class=\"copy_n_paste\">" + void 0 + "</a></div>\n</div>\n<div class=\"visit URL output\" style=\"display:" + (location.pathname.match("write") ? "block" : "none") + ";\">\n  <h2>" + (HTML.a("Visit Postcard Page", {
      href: void 0,
      "class": "visit"
    })) + "</h2>\n  <p>To see what your postie will see.</p>\n</div>";
  };

  OutputView.prototype.mousedownOnReadWriteInput = function(event) {
    return event.currentTarget.querySelector("input").focus();
  };

  OutputView.prototype.readWriteInput = function(event) {
    var input, output;
    input = event.currentTarget.querySelector("input");
    output = event.currentTarget.querySelector("var");
    if (input.value) {
      output.innerText = input.value;
      return event.currentTarget.classList.remove("undefined");
    } else if (input.getAttribute("default")) {
      return output.innerText = "";
    } else {
      output.innerText = input.getAttribute("placeholder");
      return event.currentTarget.classList.add("undefined");
    }
  };

  OutputView.prototype.postcardMailtoURL = function() {
    var address, body, subject;
    address = encodeURIComponent(this.el.querySelector(".mail.output [name=email_address]").value);
    subject = encodeURIComponent("miniLock postcard for you!");
    body = encodeURIComponent("This is a miniLock postcard code:\n\n" + (this.postcard.blockOfBase58Text()) + "\n\nTo unlock your postcard, copy the code and paste it at:\n\nhttps://" + location.hostname + "/unlock");
    return "mailto:" + address + "?Subject=" + subject + "&Body=" + body;
  };

  OutputView.prototype.readWriteInputLostFocus = function(event) {
    var input, output;
    input = event.currentTarget.querySelector("input");
    output = event.currentTarget.querySelector("var");
    if ((input.value === "") && input.getAttribute("default")) {
      input.value = input.getAttribute("default");
      return output.innerText = input.getAttribute("default");
    }
  };

  return OutputView;

})(Backbone.View);



},{"../models/shortcut.coffee":4,"./HTML.coffee":5}],11:[function(require,module,exports){
var PostieView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

PostieView = (function(_super) {
  var HTML, Identity;

  __extends(PostieView, _super);

  function PostieView() {
    this.render = __bind(this.render, this);
    return PostieView.__super__.constructor.apply(this, arguments);
  }

  module.exports = PostieView;

  HTML = require("./HTML.coffee");

  Identity = require("../models/identity.coffee");

  PostieView.prototype.initialize = function(options) {
    this.postie = options.model || new Identity;
    this.listenTo(this.postie, "change:email_address", this.render);
    this.listenTo(this.postie, "change:miniLockID", this.render);
    this.el.innerHTML = "<div class=\"email_address\">\n  <h2><label for=\"postie_address\">Mail to</label></h2>\n  " + (HTML.input({
      id: "postie_address",
      type: "email",
      name: "email_address",
      value: this.postie.get("email_address"),
      placeholder: "Paste your postie’s address"
    })) + "\n</div>\n<div class=\"miniLockID\">\n  <h2><label for=\"postie_miniLockID\">" + HTML.miniLockIconHTML + " ID</label></h2>\n  " + (HTML.input({
      id: "postie_miniLockID",
      type: "text",
      name: "miniLockID",
      value: this.postie.get("miniLockID"),
      placeholder: "Paste your postie’s miniLock ID"
    })) + "\n</div>\n<div class=\"public key\">\n  <h2>Public Key</h2>\n  <div>" + (HTML.renderByteStream(this.postie.publicKey() || new Uint8Array(32))) + "</div>\n</div>";
    return this.render();
  };

  PostieView.prototype.events = {
    "input [name=miniLockID]": "setMiniLockID",
    "input [name=email_address]": "setEmailAddress"
  };

  PostieView.prototype.setMiniLockID = function(event) {
    return this.postie.set("miniLockID", event.currentTarget.value);
  };

  PostieView.prototype.setEmailAddress = function(event) {
    return this.postie.set("email_address", event.currentTarget.value);
  };

  PostieView.prototype.render = function() {
    this.el.classList[this.postie.has("miniLockID") ? "remove" : "add"]("undefined");
    return this.el.querySelector(".public.key > div").innerHTML = HTML.renderByteStream(this.postie.publicKey() || new Uint8Array(32));
  };

  return PostieView;

})(Backbone.View);



},{"../models/identity.coffee":2,"./HTML.coffee":5}],12:[function(require,module,exports){
var UnlockPostcardView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

UnlockPostcardView = (function(_super) {
  var HTML, Identity, IdentityView, MakeKeysView, OutputsView, Postcard;

  __extends(UnlockPostcardView, _super);

  function UnlockPostcardView() {
    this.render = __bind(this.render, this);
    return UnlockPostcardView.__super__.constructor.apply(this, arguments);
  }

  module.exports = UnlockPostcardView;

  HTML = require("./HTML.coffee");

  Identity = require("../models/identity.coffee");

  Postcard = require("../models/postcard.coffee");

  MakeKeysView = require("./make_keys_view.coffee");

  IdentityView = require("./identity_view.coffee");

  OutputsView = require("./outputs_view.coffee");

  UnlockPostcardView.prototype.title = function() {
    return "Unlock " + (this.identity.has("email_address") ? "your" : (this.postcard.has("Base58") ? "this" : "a")) + " miniLock Postcard";
  };

  UnlockPostcardView.prototype.attributes = {
    id: "unlock_postcard_view"
  };

  UnlockPostcardView.prototype.initialize = function(params) {
    this.postcard = window.postcard = new Postcard;
    this.postcard.set("Base58", params.Base58, {
      validate: true
    });
    this.identity = window.identity = new Identity;
    this.identity.set("email_address", params.address, {
      validate: true
    });
    this.initialRender();
    this.initializeViews();
    return this.initializeEventListeners();
  };

  UnlockPostcardView.prototype.initialRender = function() {
    this.renderHTML();
    this.render();
    document.body.appendChild(this.el);
    this.el.focus();
    return Function.delay(666, (function(_this) {
      return function() {
        var _ref;
        return (_ref = _this.el.querySelector("[name=Base58].undefined,[name=email_address].undefined,[name=secret_phrase].undefined")) != null ? _ref.focus() : void 0;
      };
    })(this));
  };

  UnlockPostcardView.prototype.initializeViews = function() {
    new MakeKeysView({
      el: this.el.querySelector("div.make_keys_view"),
      model: this.identity
    });
    new IdentityView({
      el: this.el.querySelector("div.identity"),
      model: this.identity
    });
    return new OutputsView({
      el: this.el.querySelector("div.outputs_view"),
      model: this.postcard
    });
  };

  UnlockPostcardView.prototype.initializeEventListeners = function() {
    this.listenTo(this.identity, "keypair:ready", this.unlockPostcard);
    this.listenTo(this.postcard, "change:Base58", this.render);
    this.listenTo(this.postcard, "decrypt:complete", this.render);
    return this.listenTo(this.postcard, "decrypt:error", this.decryptError);
  };

  UnlockPostcardView.prototype.events = {
    "input [name=secret_phrase]": "setSecretPhrase",
    "input [name=email_address]": "setEmailAddress",
    "input .Base58.encoded": "setBase58encodedInput",
    "change input[type=file]": "setFileInput",
    "click button.lock": "lockPostcard",
    "click button.unlock": "unlockPostcard"
  };

  UnlockPostcardView.prototype.lockPostcard = function(event) {
    this.postcard.lock();
    return this.render();
  };

  UnlockPostcardView.prototype.unlockPostcard = function(event) {
    if (this.identity.keys()) {
      return this.postcard.unlock(this.identity.keys());
    } else {
      return this.identity.makeKeyPair();
    }
  };

  UnlockPostcardView.prototype.decryptError = function(error) {
    if (error === "Can’t decrypt this file with this set of keys.") {
      $("body").css({
        "background-color": "hsl(355, 100%, 66%)",
        "transition": "none"
      });
      return Function.delay(333, (function(_this) {
        return function() {
          _this.el.querySelector(".make_keys_view [name=email_address]").focus();
          _this.identity.unset("keys");
          _this.el.querySelector("article").classList.remove("keys_are_ready");
          _this.el.querySelector(".make_keys_view .public.key div").innerHTML = HTML.renderByteStream(new Uint8Array(32));
          _this.el.querySelector(".make_keys_view .secret.key div").innerHTML = HTML.renderByteStream(new Uint8Array(32));
          _this.el.querySelector(".make_keys_view [name=miniLockID]").classList.remove("valuable");
          _this.el.querySelector(".make_keys_view [name=miniLockID]").classList.add("expired");
          $("body").css({
            "background-color": "",
            "transition": "background-color 666ms linear 666ms"
          });
          return $("body").one("transitionend", function() {
            return $("body").css({
              "background-color": "",
              "transition": ""
            });
          });
        };
      })(this));
    }
  };

  UnlockPostcardView.prototype.setFileInput = function(event) {
    console.info(event.target.files[0]);
    this.postcard.set("file", event.target.files[0]);
    return this.postcard.unlockFile(this.identity.keys());
  };

  UnlockPostcardView.prototype.setBase58encodedInput = function(event) {
    var Base58input;
    Base58input = event.target.value.replace(/\n/g, "").trim();
    if (Base58input === "") {
      this.postcard.unset("Base58");
      event.currentTarget.classList.remove("acceptable");
      event.currentTarget.classList.add("unacceptable");
    } else {
      if (this.postcard.set("Base58", Base58input, {
        validate: true
      })) {
        console.info("Accepted Base58 input");
        event.currentTarget.classList.add("acceptable");
        event.currentTarget.classList.remove("unacceptable");
      } else {
        console.info("Rejected Base58 input");
        event.currentTarget.classList.remove("acceptable");
        event.currentTarget.classList.add("unacceptable");
      }
    }
    return this.render();
  };

  UnlockPostcardView.prototype.setSecretPhrase = function(event) {
    return this.identity.set("secret_phrase", event.currentTarget.value);
  };

  UnlockPostcardView.prototype.setEmailAddress = function(event) {
    return this.identity.set("email_address", event.currentTarget.value);
  };

  UnlockPostcardView.prototype.render = function() {
    this.renderTitle();
    this.renderBodyBackgroundColor();
    this.renderText();
    this.el.querySelector("article.postcard").classList[this.postcard.isUndefined() ? 'add' : 'remove']("undefined");
    this.el.querySelector("article.postcard").classList[this.postcard.isLocked() ? 'add' : 'remove']("locked");
    this.el.querySelector("article.postcard").classList[this.postcard.isUnlocked() ? 'add' : 'remove']("unlocked");
    this.el.querySelector(".author input[type=email]").value = this.postcard.get("mailfrom") || "Unknown";
    this.el.querySelector(".author input[name=miniLockID]").value = this.postcard.get("senderID") || "";
    this.el.querySelector(".author input[name=miniLockID]").classList.remove("blank");
    if (this.postcard.get("senderID")) {
      return this.el.querySelector(".author .public.key div").innerHTML = HTML.renderByteStream(miniLockLib.ID.decode(this.postcard.get("senderID")));
    } else {
      return this.el.querySelector(".author .public.key div").innerHTML = HTML.renderByteStream(new Uint8Array(32));
    }
  };

  UnlockPostcardView.prototype.renderTitle = function() {
    document.querySelector("title").innerText = this.title();
    return document.querySelector("body > h1").innerText = this.title();
  };

  UnlockPostcardView.prototype.renderBodyBackgroundColor = function() {
    var color;
    color = this.postcard.get("hue") ? "hsl(" + (this.postcard.get("hue")) + ", 66%, 66%);" : "";
    return $(document.body).css({
      "background-color": color
    });
  };

  UnlockPostcardView.prototype.renderText = function() {
    return this.el.querySelector(".decrypted.text div").innerText = this.postcard.get("text");
  };

  UnlockPostcardView.prototype.renderHTML = function() {
    var _ref;
    return this.el.innerHTML = "<article class=\"postcard " + (this.postcard.isLocked() ? 'locked' : 'unlocked') + "\">\n  <b class=\"line\"></b>\n  <a class=\"stamp\"></a>\n  " + (HTML.stamp("undefined", {
      alt: "Undefined Postcard"
    })) + "\n  " + (HTML.stamp("locked", {
      alt: "Locked Postcard"
    })) + "\n  " + (HTML.stamp("unlocked", {
      alt: "Unlocked Postcard"
    })) + "\n  " + (HTML.stamp("confused", {
      alt: "Confused About Postcard Input"
    })) + "\n  <div class=\"Base58 encoded encrypted input " + (this.postcard.get("Base58") ? "acceptable valuable" : "undefined") + "\">\n    <label class=\"undefined\">Paste your postcard code:</label>\n    <label class=\"unacceptable\"><span class=\"erase\">⌫</span> This is not a postcard code:</label>\n    <label class=\"acceptable\">Base58 encoded encrypted postcard code:</label>\n    " + (HTML.textarea({
      name: "Base58",
      value: this.postcard.get("Base58")
    })) + "\n  </div>\n  <div class=\"encrypted file input\">\n    <label class=\"undefined\"></label>\n    <input type=\"file\" name=\"blob\" class=\"undefined\">\n  </div>\n  <div class=\"UTF8 encoded decrypted text\">\n    <label>Decrypted postcard text</label>\n    <div>" + (this.postcard.get('text') || "") + "</div>\n  </div>\n  <div class=\"east\">\n    <div class=\"make_keys_view\">\n      <div class=\"error message\"></div>\n      <div class=\"email_address\">\n        <h2>Address</h2>\n        " + (HTML.input({
      name: "email_address",
      placeholder: "Paste your address",
      type: "email",
      value: this.identity.get("email_address")
    })) + "\n      </div>\n      <div class=\"secret_phrase\">\n        " + (HTML.textarea({
      name: "secret_phrase",
      placeholder: "Type your secret phrase…"
    })) + "\n      </div>\n      <div class=\"identity\"></div>\n    </div>\n    <div class=\"key_pair operation progress_graphic\">\n      <div class=\"progress\"></div>\n    </div>\n    <div class=\"decrypt operation progress_graphic\">\n      <div class=\"progress\"></div>\n    </div>\n    <br>\n    <div class=\"author\">\n      <div class=\"email_address\">\n        <h2>From</h2>\n        " + (HTML.input({
      name: "email_address",
      type: "email",
      tabindex: "-1",
      readonly: "yes",
      value: ""
    })) + "\n      </div>\n      <div class=\"miniLockID\">\n        <h2>" + HTML.miniLockIconHTML + " ID</h2>\n        " + (HTML.input({
      type: "text",
      name: "miniLockID",
      tabindex: "-1",
      readonly: "yes"
    })) + "\n      </div>\n      <div class=\"public key\">\n        <h2>Public Key</h2>\n        <div>" + (HTML.renderByteStream((_ref = this.identity.publicKey()) != null ? _ref : new Uint8Array(32))) + "</div>\n      </div>\n    </div>\n    <br>\n    <button class=\"unlock\">Unlock Postcard</button><button class=\"lock\">Lock Postcard</button>\n  <div>\n</article>\n<div class=\"outputs_view\"></div>\n<nav style=\"display:" + (location.protocol.match("extension") ? "none" : "block") + ";\">\n  <h3>Site Map</h3>\n  <a tabindex=\"-1\" " + (location.pathname !== "/" ? 'href="/"' : void 0) + ">" + minipost.hostname + "</a><br>\n  <a tabindex=\"-1\" " + (location.pathname !== ("/write" + minipost.HTMLsuffix) ? 'href="' + ("/write" + minipost.HTMLsuffix) + '"' : void 0) + ">" + minipost.hostname + "/write</a><br>\n  <a tabindex=\"-1\" " + (location.pathname !== ("/unlock" + minipost.HTMLsuffix) ? 'href="' + ("/unlock" + minipost.HTMLsuffix) + '"' : void 0) + ">" + minipost.hostname + "/unlock</a><br>\n</nav>";
  };

  return UnlockPostcardView;

})(Backbone.View);



},{"../models/identity.coffee":2,"../models/postcard.coffee":3,"./HTML.coffee":5,"./identity_view.coffee":7,"./make_keys_view.coffee":9,"./outputs_view.coffee":10}],13:[function(require,module,exports){
var WritePostcardView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

WritePostcardView = (function(_super) {
  var HTML, Identity, IdentityView, MakeKeysView, OutputsView, Postcard, PostieView;

  __extends(WritePostcardView, _super);

  function WritePostcardView() {
    return WritePostcardView.__super__.constructor.apply(this, arguments);
  }

  module.exports = WritePostcardView;

  HTML = require("./HTML.coffee");

  Identity = require("../models/identity.coffee");

  Postcard = require("../models/postcard.coffee");

  MakeKeysView = require("./make_keys_view.coffee");

  IdentityView = require("./identity_view.coffee");

  PostieView = require("./postie_view.coffee");

  OutputsView = require("./outputs_view.coffee");

  WritePostcardView.prototype.attributes = {
    id: "write_postcard_view"
  };

  WritePostcardView.prototype.initialize = function(params) {
    var _ref;
    this.postcard = window.postcard = new Postcard;
    this.identity = window.identity = (_ref = minipost.identity) != null ? _ref : new Identity;
    this.postcard.set({
      "text": params.text,
      "hue": params.hue || Math.round(Math.random() * (360 - 120)) + 60,
      "mailto": params.mailto,
      "mailfrom": params.mailfrom
    });
    this.postcard.postie.set({
      "email_address": params.mailto,
      "miniLockID": params.miniLockID
    });
    this.identity.set({
      "email_address": params.mailfrom
    });
    this.render();
    document.body.appendChild(this.el);
    new PostieView({
      el: this.el.querySelector("div.postie"),
      model: this.postcard.postie
    });
    new MakeKeysView({
      el: this.el.querySelector("div.make_keys_view"),
      model: this.identity
    });
    new IdentityView({
      el: this.el.querySelector("div.identity"),
      model: this.identity
    });
    new OutputsView({
      el: this.el.querySelector("div.outputs_view"),
      model: this.postcard
    });
    this.identity.on("keypair:start", (function(_this) {
      return function() {
        return document.querySelector(".postcard").classList.add("making_keys");
      };
    })(this));
    this.identity.on("keypair:ready", (function(_this) {
      return function() {
        document.querySelector(".postcard").classList.add("encrypting");
        return Function.delay(333, function() {
          return _this.postcard.encrypt(_this.identity.keys());
        });
      };
    })(this));
    this.postcard.on("encrypt:complete", (function(_this) {
      return function() {
        document.querySelector(".postcard").classList.remove("encrypting");
        return document.querySelector(".postcard").classList.add("encrypted");
      };
    })(this));
    this.el.focus();
    if (this.postcard.isAcceptable() && this.identity.keys()) {
      return this.postcard.encrypt(this.identity.keys());
    } else {
      return Function.delay(666, (function(_this) {
        return function() {
          var _ref1;
          return (_ref1 = _this.el.querySelector("textarea.undefined,input.undefined")) != null ? _ref1.focus() : void 0;
        };
      })(this));
    }
  };

  WritePostcardView.prototype.events = {
    "input [name=text]": "setText",
    "input [name=mailto]": "setMailto",
    "input [name=miniLockID]": "setMiniLockID",
    "input .make_keys_view [name=email_address]": "setMailFrom",
    "click button.commit": "makePostcard",
    "input [name=hue]": "setHueOfBody",
    "change [name=hue]": "setHue"
  };

  WritePostcardView.prototype.makePostcard = function(event) {
    if (!this.postcard.get("text")) {
      return this.el.querySelector("[name=text]").focus();
    }
    if (!this.postcard.get("mailto")) {
      return this.el.querySelector("[name=mailto]").focus();
    }
    if (!this.postcard.get("miniLockID")) {
      return this.el.querySelector("[name=miniLockID]").focus();
    }
    if (!this.identity.get("email_address")) {
      return this.el.querySelector(".make_keys_view [name=email_address]").focus();
    }
    if (!this.identity.get("secret_phrase")) {
      return this.el.querySelector(".make_keys_view [name=secret_phrase]").focus();
    }
    if (this.identity.keys()) {
      return this.postcard.encrypt(this.identity.keys());
    } else {
      return this.identity.makeKeyPair();
    }
  };

  WritePostcardView.prototype.setText = function(event) {
    return this.postcard.set("text", this.el.querySelector("textarea").value);
  };

  WritePostcardView.prototype.setMailto = function(event) {
    return this.postcard.set("mailto", event.target.value);
  };

  WritePostcardView.prototype.setMiniLockID = function(event) {
    return this.postcard.set("miniLockID", event.target.value);
  };

  WritePostcardView.prototype.setMailFrom = function(event) {
    return this.postcard.set("mailfrom", event.target.value);
  };

  WritePostcardView.prototype.setHueOfBody = function(event) {
    return $(document.body).css({
      "background-color": "hsl(" + event.currentTarget.value + ", 66%, 66%);",
      "transition": "none"
    });
  };

  WritePostcardView.prototype.setHue = function(event) {
    this.postcard.set("hue", event.currentTarget.value);
    return $(document.body).css({
      "background-color": "hsl(" + (this.postcard.get("hue")) + ", 66%, 66%);",
      "transition": null
    });
  };

  WritePostcardView.prototype.renderBodyBackgroundColor = function() {
    return $(document.body).css({
      "background-color": "hsl(" + (this.postcard.get("hue")) + ", 66%, 66%);"
    });
  };

  WritePostcardView.prototype.render = function() {
    document.querySelector("title").innerText = "Write a miniLock Postcard";
    document.querySelector("body > h1").innerText = "Write a miniLock Postcard";
    this.renderBodyBackgroundColor();
    return this.el.innerHTML = "<article class=\"postcard " + (this.postcard.isLocked() ? 'locked' : 'unlocked') + "\">\n  <header>\n    This postcard will be encrypted with <em>" + (HTML.a("miniLock", {
      href: "https://minilock.io"
    })) + "</em> <br>to ensure no one else can sneak a peek.\n  </header>\n  <a class=\"stamp\"></a>\n  <b class=\"line\"></b>\n  <div class=\"decrypted text\">\n    <label for=\"postcard_text_input\" tabindex=\"-1\">Write a lovely note…</label>\n    " + (HTML.textarea({
      id: "postcard_text_input",
      name: "text",
      spellcheck: "off",
      value: this.postcard.get("text")
    })) + "\n  </div>\n  <div class=\"hue\">\n    <label for=\"postcard_hue_input\" tabindex=\"-1\">Hue</label>\n    <input id=\"postcard_hue_input\" tabindex=\"-1\" name=\"hue\" type=\"range\" min=\"" + this.postcard.minHue + "\" max=\"" + this.postcard.maxHue + "\" value=\"" + (this.postcard.get("hue") || "") + "\">\n  </div>\n  <div class=\"east\">\n    <div class=\"postie\"></div>\n    <br>\n    <div class=\"make_keys_view\">\n      <header>\n        <div class=\"error message\">" + void 0 + "</div>\n      </header>\n      <div class=\"email_address\">\n        <h2><label for=\"author_address\">From</label></h2>\n        " + (HTML.input({
      id: "author_address",
      type: "email",
      name: "email_address",
      value: this.identity.get("email_address"),
      placeholder: "Paste your address"
    })) + "\n      </div>\n      <div class=\"secret_phrase\">\n        <h2><label for=\"author_secret_phrase\">Secret</label></h2>\n        " + (HTML.textarea({
      id: "author_secret_phrase",
      name: "secret_phrase",
      placeholder: "Type your secret phrase…"
    })) + "\n      </div>\n      <div class=\"identity\"></div>\n    </div>\n    <div class=\"key_pair operation progress_graphic\">\n      <div class=\"progress\"></div>\n    </div>\n    <div class=\"encrypt operation progress_graphic\">\n      <div class=\"progress\"></div>\n    </div>\n    <br>\n    <button class=\"commit\">Make Postcard</button>\n  </div>\n</article>\n<div class=\"outputs_view\"></div>\n<nav style=\"display:" + (location.protocol.match("extension") ? "none" : "block") + ";\">\n  <h3>Site Map</h3>\n  <a tabindex=\"-1\" " + (location.pathname !== "/" ? 'href="/"' : void 0) + ">" + minipost.hostname + "</a><br>\n  <a tabindex=\"-1\" " + (location.pathname !== ("/write" + minipost.HTMLsuffix) ? 'href="' + ("/write" + minipost.HTMLsuffix) + '"' : void 0) + ">" + minipost.hostname + "/write</a><br>\n  <a tabindex=\"-1\" " + (location.pathname !== ("/unlock" + minipost.HTMLsuffix) ? 'href="' + ("/unlock" + minipost.HTMLsuffix) + '"' : void 0) + ">" + minipost.hostname + "/unlock</a><br>\n</nav>";
  };

  return WritePostcardView;

})(Backbone.View);



},{"../models/identity.coffee":2,"../models/postcard.coffee":3,"./HTML.coffee":5,"./identity_view.coffee":7,"./make_keys_view.coffee":9,"./outputs_view.coffee":10,"./postie_view.coffee":11}]},{},[1]);
