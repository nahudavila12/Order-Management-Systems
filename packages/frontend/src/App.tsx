import { Route, Routes } from 'react-router-dom'

import Layout from '@/components/Layout'
import CreateOrder from '@/pages/CreateOrder'
import EditOrder from '@/pages/EditOrder'
import OrderDetails from '@/pages/OrderDetails'
import OrdersList from '@/pages/OrdersList'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<OrdersList />} />
        <Route path="/orders" element={<OrdersList />} />
        <Route path="/orders/new" element={<CreateOrder />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/orders/:id/edit" element={<EditOrder />} />
      </Routes>
    </Layout>
  )
}

export default App
