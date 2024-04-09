import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import Sidebar from './components/Sidebar/Sidebar'
// import Editor from './components/Editor/Editor'

import { getDocumentsByUser } from '../../../lib/utils';

import './Home.scss'

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [currentTab, setCurrentTab] = React.useState('Recents');
  const [documents, setDocuments] = React.useState([]);

  const fetchDocuments = async () => {
    const response = await getDocumentsByUser(localStorage.getItem('username'));
    if (response instanceof Error) {
      console.error(response);
    }
    console.log(response);
    setDocuments(response);
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

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
              documents={documents}
              fetchDocuments={fetchDocuments}
            />} />
        </Routes>
      </div>    
    </div>
  )
}

export default Home