const tenantsRouter = require('express').Router()
const bcrypt = require('bcrypt')
const Tenant = require('../models/tenant')
const Shop = require('../models/shop')

tenantsRouter.get('/', async (request, response) => {
  try {
    const tenants = await Tenant.find({})
    response.json(tenants)
  } catch (error){
    console.error('Failed to fetch tenants', error)
    response.status(500).json({ error: 'Failed to fetch tenants' })
  }
})

tenantsRouter.get('/:id', async (request, response) => {
  try {
    const tenant = await Tenant.findById(request.params.id)
    if(!tenant){
      return response.status(404).json({ error: 'Tenant not found' })
    }
    response.json(tenant)
  } catch (error){
    console.error('Failed to fetch tenant info', error)
    response.status(500).json({ error: 'Failed to fetch tenant info' })
  }
})

tenantsRouter.put('/:id', async (request, response) => {
  try {
    const { password, ...rest } = request.body
    const update = { ...rest }

    if (password) {
      const saltRounds = 10
      update.passwordHash = await bcrypt.hash(password, saltRounds)
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      request.params.id,
      update,
      { new: true, runValidators: true, context: 'query' }
    )

    if (!updatedTenant) {
      return response.status(404).json({ error: 'Tenant not found' })
    }

    response.json(updatedTenant)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

tenantsRouter.post('/', async (request, response) => {
  try {
    const { username, name, email, phone, password, shopName, rent } = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const shopID = await Shop.findOne({ name: shopName })
    if(!shopID)
      response.status(400).json({ error: 'Cannot find shop' })
    const tenant = new Tenant({
      username,
      name,
      email,
      phone,
      passwordHash,
      shopID,
      rent
    })

    const savedTenant = await tenant.save()

    response.status(201).json(savedTenant)
  } catch (error){
    console.error('Failed to save tenant', error)
    response.status(500).json({ error: 'Failed to save tenant' })
  }
})

module.exports = tenantsRouter