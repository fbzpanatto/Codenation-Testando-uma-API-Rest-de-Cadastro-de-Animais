const fs = require('fs')
const path = require('path')
const env = process.env.NODE_ENV || 'development'

const schema  = require('./schema')

const openDB = () => require(`../../data/database.${env}.json`)

const updateDB = (data) => {
  const pathname = path.join(__dirname, `../../data/database.${env}.json`)

  try {
    const stringifiedData = JSON.stringify(data, null, 2)
    return fs.writeFileSync(pathname, stringifiedData, 'utf8')
  } catch (err) {
    return `Couldn't update database.${env}.json`
  }
}

const animals = {
  // Retorna todos os animais na base
  findAll: () => Promise.resolve(openDB()),

  // Retorna o animal indicado pela chave
  findById: id => new Promise((resolve) => {
    const db = openDB()
    return resolve(db[id])
  }),

  // Cria um novo registro na base
  create: data => new Promise((resolve) => {
    const db = openDB()
    const id = 'ANI' + (new Date()).getTime() + 'RD' + (Math.random() * 1000).toFixed()
    db[id] = Object.assign(
      schema,
      data,
      { created_at: new Date(), updated_at: new Date() }
    )

    updateDB(db)

    return resolve(db[id])
  }),

  // Atualiza um registro da base, baseado em um id /chave
  update: (data, id) => new Promise((resolve) => {
    const db = openDB()

    if (!db[id]) {
      return resolve(false)
    }

    db[id] = Object.assign(
      { ...db[id] },
      data,
      { updated_at: new Date() }
    )

    return resolve(db[id])
  }),

  // Remove um registro da base, baseado em um id / chave
  destroy: id => new Promise((resolve) => {
    const db = openDB()

    if (db[id]) {
      delete db[id]
      updateDB(db)

      return resolve(true)
    }

    return resolve(false)
  })
}


module.exports = { animals }