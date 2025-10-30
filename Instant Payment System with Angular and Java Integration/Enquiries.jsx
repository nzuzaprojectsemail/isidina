import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { HelpCircle, Send, MessageSquare, Clock, CheckCircle, AlertCircle, X } from 'lucide-react'

export function Enquiries({ onBack }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  })

  const [enquiries, setEnquiries] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('new')

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/enquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data)
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert('Please fill in all fields')
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`
        },
        body: new URLSearchParams({
          subject: formData.subject,
          message: formData.message
        })
      })

      if (response.ok) {
        alert('Enquiry submitted successfully!')
        setFormData({ subject: '', message: '' })
        fetchEnquiries() // Refresh the list
        setActiveTab('history') // Switch to history tab
      } else {
        const error = await response.text()
        alert(`Failed to submit enquiry: ${error}`)
      }
    } catch (error) {
      alert('Connection error. Please try again.')
      console.error('Enquiry submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enquiries</h2>
          <p className="text-gray-600">Submit questions or view your enquiry history</p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <X className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Enquiry</TabsTrigger>
          <TabsTrigger value="history">Enquiry History</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Submit New Enquiry</span>
              </CardTitle>
              <CardDescription>
                Have a question or need assistance? Submit your enquiry below and our team will get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief description of your enquiry"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Please provide detailed information about your enquiry..."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <Clock className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Enquiry'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Your Enquiries</span>
              </CardTitle>
              <CardDescription>
                View the status and details of your submitted enquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries yet</h3>
                  <p className="text-gray-500 mb-4">
                    You haven't submitted any enquiries. Click on "New Enquiry" to get started.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('new')}
                    className="flex items-center space-x-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Submit Your First Enquiry</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enquiry, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{enquiry.subject}</CardTitle>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              {getStatusIcon(enquiry.status)}
                              <span>
                                Submitted on {new Date(enquiry.submissionDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {getStatusBadge(enquiry.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Message:</Label>
                            <p className="text-sm text-gray-600 mt-1">{enquiry.message}</p>
                          </div>
                          
                          {enquiry.response && (
                            <>
                              <Separator />
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Response:</Label>
                                <p className="text-sm text-gray-600 mt-1">{enquiry.response}</p>
                                {enquiry.responseDate && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Responded on {new Date(enquiry.responseDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </>
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
      </Tabs>
    </div>
  )
}
