import React from 'react'
import Header from './components/Header/Header'
import ContentsList from './components/Content/ContentsList'

import './Dashboard.scss'

const Dashboard = (props) => {
  return (
    <div className='dashboard-container'>
      <Header
        currentTab={props.currentTab}
        setCurrentTab={props.setCurrentTab}
        isSidebarOpen={props.isSidebarOpen}
        setIsSidebarOpen={props.setIsSidebarOpen}
      />
      <ContentsList />
    </div>
  )
}

export default Dashboard