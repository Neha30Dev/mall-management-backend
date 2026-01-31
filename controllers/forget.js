const forgetRouter = require('express').Router()
const bcrypt = require('bcrypt')

const roles = {
  customer: require('../models/customer'),
  employee: require('../models/employee'),
  tenant: require('../models/tenant')
}

forgetRouter.put('/', async (request, response) => {
  try {
    const { email, password, type } = request.body

    const User = roles[type]

    const user = await User.findOne({ email })
    if (!user)
      return response.sendStatus(200)

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    user.passwordHash = passwordHash
    await user.save()

    return response.sendStatus(200)
  } catch (error) {
    return response.status(400).json({ error: error.message })
  }
})

module.exports=forgetRouter