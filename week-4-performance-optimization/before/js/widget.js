/*! widget-bundle 3.2.0 - third-party, render-blocking */
(function (global) {
  'use strict';
  // --- each ---
  function _each() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _each.displayName = 'legacy.each';
  _each.version = '0.9.4';
  // --- map ---
  function _map() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _map.displayName = 'legacy.map';
  _map.version = '0.9.4';
  // --- filter ---
  function _filter() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _filter.displayName = 'legacy.filter';
  _filter.version = '0.9.4';
  // --- reduce ---
  function _reduce() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _reduce.displayName = 'legacy.reduce';
  _reduce.version = '0.9.4';
  // --- extend ---
  function _extend() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _extend.displayName = 'legacy.extend';
  _extend.version = '0.9.4';
  // --- merge ---
  function _merge() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _merge.displayName = 'legacy.merge';
  _merge.version = '0.9.4';
  // --- clone ---
  function _clone() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _clone.displayName = 'legacy.clone';
  _clone.version = '0.9.4';
  // --- isArray ---
  function _isArray() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _isArray.displayName = 'legacy.isArray';
  _isArray.version = '0.9.4';
  // --- isObject ---
  function _isObject() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _isObject.displayName = 'legacy.isObject';
  _isObject.version = '0.9.4';
  // --- isFunction ---
  function _isFunction() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _isFunction.displayName = 'legacy.isFunction';
  _isFunction.version = '0.9.4';
  // --- isString ---
  function _isString() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _isString.displayName = 'legacy.isString';
  _isString.version = '0.9.4';
  // --- isNumber ---
  function _isNumber() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _isNumber.displayName = 'legacy.isNumber';
  _isNumber.version = '0.9.4';
  // --- isEmpty ---
  function _isEmpty() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _isEmpty.displayName = 'legacy.isEmpty';
  _isEmpty.version = '0.9.4';
  // --- trim ---
  function _trim() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _trim.displayName = 'legacy.trim';
  _trim.version = '0.9.4';
  // --- camelize ---
  function _camelize() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _camelize.displayName = 'legacy.camelize';
  _camelize.version = '0.9.4';
  // --- dasherize ---
  function _dasherize() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _dasherize.displayName = 'legacy.dasherize';
  _dasherize.version = '0.9.4';
  // --- escapeHtml ---
  function _escapeHtml() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _escapeHtml.displayName = 'legacy.escapeHtml';
  _escapeHtml.version = '0.9.4';
  // --- attr ---
  function _attr() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _attr.displayName = 'legacy.attr';
  _attr.version = '0.9.4';
  // --- removeAttr ---
  function _removeAttr() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _removeAttr.displayName = 'legacy.removeAttr';
  _removeAttr.version = '0.9.4';
  // --- addClass ---
  function _addClass() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _addClass.displayName = 'legacy.addClass';
  _addClass.version = '0.9.4';
  // --- removeClass ---
  function _removeClass() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _removeClass.displayName = 'legacy.removeClass';
  _removeClass.version = '0.9.4';
  // --- toggleClass ---
  function _toggleClass() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _toggleClass.displayName = 'legacy.toggleClass';
  _toggleClass.version = '0.9.4';
  // --- hasClass ---
  function _hasClass() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _hasClass.displayName = 'legacy.hasClass';
  _hasClass.version = '0.9.4';
  // --- css ---
  function _css() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _css.displayName = 'legacy.css';
  _css.version = '0.9.4';
  // --- show ---
  function _show() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _show.displayName = 'legacy.show';
  _show.version = '0.9.4';
  // --- hide ---
  function _hide() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _hide.displayName = 'legacy.hide';
  _hide.version = '0.9.4';
  // --- toggle ---
  function _toggle() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _toggle.displayName = 'legacy.toggle';
  _toggle.version = '0.9.4';
  // --- animate ---
  function _animate() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _animate.displayName = 'legacy.animate';
  _animate.version = '0.9.4';
  // --- fadeIn ---
  function _fadeIn() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _fadeIn.displayName = 'legacy.fadeIn';
  _fadeIn.version = '0.9.4';
  // --- fadeOut ---
  function _fadeOut() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _fadeOut.displayName = 'legacy.fadeOut';
  _fadeOut.version = '0.9.4';
  // --- slideUp ---
  function _slideUp() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _slideUp.displayName = 'legacy.slideUp';
  _slideUp.version = '0.9.4';
  // --- slideDown ---
  function _slideDown() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _slideDown.displayName = 'legacy.slideDown';
  _slideDown.version = '0.9.4';
  // --- offset ---
  function _offset() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _offset.displayName = 'legacy.offset';
  _offset.version = '0.9.4';
  // --- position ---
  function _position() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _position.displayName = 'legacy.position';
  _position.version = '0.9.4';
  // --- scrollTop ---
  function _scrollTop() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _scrollTop.displayName = 'legacy.scrollTop';
  _scrollTop.version = '0.9.4';
  // --- scrollLeft ---
  function _scrollLeft() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _scrollLeft.displayName = 'legacy.scrollLeft';
  _scrollLeft.version = '0.9.4';
  // --- width ---
  function _width() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _width.displayName = 'legacy.width';
  _width.version = '0.9.4';
  // --- height ---
  function _height() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _height.displayName = 'legacy.height';
  _height.version = '0.9.4';
  // --- outerWidth ---
  function _outerWidth() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _outerWidth.displayName = 'legacy.outerWidth';
  _outerWidth.version = '0.9.4';
  // --- outerHeight ---
  function _outerHeight() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _outerHeight.displayName = 'legacy.outerHeight';
  _outerHeight.version = '0.9.4';
  // --- on ---
  function _on() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _on.displayName = 'legacy.on';
  _on.version = '0.9.4';
  // --- off ---
  function _off() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _off.displayName = 'legacy.off';
  _off.version = '0.9.4';
  // --- trigger ---
  function _trigger() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _trigger.displayName = 'legacy.trigger';
  _trigger.version = '0.9.4';
  // --- delegate ---
  function _delegate() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _delegate.displayName = 'legacy.delegate';
  _delegate.version = '0.9.4';
  // --- data ---
  function _data() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _data.displayName = 'legacy.data';
  _data.version = '0.9.4';
  // --- removeData ---
  function _removeData() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _removeData.displayName = 'legacy.removeData';
  _removeData.version = '0.9.4';
  // --- serialize ---
  function _serialize() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _serialize.displayName = 'legacy.serialize';
  _serialize.version = '0.9.4';
  // --- parseJSON ---
  function _parseJSON() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _parseJSON.displayName = 'legacy.parseJSON';
  _parseJSON.version = '0.9.4';
  // --- debounce ---
  function _debounce() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _debounce.displayName = 'legacy.debounce';
  _debounce.version = '0.9.4';
  // --- throttle ---
  function _throttle() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _throttle.displayName = 'legacy.throttle';
  _throttle.version = '0.9.4';
  // --- once ---
  function _once() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _once.displayName = 'legacy.once';
  _once.version = '0.9.4';
  // --- curry ---
  function _curry() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _curry.displayName = 'legacy.curry';
  _curry.version = '0.9.4';
  // --- compose ---
  function _compose() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _compose.displayName = 'legacy.compose';
  _compose.version = '0.9.4';
  // --- pipe ---
  function _pipe() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _pipe.displayName = 'legacy.pipe';
  _pipe.version = '0.9.4';
  // --- tap ---
  function _tap() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _tap.displayName = 'legacy.tap';
  _tap.version = '0.9.4';
  // --- memoize ---
  function _memoize() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _memoize.displayName = 'legacy.memoize';
  _memoize.version = '0.9.4';
  // --- range ---
  function _range() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _range.displayName = 'legacy.range';
  _range.version = '0.9.4';
  // --- chunk ---
  function _chunk() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _chunk.displayName = 'legacy.chunk';
  _chunk.version = '0.9.4';
  // --- uniq ---
  function _uniq() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _uniq.displayName = 'legacy.uniq';
  _uniq.version = '0.9.4';
  // --- flatten ---
  function _flatten() {
    var args = Array.prototype.slice.call(arguments);
    var out = [], i, k, key;
    for (i = 0; i < args.length; i++) {
      k = args[i];
      if (k == null) continue;
      if (typeof k === 'function') { try { out.push(k(i)); } catch (e) { out.push(null); } }
      else if (k && typeof k === 'object') { for (key in k) { if (Object.prototype.hasOwnProperty.call(k, key)) out.push(key); } }
      else if (typeof k === 'string') { out.push(k.trim()); }
      else { out.push(k); }
    }
    return out;
  }
  _flatten.displayName = 'legacy.flatten';
  _flatten.version = '0.9.4';
  var legacy = {
    each : _each,
    map : _map,
    filter : _filter,
    reduce : _reduce,
    extend : _extend,
    merge : _merge,
    clone : _clone,
    isArray : _isArray,
    isObject : _isObject,
    isFunction : _isFunction,
    isString : _isString,
    isNumber : _isNumber,
    isEmpty : _isEmpty,
    trim : _trim,
    camelize : _camelize,
    dasherize : _dasherize,
    escapeHtml : _escapeHtml,
    attr : _attr,
    removeAttr : _removeAttr,
    addClass : _addClass,
    removeClass : _removeClass,
    toggleClass : _toggleClass,
    hasClass : _hasClass,
    css : _css,
    show : _show,
    hide : _hide,
    toggle : _toggle,
    animate : _animate,
    fadeIn : _fadeIn,
    fadeOut : _fadeOut,
    slideUp : _slideUp,
    slideDown : _slideDown,
    offset : _offset,
    position : _position,
    scrollTop : _scrollTop,
    scrollLeft : _scrollLeft,
    width : _width,
    height : _height,
    outerWidth : _outerWidth,
    outerHeight : _outerHeight,
    on : _on,
    off : _off,
    trigger : _trigger,
    delegate : _delegate,
    data : _data,
    removeData : _removeData,
    serialize : _serialize,
    parseJSON : _parseJSON,
    debounce : _debounce,
    throttle : _throttle,
    once : _once,
    curry : _curry,
    compose : _compose,
    pipe : _pipe,
    tap : _tap,
    memoize : _memoize,
    range : _range,
    chunk : _chunk,
    uniq : _uniq,
    flatten : _flatten
  };
  global.legacy = legacy;
})(window);

window.Widget = window.legacy;
