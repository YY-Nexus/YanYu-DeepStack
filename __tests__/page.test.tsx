import React from 'react'
import { render } from '@testing-library/react'
import PredictiveMaintenancePage from '../app/admin/predictive-maintenance/page'

describe('PredictiveMaintenancePage', () => {
  it('renders PredictiveMaintenanceDashboard', () => {
    const { container } = render(<PredictiveMaintenancePage />)
    expect(container.querySelector('.container')).toBeTruthy()
  })
})
