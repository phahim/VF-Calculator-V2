import React, { useState } from 'react'
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Device = {
  type: 'Phone' | 'Tablet'
  cost: number
}

type Service = {
  id: number
  price: number
  devices: Device[]
  discount: number
  hasApps: boolean
  appsCost: number
}

export default function Component() {
  const [step, setStep] = useState(0)
  const [existingServiceCount, setExistingServiceCount] = useState(0)
  const [existingServices, setExistingServices] = useState<Service[]>([])
  const [newServices, setNewServices] = useState<Service[]>([])
  const [homeInternet, setHomeInternet] = useState({
    hasService: false,
    charges: 0,
    additionalDiscount: false,
    discountAmount: 0
  })

  const deviceOptions = ['Phone', 'Tablet']

  const initializeExistingServices = () => {
    const services = Array(existingServiceCount).fill(null).map((_, index) => ({
      id: Date.now() + index,
      price: 0,
      devices: [],
      discount: 0,
      hasApps: false,
      appsCost: 0
    }))
    setExistingServices(services)
    setStep(1)
  }

  const addNewService = () => {
    setNewServices([...newServices, {
      id: Date.now(),
      price: 0,
      devices: [],
      discount: 0,
      hasApps: false,
      appsCost: 0
    }])
  }

  const calculateDiscount = (services: number) => {
    if (services === 1) return 0
    if (services === 2) return 0.05
    if (services === 3) return 0.10
    if (services === 4) return 0.15
    return 0.20
  }

  const calculateTotal = () => {
    const allServices = [...existingServices, ...newServices]
    const servicesCost = allServices.reduce((sum, service) => sum + service.price, 0)
    const devicesCost = allServices.reduce((sum, service) => 
      sum + service.devices.reduce((devSum, dev) => devSum + dev.cost, 0), 0)
    const appsCost = allServices.reduce((sum, service) => sum + service.appsCost, 0)
    
    const discount = calculateDiscount(allServices.length)
    const discountAmount = servicesCost * discount
    
    const subtotal = servicesCost - discountAmount + devicesCost + appsCost
    
    const additionalDiscountAmount = allServices.reduce((sum, service) => 
      sum + service.discount, 0)
    
    const homeInternetCharges = homeInternet.hasService ? homeInternet.charges : 0
    const homeInternetDiscount = homeInternet.additionalDiscount ? homeInternet.discountAmount : 0
    
    const total = subtotal - additionalDiscountAmount + homeInternetCharges - homeInternetDiscount

    return {
      servicesCost,
      devicesCost,
      appsCost,
      discountPercentage: discount * 100,
      discountAmount,
      additionalDiscountAmount,
      subtotal,
      homeInternetCharges,
      homeInternetDiscount,
      total
    }
  }

  const renderServiceInputs = (service: Service, index: number, isExisting: boolean) => (
    <Card key={service.id} className="mb-3 bg-gray-800 border-gray-700">
      <CardHeader className="p-3">
        <CardTitle className="text-sm">{isExisting ? `Existing Service ${index + 1}` : `New Service ${index + 1}`}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 items-center gap-2">
            <Label htmlFor={`price-${service.id}`} className="text-gray-300">Price:</Label>
            <Input
              id={`price-${service.id}`}
              type="number"
              value={service.price}
              onChange={(e) => {
                const updatedServices = isExisting ? [...existingServices] : [...newServices]
                updatedServices[index].price = parseFloat(e.target.value)
                isExisting ? setExistingServices(updatedServices) : setNewServices(updatedServices)
              }}
              className="h-8 bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300">Devices:</Label>
            <div className="grid gap-1 mt-1">
              {deviceOptions.map((deviceType) => (
                <div key={deviceType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${service.id}-${deviceType}`}
                    checked={service.devices.some(d => d.type === deviceType)}
                    onCheckedChange={(checked) => {
                      const updatedServices = isExisting ? [...existingServices] : [...newServices]
                      if (checked) {
                        updatedServices[index].devices.push({ type: deviceType as 'Phone' | 'Tablet', cost: 0 })
                      } else {
                        updatedServices[index].devices = updatedServices[index].devices.filter(d => d.type !== deviceType)
                      }
                      isExisting ? setExistingServices(updatedServices) : setNewServices(updatedServices)
                    }}
                    className="border-gray-500"
                  />
                  <Label htmlFor={`${service.id}-${deviceType}`} className="text-gray-300">{deviceType}</Label>
                  {service.devices.some(d => d.type === deviceType) && (
                    <Input
                      type="number"
                      placeholder="Cost"
                      value={service.devices.find(d => d.type === deviceType)?.cost || 0}
                      onChange={(e) => {
                        const updatedServices = isExisting ? [...existingServices] : [...newServices]
                        const deviceIndex = updatedServices[index].devices.findIndex(d => d.type === deviceType)
                        updatedServices[index].devices[deviceIndex].cost = parseFloat(e.target.value)
                        isExisting ? setExistingServices(updatedServices) : setNewServices(updatedServices)
                      }}
                      className="h-8 w-20 bg-gray-700 border-gray-600 text-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 items-center gap-2">
            <Label htmlFor={`discount-${service.id}`} className="text-gray-300">Additional Discount ($):</Label>
            <Input
              id={`discount-${service.id}`}
              type="number"
              value={service.discount}
              onChange={(e) => {
                const updatedServices = isExisting ? [...existingServices] : [...newServices]
                updatedServices[index].discount = parseFloat(e.target.value)
                isExisting ? setExistingServices(updatedServices) : setNewServices(updatedServices)
              }}
              className="h-8 bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`apps-${service.id}`}
              checked={service.hasApps}
              onCheckedChange={(checked) => {
                const updatedServices = isExisting ? [...existingServices] : [...newServices]
                updatedServices[index].hasApps = checked as boolean
                if (!checked) {
                  updatedServices[index].appsCost = 0
                }
                isExisting ? setExistingServices(updatedServices) : setNewServices(updatedServices)
              }}
              className="border-gray-500"
            />
            <Label htmlFor={`apps-${service.id}`} className="text-gray-300">Apps</Label>
            {service.hasApps && (
              <Input
                type="number"
                placeholder="Total Apps Cost"
                value={service.appsCost}
                onChange={(e) => {
                  const updatedServices = isExisting ? [...existingServices] : [...newServices]
                  updatedServices[index].appsCost = parseFloat(e.target.value)
                  isExisting ? setExistingServices(updatedServices) : setNewServices(updatedServices)
                }}
                className="h-8 w-32 bg-gray-700 border-gray-600 text-white"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStep0 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-gray-200">How many existing services do CX have?</h2>
      <div className="flex items-center space-x-3">
        <Input
          type="number"
          value={existingServiceCount}
          onChange={(e) => setExistingServiceCount(parseInt(e.target.value))}
          min={0}
          className="w-20 h-8 bg-gray-700 border-gray-600 text-white"
        />
        <Button onClick={initializeExistingServices} size="sm" variant="secondary">Next</Button>
      </div>
    </div>
  )

  const renderStep1 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-gray-200">Existing Services</h2>
      {existingServices.map((service, index) => renderServiceInputs(service, index, true))}
      <div className="flex justify-between mt-3">
        <Button onClick={() => setStep(0)} size="sm" variant="secondary">
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button onClick={() => setStep(2)} size="sm" variant="default">
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div>
      <h2 className="text-xl font-semibold mb-3 text-gray-200">New Services</h2>
      {newServices.map((service, index) => renderServiceInputs(service, index, false))}
      <Button onClick={addNewService} size="sm" variant="secondary" className="mb-3">
        <Plus className="mr-1 h-4 w-4" /> Add New Service
      </Button>
      {renderHomeInternetSection()}
      <div className="flex justify-between mt-3">
        <Button onClick={() => setStep(1)} size="sm" variant="secondary">
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button onClick={() => setStep(3)} size="sm" variant="default">
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  const renderStep3 = () => {
    const totals = calculateTotal()
    return (
      <div>
        <h2 className="text-xl font-semibold mb-3 text-gray-200">Review and Calculate</h2>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="p-3">
            <CardTitle className="text-sm text-gray-200">Bill Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid gap-1 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Base cost of services:</span>
                <span>${totals.servicesCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total for devices:</span>
                <span>${totals.devicesCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total for apps:</span>
                <span>${totals.appsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Discount applied ({totals.discountPercentage}%):</span>
                <span>-${totals.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Additional discount:</span>
                <span>-${totals.additionalDiscountAmount.toFixed(2)}</span>
              </div>
              {homeInternet.hasService && (
                <>
                  <div className="flex justify-between text-gray-300">
                    <span>Home Internet Charges:</span>
                    <span>${totals.homeInternetCharges.toFixed(2)}</span>
                  </div>
                  {homeInternet.additionalDiscount && (
                    <div className="flex justify-between text-gray-200">
                      <span>Home Internet Discount:</span>
                      <span>-${totals.homeInternetDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-lg font-semibold mt-2 text-white">
                <span>Final Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between mt-3">
          <Button onClick={() => setStep(2)} size="sm" variant="secondary">
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
        </div>
        <p className="text-xs text-center mt-4 text-gray-400">
          Service Calculation System designed by p h a h i m
        </p>
      </div>
    )
  }

  const renderHomeInternetSection = () => (
    <Card className="mb-3 bg-gray-800 border-gray-700">
      <CardHeader className="p-3">
        <CardTitle className="text-sm">Home Internet</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has-home-internet"
              checked={homeInternet.hasService}
              onCheckedChange={(checked) => setHomeInternet(prev => ({ ...prev, hasService: checked as boolean }))}
              className="border-gray-500"
            />
            <Label htmlFor="has-home-internet" className="text-gray-300">Do CX have Home Internet?</Label>
          </div>
          {homeInternet.hasService && (
            <>
              <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="home-internet-charges" className="text-gray-300">Monthly Charges:</Label>
                <Input
                  id="home-internet-charges"
                  type="number"
                  value={homeInternet.charges}
                  onChange={(e) => setHomeInternet(prev => ({ ...prev, charges: parseFloat(e.target.value) }))}
                  className="h-8 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="home-internet-discount"
                  checked={homeInternet.additionalDiscount}
                  onCheckedChange={(checked) => setHomeInternet(prev => ({ ...prev, additionalDiscount: checked as boolean }))}
                  className="border-gray-500"
                />
                <Label htmlFor="home-internet-discount" className="text-gray-300">Additional Discount?</Label>
              </div>
              {homeInternet.additionalDiscount && (
                <div className="grid grid-cols-2 items-center gap-2">
                  <Label htmlFor="home-internet-discount-amount" className="text-gray-300">Discount Amount:</Label>
                  <Input
                    id="home-internet-discount-amount"
                    type="number"
                    value={homeInternet.discountAmount}
                    onChange={(e) => setHomeInternet(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) }))}
                    className="h-8 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-100">Service Pricing Calculator</h1>
      {step === 0 && renderStep0()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  )
}