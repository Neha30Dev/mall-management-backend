const employeeRouter = require('express').Router()
const bcrypt = require('bcrypt')
const Employee = require('../models/employee')

employeeRouter.get('/', async (request, response) => {
  try {
    const employees = await Employee.find({})
    response.json(employees)
  } catch (error) {
    console.error('Failed to fetch employees', error)
    response.status(500).json({ error: 'Failed to fetch employees' })
  }
})

employeeRouter.get('/:id', async (request, response) => {
  try {
    const employee = await Employee.findById(request.params.id)
    if(!employee) {
      return response.status(404).json({ error: 'Employee not found' })
    }
    response.json(employee)
  } catch (error) {
    console.error('Failed to fetch employee info', error)
    response.status(500).json({ error: 'Failed to fetch employee info' })
  }
})

employeeRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, email, phone, password } = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const employee = new Employee({
      username,
      name,
      email,
      phone,
      passwordHash,
    })

    const savedEmployee = await employee.save()

    response.status(201).json(savedEmployee)
  } catch (error){
    next(error)
  }
})

module.exports = employeeRouter