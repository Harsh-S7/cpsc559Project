import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard'
import Sidebar from './components/Sidebar/Sidebar'
// import Editor from './components/Editor/Editor'

import { getDocumentsByUser, getDocumentSharedWithUser, getAllDocumentsByUser } from '../../../lib/utils';

import './Home.scss'

const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [currentTab, setCurrentTab] = React.useState('Recents');
  const [documents, setDocuments] = React.useState([]);

  const fetchDocumentsByUser = async () => {
    const response = await getDocumentsByUser(localStorage.getItem('username'));
    if (response instanceof Error) {
      console.error(response);
    }
    console.log(response);
    setDocuments(response);
  }

  const fetchDocumentsSharedWithUser = async () => {
    const response = await getDocumentSharedWithUser(localStorage.getItem('username'));
    if (response instanceof Error) {
      console.error(response);
    }
    console.log(response);
    setDocuments(response);
  }

  const fetchAllDocuments = async () => {
    const response = await getAllDocumentsByUser(localStorage.getItem('username'));
    if (response instanceof Error) {
      console.error(response);
    }
    console.log(response);
    setDocuments(response);
  }

  let fetchDocuments = fetchAllDocuments;
  if (currentTab === 'Shared with me') {
    fetchDocuments = fetchDocumentsSharedWithUser;
  } else if (currentTab === 'My Documents') {
    fetchDocuments = fetchDocumentsByUser;
  }

  useEffect(() => {
    fetchDocuments();
  }, [currentTab]);

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