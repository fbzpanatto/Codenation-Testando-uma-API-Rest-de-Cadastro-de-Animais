const request = require('supertest')
const server = require('../src/server')
const {
  cleanDB,
  openDB,
  populateDB
} = require('./utils')

const { animals : {
  findAll,
  findById,
  create,
  update,
  destroy
}} = require('../src/model/index')

const mockDate = new Date('2020-02-03T14:56:27.980Z')

global.Date = class extends Date {
  constructor () {
    return mockDate
  }
}

beforeAll(() => cleanDB())
afterAll(() => cleanDB())

const data = {
  "ANI1580214599567RD121": {
    "created_at": "2020-01-28T12:29:59.567Z",
    "updated_at": "2020-01-28T12:29:59.567Z",
    "pet_name": "Belchior Fernandes Montalvão",
    "description": "Gatinho mais fofinho desse mundo",
    "animal_type": "Gato",
    "pet_age": "6 Meses",
    "sex": "Macho",
    "color": "Branco Malhado",
    "image_url": ""
  },
  "ANI1580216220549RD493": {
    "created_at": "2020-01-28T12:57:00.550Z",
    "updated_at": "2020-01-28T12:57:00.550Z",
    "pet_name": "Tereza Fernandes Montalvão",
    "description": "Gatinha mais perfeita desse mundão redondo",
    "animal_type": "Gato",
    "pet_age": "6 Meses",
    "sex": "Fêmea",
    "color": "Malhada",
    "image_url": ""
  }
}

describe('The API on /api/animals Endpoint at GET method should...', () => {
  beforeAll(() => {
    populateDB(data)
  })

  afterAll(() => cleanDB())

  test(`return 200 as status code and have 'total' and 'data' as properties`, async () => {
    expect.assertions(2)

    const res = await request(server.app).get('/api/animals')

    expect(res.statusCode).toEqual(200)
    expect(Object.keys(res.body)).toMatchObject([
      'total',
      'data'
    ])
  })

  test('return the right number of items and an object with all items', async () => {
    expect.assertions(2)

    const res = await request(server.app).get('/api/animals')

    expect(res.body.total).toEqual(2)
    expect(typeof res.body.data).toBe('object')
  })

  test(`return the 'data' property with all items from DB`, async () => {
    expect.assertions(1)

    const res = await request(server.app).get('/api/animals')

    expect(res.body).toMatchObject({
      total: 2,
      data
    })
  })

})

describe('The API on /api/animals/:id Endpoint at GET method should...', () => {
  beforeAll(() => {
    populateDB(data)
  })

  afterAll(() => cleanDB())

  test('return 200 as status code and the correct animal put in id', async () => {
    expect.assertions(2)

    const res = await request(server.app).get('/api/animals/ANI1580214599567RD121')
    expect(res.statusCode).toEqual(200)
    expect(res.body).toEqual(data.ANI1580214599567RD121)
  })

  test('return 404 as status code if incorret id', async () => {
    expect.assertions(1)

    const resError = await request(server.app).get('/api/animals/ANI1580214599567RD121_makeError')
    expect(resError.statusCode).toEqual(404)
  })

})

describe('The API on /api/animals Endpoint at POST method should...', () => {
  beforeAll(() => {
    populateDB(data)
  })

  afterAll(() => cleanDB())

  test('testing the route and the create method together', async() => {
    expect.assertions(2)

    const newPet = {
      "pet_name": "Doguinho da Silva Pericles Anastacio",
      "description": "Cachorrinho comedor de muito bancon e presunto",
      "animal_type": "Cachorro",
      "pet_age": "2 Anos",
      "sex": "Macho",
      "color": "Bege",
      "image_url": ""
    }

    const expected = {
      ...newPet,
      updated_at : new Date().toISOString(),
      created_at : new Date().toISOString()
    }

    const createdData = await request(server.app).post('/api/animals').send(newPet)
    expect(createdData.statusCode).toEqual(201)
    expect(createdData.body).toEqual(expected)
  })

})

describe('The API on /api/animals/:id Endpoint at PATCH method should...', () => {
  beforeAll(() => {
    populateDB(data)
  })

  afterAll(() => cleanDB())

  test('should be error 404 if the user put invalid id', async () => {
    const res = await request(server.app).patch('/api/animals/ANI1580214599567RD121_makingError')
    expect(res.statusCode).toEqual(404)
  })

  test('should return statuscode 200 and reqbody toEqual updated data', async () => {
    expect.assertions(2)

    const localData = {
      "created_at": "2020-01-28T12:57:00.550Z",
      "updated_at": new Date().toISOString(),
      "pet_name": "Tereza Fernandes Montalvão",
      "description": "Gatinha que tem medo de ratos",
      "animal_type": "Gato",
      "pet_age": "10 meses",
      "sex": "Fêmea",
      "color": "Malhada",
      "image_url": ""
    }

    const res = await request(server.app).patch('/api/animals/ANI1580216220549RD493').send({
      description : 'Gatinha que tem medo de ratos',
      pet_age     : '10 meses'
    }, 'ANI1580216220549RD493')

    expect(res.body).toEqual(localData)
    expect(res.statusCode).toEqual(200)
  })

})

describe('The API on /api/animals/:id Endpoint at DELETE method should...', () => {
  beforeAll(() => populateDB(data))
  afterAll(() => cleanDB())

  test('return an empty object and status 204', async () => {
    expect.assertions(2)

    const res = await request(server.app).delete('/api/animals/ANI1580214599567RD121')
    
    expect(res.body).toEqual({})
    expect(res.statusCode).toEqual(204)

  })

  test('return status 404 if the user put invalid id', async () => {
    expect.assertions(2)

    const resError = await request(server.app).delete('/api/animals/ANI1580214599567RD121_makingError')
    expect(resError.statusCode).toEqual(404)
    expect(resError.body).toEqual({error: "The record ANI1580214599567RD121_makingError couldn't be found."})
  })

})