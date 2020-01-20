import axios from 'axios'
import { App, Agreement } from '../../../src'
import Knex = require('knex')
import { refreshDatabase } from '../../db'
import { AgreementBucketMock } from '../../mocks/agreementBucketMock'
import { v4 } from 'uuid'

const agreementBucketMock = new AgreementBucketMock

describe('Invoice CRUD tests', () => {
  let app: App
  let db: Knex
  let validInvoiceBody: InvoiceBody
  let authData: Object

  beforeAll(() => {
    app = new App(agreementBucketMock)
    app.listen(4000)
    validInvoiceBody = {
      id: v4(),
      desc: 'This is a description',
      amount: '123456',
      currencyCode: 'USD',
      balance: '1234567',
      userId: 'userId'
    }
  })

  beforeEach(async () => {
    db = await refreshDatabase()
  })

  afterEach(async () => {
    await Agreement.query().delete()
    await db.destroy()
  })

  afterAll(() => {
    app.shutdown()
  })

  test('Can create an invoice', async () => {
    const response = await axios.post('http://localhost:4000/invoices', validInvoiceBody, authData)
    const invoice = await Agreement.query().where('id', validInvoiceBody.id).first()

    expect(response.status).toEqual(201)
    expect(invoice).toBeDefined()
    expect(invoice).toEqual(validInvoiceBody)
  })
  test('Handle an attempt to create with a bad body', async () => {
    const invalidInvoice = validInvoiceBody
    invalidInvoice.id = 'invalid-uuid'
    const response = await axios.post('http://localhost:4000/invoices', validInvoiceBody, authData)
    .catch((error) => {
      expect(error.statusCode).toEqual(400)
    })
    expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to create', async () => {
    const response = await axios.post('http://localhost:4000/invoices', validInvoiceBody)
    .catch((error) => {
      expect(error.statusCode).toEqual(403)
    })
    expect(response).toBeUndefined()
  })

  test('Can get invoices', async () => {
    await Agreement.query().insert(validInvoiceBody)
    const response = await axios.get('http://localhost:4000/invoices', authData)
    expect(response.status).toEqual(200)
    expect(response.data[0]).toEqual(validInvoiceBody)
  })
  test('Can get an invoice by id', async () => {
    await Agreement.query().insert(validInvoiceBody)
    const response = await axios.get(`http://localhost:4000/invoices/${validInvoiceBody.id}`, authData)
    expect(response.status).toEqual(200)
    expect(response.data).toEqual(validInvoiceBody)
  })
  test('Return 404 on unrecognized id', async () => {
     const response = await axios.get(`http://localhost:4000/invoices/invalidId`, authData)
     .catch( (error) => {
       expect(error.statusCode).toEqual(404)
     })
     expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to get invoices', async () => {
    const response = await axios.get(`http://localhost:4000/invoices`)
    .catch((error) => {
      expect(error.statusCode).toEqual(403)
    })
    expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to get an invoice by id', async () => {
    const response = await axios.get(`http://localhost:4000/invoices/anyid`)
    .catch((error) => {
      expect(error.statusCode).toEqual(403)
    })
    expect(response).toBeUndefined()
  })

  test('Can delete an invoice by id', async () => {
    await Agreement.query().insert(validInvoiceBody)
    const response = await axios.delete(`http://localhost:4000/invoices/${validInvoiceBody.id}`, authData)
    expect(response.status).toEqual(200)
    const invoice = await Agreement.query().where('id', validInvoiceBody.id).first()
    expect(invoice).toBeUndefined()
  })
  test('Return 404 on unrecognized id', async () => {
    const response = await axios.delete(`http://localhost:4000/invoices/${validInvoiceBody.id}`, authData)
    .catch((error) => {
      expect(error.statusCode).toEqual(404)
    })
    expect(response).toBeUndefined()
  })
  test('Handle an unauthorized attempt to delete an invoice by id', async () => {
    await Agreement.query().insert(validInvoiceBody)
    const response = await axios.delete(`http://localhost:4000/invoices/${validInvoiceBody}`)
    .catch((error) => {
      expect(error.statusCode).toEqual(403)
    })
    expect(response).toBeUndefined()
  })

})