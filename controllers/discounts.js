const discountRouter = require('express').Router()
const Discount = require('../models/discount')
const Tenant = require('../models/tenant')
const helper = require('./getToken')

discountRouter.get('/all',async(request,response) => {
  const discounts = await Discount.find({})
  response.json(discounts)
})

discountRouter.get('/',async(request,response) => {
  const discounts = await Discount.find({ isApproved: true, isActive: true })
  response.json(discounts)
})

discountRouter.post('/',async(request,response) => {
  let userId
  try{
    userId = helper.getUserIdFromToken(request)
  } catch {
    return response.status(401).json({ error: 'token invalid' })
  }

  try{
    const shop = await Tenant.findById(userId,'shopID')
    const { title,description,percentage,validFrom,validTill,isActive } = request.body

    const discount = new Discount({
      shopID: shop.shopID,
      title,
      description,
      percentage,
      validFrom,
      validTill,
      isActive
    })
    await discount.save()
    response.status(201).json({ message: 'Discount submitted' })
  } catch{
    response.status(500).json({ error: 'Failed to submit discount' })
  }
})

discountRouter.put('/:id',async(request,response,next) => {
  const { status } = request.body
  try{
    const discount = await Discount.findById(request.params.id)
    if(!discount){
      return response.status(404).end()
    }
    discount.isApproved = status
    const update = await discount.save()
    return response.json(update)
  } catch(exception){
    next(exception)
  }
})

discountRouter.get('/mine',async(request,response, next) => {
  let userId

  try{
    userId = helper.getUserIdFromToken(request)
  } catch {
    return response.status(401).json({ error: 'token invalid' })
  }
  try{
    const shop = await Tenant.findById(userId,'shopID')
    const discounts = await Discount.find({ shopID : shop.shopID })
    response.json(discounts)
  }catch(exception){
    next(exception)
  }

})

discountRouter.delete('/:id', async(request,response) => {
  try{
    const discount = await Discount.findById(request.params.id)
    if(!discount){
      return response.status(404).end()
    }
    await discount.deleteOne()
    response.status(200).json({ message: 'Discount deleted successfully' })
  } catch (err) {
    console.error(err)
    response.status(500).json({ error: 'Failed to delete discount' })
  }
})
module.exports=discountRouter