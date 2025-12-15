import './Employee.css'

function Employee() {
  const employees = [
    {
      id: 'EMP001',
      name: 'Harry Porter',
      designation: 'Systems Manager',
      department: 'Technology',
      salary: '$85,000',
      email: 'harry.porter@company.com',
      mobile: '+1 234 567 8900',
      dateOfJoining: '1 March, 2023'
    },
    {
      id: 'EMP002',
      name: 'Lary Go',
      designation: 'Product Manager',
      department: 'Product',
      salary: '$95,000',
      email: 'lary.go@company.com',
      mobile: '+1 234 567 8901',
      dateOfJoining: '12 April, 2023'
    },
    {
      id: 'EMP003',
      name: 'Sumona Gang',
      designation: 'UX Designer',
      department: 'Design',
      salary: '$78,000',
      email: 'sumona.gang@company.com',
      mobile: '+1 234 567 8902',
      dateOfJoining: '8 May, 2023'
    },
    {
      id: 'EMP004',
      name: 'David Morph',
      designation: 'Data Analyst',
      department: 'Analytics',
      salary: '$82,000',
      email: 'david.morph@company.com',
      mobile: '+1 234 567 8903',
      dateOfJoining: '22 June, 2023'
    }
  ]

  return (
    <div className="employee-page">
      <h1 className="page-title">Employees</h1>

      <div className="employee-section">
        <h2 className="section-heading">Employee Details</h2>

        <div className="employee-cards">
          {employees.map((emp) => (
            <div key={emp.id} className="employee-card">
              <div className="employee-card-header">
                <div>
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-designation">{emp.designation}</div>
                </div>
                <div className="employee-id">{emp.id}</div>
              </div>

              <div className="employee-info-grid">
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{emp.department}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Salary</span>
                  <span className="info-value">{emp.salary}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{emp.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Mobile</span>
                  <span className="info-value">{emp.mobile}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Date of Joining</span>
                  <span className="info-value">{emp.dateOfJoining}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Employee

