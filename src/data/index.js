/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {string} name
 * @property {string} brand
 * @property {string} image
 * @property {number} price
 * @property {string} [description]
 * @property {string} [screen]
 * @property {string} [chip]
 * @property {string} [ram]
 * @property {string} [storage]
 * @property {string} [camera]
 * @property {string} [battery]
 */

/**
 * @typedef {Object} CartItem
 * @property {number} id
 * @property {string} name
 * @property {string} image
 * @property {number} price
 * @property {number} quantity
 */

/**
 * @typedef {Object} Address
 * @property {number|string} id
 * @property {string} address
 * @property {string} name
 * @property {string} phone
 */

/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {string} username
 * @property {string} date
 * @property {Array<CartItem>} items
 * @property {number} totalPrice
 * @property {Address} shippingInfo
 * @property {string} status
 */

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} password
 * @property {string} [email]
 * @property {string} [phone]
 * @property {Array<Address>} [addresses]
 * @property {string} [role]
 */
