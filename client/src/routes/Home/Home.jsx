import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import Sidebar from './components/Sidebar/Sidebar'
// import Editor from './components/Editor/Editor'

import './Home.scss'

const Home = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(!location.pathname.includes('/home/quiz/') && !location.pathname.includes('/home/flashcards/'));
  const [currentTab, setCurrentTab] = React.useState('Recents');

  useEffect(() => {
    if (isSidebarOpen && (location.pathname.includes('/home/quiz/') || location.pathname.includes('/home/flashcards/') || location.pathname.includes('/home/summary/'))) {
      setIsSidebarOpen(false);
    }
  }, [location, isSidebarOpen]);

  return (
    <div className='home-layout'>
      <div className={`sidebar-container ${!isSidebarOpen ? 'minimized' : ''}`}>
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>
      <div className='dashboard-container'>
        <Routes>
          <Route path="/" element={<Dashboard
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />} />
          {/* <Route path="/editor/:documentId" element={<Editor />} /> */}
        </Routes>
      </div>    
    </div>
  )
}

export default Home