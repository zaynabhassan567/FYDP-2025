import { useState } from 'react'
import SearchFilters from './components/SearchFilters/SearchFilters'
import EmployeeTable from './components/EmployeeTable/EmployeeTable'
import Pagination from './components/Pagination/Pagination'
import './Employee.css'

function Employee() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    id: '',
    designation: ''
  })

  // Sample employee data
  const [employees, setEmployees] = useState([
    {
      id: 'EMP001',
      name: 'Harry Porter',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP002',
      name: 'Lary go',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP003',
      name: 'Sumona Gang',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP004',
      name: 'David Morph',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP005',
      name: 'Willium Cany',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP006',
      name: 'Keny Dinen',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP007',
      name: 'Frintim Zomata',
      email: 'anjoli@gmail.com',
      department: 'Technology',
      designation: 'Systems manager',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    }
  ])

  const itemsPerPage = 5
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = employees.slice(startIndex, endIndex)

  const handleDelete = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  const handleInputChange = (field, value) => {
    setSearchFilters({
      ...searchFilters,
      [field]: value
    })
  }

  const handleFilterClick = () => {
    // Filter logic can be implemented here
    console.log('Filter clicked', searchFilters)
  }

  const handleAddEmployee = () => {
    alert('Add Employee functionality - to be implemented')
  }

  const handleEdit = (employee) => {
    alert(`Edit ${employee.name} - to be implemented`)
  }

  return (
    <div className="employee-page">
      <h1 className="page-title">Hello Thomas</h1>
      
      <div className="employee-section">
        <h2 className="section-heading">Employee</h2>
        
        <SearchFilters
          searchFilters={searchFilters}
          onInputChange={handleInputChange}
          onFilterClick={handleFilterClick}
          onAddEmployee={handleAddEmployee}
        />

        <EmployeeTable
          employees={currentEmployees}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default Employee

