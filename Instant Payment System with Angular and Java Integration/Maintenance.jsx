import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { 
  Settings, 
  User, 
  Users, 
  Building, 
  History, 
  Key, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

export function Maintenance({ onBack }) {
  const [activeTab, setActiveTab] = useState('account')
  const [showPassword, setShowPassword] = useState(false)
  const [userProfile, setUserProfile] = useState({})
  const [transactions, setTransactions] = useState([])
  const [users, setUsers] = useState([])
  const [organizations, setOrganizations] = useState([])
  
  // Forms state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    idPassport: '',
    physicalAddress: '',
    cellNumber: ''
  })
  
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    address: '',
    contactPerson: '',
    contactNumber: ''
  })

  useEffect(() => {
    fetchUserProfile()
    fetchTransactionHistory()
    // Only fetch admin data if user has admin privileges
    fetchUsers()
    fetchOrganizations()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const response = await fetch(`http://localhost:8080/api/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  const fetchTransactionHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const response = await fetch(`http://localhost:8080/api/transactions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/admin/organizations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match.')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        alert('Password updated successfully!')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.text()
        alert(`Failed to update password: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUserForm)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`User created successfully! User ID: ${result.userId}`)
        setNewUserForm({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          idPassport: '',
          physicalAddress: '',
          cellNumber: ''
        })
        fetchUsers() // Refresh users list
      } else {
        const error = await response.text()
        alert(`Failed to create user: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    }
  }

  const handleCreateOrganization = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:8080/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrgForm)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Organization created successfully! Organization ID: ${result.organizationId}`)
        setNewOrgForm({
          name: '',
          address: '',
          contactPerson: '',
          contactNumber: ''
        })
        fetchOrganizations() // Refresh organizations list
      } else {
        const error = await response.text()
        alert(`Failed to create organization: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'send':
        return 'bg-blue-100 text-blue-800'
      case 'full_withdrawal':
        return 'bg-red-100 text-red-800'
      case 'partial_withdrawal':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Maintenance</h2>
        <p className="text-gray-600">Account information and system administration</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Account Info</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        {/* Account Information Tab */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                View your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={userProfile.email || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input value={userProfile.id || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={userProfile.firstName || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={userProfile.lastName || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>ID/Passport</Label>
                  <Input value={userProfile.idPassport || ''} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Cell Number</Label>
                  <Input value={userProfile.cellNumber || ''} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Input value={userProfile.physicalAddress || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Account Created</Label>
                <Input value={userProfile.createdAt ? formatDate(userProfile.createdAt) : ''} readOnly />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Transaction History</span>
              </CardTitle>
              <CardDescription>
                View all your transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Yet</h3>
                  <p className="text-gray-600">You haven't made any transactions yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <Card key={transaction.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge className={getTransactionTypeColor(transaction.transactionType)}>
                              {transaction.transactionType?.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="font-medium">R{transaction.amount?.toFixed(2)}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Voucher:</span>
                            <span className="ml-2 font-mono">{transaction.voucherNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className="ml-2">{transaction.status}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Receiver:</span>
                            <span className="ml-2">{transaction.receiverCellNumber}</span>
                          </div>
                          {transaction.commissionAmount && (
                            <div>
                              <span className="text-gray-500">Commission:</span>
                              <span className="ml-2">R{transaction.commissionAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management</span>
              </CardTitle>
              <CardDescription>
                Create and manage user accounts (Administrator only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New User Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New User</span>
                </h4>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Email"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="First Name"
                      value={newUserForm.firstName}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={newUserForm.lastName}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="ID/Passport"
                      value={newUserForm.idPassport}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, idPassport: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Cell Number"
                      value={newUserForm.cellNumber}
                      onChange={(e) => setNewUserForm(prev => ({ ...prev, cellNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Physical Address"
                    value={newUserForm.physicalAddress}
                    onChange={(e) => setNewUserForm(prev => ({ ...prev, physicalAddress: e.target.value }))}
                    required
                  />
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </form>
              </div>

              {/* Users List */}
              <div>
                <h4 className="font-medium mb-4">Existing Users ({users.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Balance: R{user.balance?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Organizations/Outlets</span>
              </CardTitle>
              <CardDescription>
                Manage organizations and outlets (Administrator only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Create New Organization Form */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create New Organization</span>
                </h4>
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Organization Name"
                      value={newOrgForm.name}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="Contact Person"
                      value={newOrgForm.contactPerson}
                      onChange={(e) => setNewOrgForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Address"
                    value={newOrgForm.address}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Contact Number"
                    value={newOrgForm.contactNumber}
                    onChange={(e) => setNewOrgForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                  <Button type="submit" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </form>
              </div>

              {/* Organizations List */}
              <div>
                <h4 className="font-medium mb-4">Existing Organizations ({organizations.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {organizations.map((org) => (
                    <div key={org.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.address}</div>
                      {org.contactPerson && (
                        <div className="text-sm text-gray-500">
                          Contact: {org.contactPerson} {org.contactNumber && `(${org.contactNumber})`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Management Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>Password Management</span>
              </CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
