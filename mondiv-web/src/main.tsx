// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Shell from '@/layouts/Shell'
import DashboardPage from '@/pages/DashboardPage'
import PortfolioPage from '@/pages/PortfolioPage'
import SettingsPage from '@/pages/SettingsPage'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Shell>
                <Routes>
                    <Route path="/" element={<DashboardPage/>}/>
                    <Route path="/portfolio" element={<PortfolioPage/>}/>
                    <Route path="/settings" element={<SettingsPage/>}/>
                </Routes>
            </Shell>
        </BrowserRouter>
    </React.StrictMode>
)
