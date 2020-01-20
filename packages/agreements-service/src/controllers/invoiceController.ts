import { log } from '../winston'
import { AppContext } from '../app'
import { Invoice } from '../models'

const logger = log.child({ component: 'Open Payments Invoices Controller' })

export async function store (ctx: AppContext): Promise<void> {
  logger.debug('Create invoice', { body: ctx.request.body, headers: ctx.request.headers })
  const { body } = ctx

  try {
    const insertedInvoice = await Invoice.query().insertAndFetch(body)
    ctx.body = insertedInvoice.$toJson()
    ctx.response.status = 201
  } catch (error) {
    logger.error(error.message)
    throw error
  }
}

export async function index (ctx: AppContext): Promise<void> {
  logger.debug('Index invoices', { headers: ctx.request.headers })
  const { body } = ctx

  const userId = 1234// userId from query or OAuth?
  const invoices = await Invoice.query().where('userId', userId).orderBy('createdAt', 'desc')
  ctx.body = invoices.$toJson()
}

export async function show (ctx: AppContext): Promise<void> {
  logger.debug('Show invoice by id', { headers: ctx.request.headers })

  const invoiceId = ctx.request.query.id
  const userId = 1234// userId from query or OAuth?
  const invoice = await Invoice.query().where('userId', userId).andWhere('id', invoiceId).first()

  if (invoice) {
    ctx.response.status = 200
    ctx.body = invoice.$toJson()
  } else {
    ctx.response.status = 404
    ctx.response.message = 'No invoice found'
    // should it rather be dealt with inside a try catch?
  }
}

export async function remove (ctx: AppContext): Promise<void> {
  logger.debug('Remove invoice by id', { headers: ctx.request.headers })

  const invoiceId = ctx.request.query.id
  const userId = 1234 // userIf from query or OAuth
  const deletedInvoice = await Invoice.query().updateAndFetch({ deletedAt: (Date.now() / 1000) }).where('id', invoiceId).andWhere('userId', userId).first()

  if (deletedInvoice) {
    ctx.response.status = 200
    ctx.body = deletedInvoice
  } else {
    ctx.response.status = 404
    ctx.response.message = 'No invoice found'
    // should it rather be dealt within a try catch?
  }
}
