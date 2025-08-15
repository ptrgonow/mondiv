import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import Shell from '@/layouts/Shell'

export default function App() {
    return (
        <BrowserRouter>
            <Shell>
                <Routes>
                    <Route path="/" element={<DashboardPage/>}/>
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </Shell>
        </BrowserRouter>
    )
}
