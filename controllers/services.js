const serviceRouter = require('express').Router()
const Service = require('../models/service')

serviceRouter.get('/all',async(request,response) => {
  const services = await Service.find({})
  //console.log('Fetched: ',services)
  response.json(services)
})

serviceRouter.get('/',async(request,response) => {
  const services = await Service.find({ isAvailable : 'true' })
  response.json(services)
})

serviceRouter.get('/one',async(request,response) => {
  try{
    const { name } = request.query
    if(!name) {
      return response.status(400).json({ error: 'Name query parameter required' })
    }

    const service = await Service.findOne({ name })
    response.json(service)
  } catch {
    response.status(500).json({ error: 'Failed to fetch service name' })
  }
})

serviceRouter.post('/',async(request,response,next) => {
  try{
    const { name, description } = request.body
    if (!name || !description) {
      return response.status(400).json({ error: 'Name and description are required' })
    }
    const service = new Service({
      name,
      description
    })
    await service.save()
    response.status(201).json({ message: 'Service submitted' })
  } catch(error) {
    next(error)
  }
})

serviceRouter.put('/:id',async(request,response,next) => {
  const { isAvailable } = request.body
  try{
    const service = await Service.findById(request.params.id)
    if(!service){
      return response.status(404).end()
    }
    service.isAvailable=isAvailable
    const update = await service.save()
    return response.json(update)
  }catch (exception){
    next(exception)
  }
})
module.exports=serviceRouter